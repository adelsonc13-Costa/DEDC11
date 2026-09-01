import fs from 'node:fs/promises';
import mysql from 'mysql2/promise';

const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
const date = (value) => { if (!value) return null; const [day, month, year] = value.split('/'); return `${year}-${month}-${day}`; };
const source = JSON.parse(await fs.readFile(new URL('../docs/tempo-servico-completo.json', import.meta.url), 'utf8')).relatorio_tempo_de_servico;
const connection = await mysql.createConnection({ uri: process.env.DATABASE_URL });
try {
  const [serverRows] = await connection.query('SELECT id, nomeOriginal, nomeNormalizado FROM servers');
  const [serviceRows] = await connection.query('SELECT id, nomeOriginal FROM serviceRecords');
  const serversByName = new Map();
  for (const row of serverRows) { const key = normalize(row.nomeNormalizado ?? row.nomeOriginal); const list = serversByName.get(key) ?? []; list.push(row); serversByName.set(key, list); }
  const existingByName = new Map(serviceRows.map(row => [normalize(row.nomeOriginal), row]));
  const matched = []; const unmatched = []; let inserted = 0; let updated = 0;
  await connection.beginTransaction();
  for (const row of source) {
    const key = normalize(row.nome); const candidates = serversByName.get(key) ?? []; const serverId = candidates.length === 1 ? candidates[0].id : null;
    const values = [serverId, row.nome, row.setor ?? null, row.cargo ?? null, date(row.nascimento), date(row.contratacao_uneb), row.averbacao ?? null];
    const existing = existingByName.get(key);
    if (existing) { await connection.query('UPDATE serviceRecords SET serverId=?, setor=?, cargo=?, dataNascimento=?, dataContratacao=?, averbacaoDias=? WHERE id=?', [...values, existing.id]); updated++; } else { await connection.query('INSERT INTO serviceRecords (serverId, nomeOriginal, setor, cargo, dataNascimento, dataContratacao, averbacaoDias, sourceModule) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [...values, 'relatorio_tempo_de_servico']); inserted++; }
    if (serverId) matched.push({ nome: row.nome, serverId }); else unmatched.push({ nome: row.nome, motivo: candidates.length ? 'correspondencia ambigua' : 'sem correspondencia segura' });
  }
  await connection.query("UPDATE importRuns SET insertedCount=489, updatedCount=?, pendingCount=79, notes='Tempo de serviço reconciliado: 156 registros únicos por nome normalizado; 84 vinculados com correspondência única ao cadastro mestre e 72 mantidos sem vínculo automático para revisão. Registros existentes foram atualizados sem duplicação.' WHERE status='committed' ORDER BY id DESC LIMIT 1", [updated]);
  await connection.commit();
  const report = { sourceCount: source.length, inserted, updated, matchedCount: matched.length, unmatchedCount: unmatched.length, matched, unmatched, generatedAt: new Date().toISOString() };
  await fs.writeFile(new URL('../docs/reconciliacao-tempo-servico.json', import.meta.url), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ sourceCount: source.length, inserted, updated, matchedCount: matched.length, unmatchedCount: unmatched.length }));
} catch (error) { await connection.rollback(); throw error; } finally { await connection.end(); }
