import fs from 'node:fs/promises';
import mysql from 'mysql2/promise';

const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
const source = JSON.parse(await fs.readFile(new URL('../docs/contatos-completo.json', import.meta.url), 'utf8')).relatorio_de_contatos;
const connection = await mysql.createConnection({ uri: process.env.DATABASE_URL });
try {
  const [serverRows] = await connection.query('SELECT id, nomeOriginal, nomeNormalizado FROM servers');
  const [contactRows] = await connection.query('SELECT id, nomeOriginal, serverId FROM contacts');
  const byName = new Map();
  for (const server of serverRows) {
    const key = normalize(server.nomeNormalizado ?? server.nomeOriginal);
    const list = byName.get(key) ?? [];
    list.push(server);
    byName.set(key, list);
  }
  const sourceKeys = new Set(source.map(row => normalize(row.nome)));
  const matched = [];
  const unmatched = [];
  await connection.beginTransaction();
  for (const contact of contactRows) {
    const key = normalize(contact.nomeOriginal);
    const candidates = byName.get(key) ?? [];
    if (candidates.length === 1) {
      await connection.execute('UPDATE contacts SET serverId=? WHERE id=?', [candidates[0].id, contact.id]);
      matched.push({ contactId: contact.id, nome: contact.nomeOriginal, serverId: candidates[0].id, nomeServidor: candidates[0].nomeOriginal });
    } else {
      unmatched.push({ contactId: contact.id, nome: contact.nomeOriginal, motivo: candidates.length ? 'correspondencia ambigua' : 'sem correspondencia segura' });
    }
  }
  await connection.commit();
  const report = { sourceCount: source.length, normalizedSourceKeys: sourceKeys.size, matchedCount: matched.length, unmatchedCount: unmatched.length, matched, unmatched, generatedAt: new Date().toISOString() };
  await fs.writeFile(new URL('../docs/reconciliacao-contatos.json', import.meta.url), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ sourceCount: report.sourceCount, matchedCount: report.matchedCount, unmatchedCount: report.unmatchedCount }));
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.end();
}
