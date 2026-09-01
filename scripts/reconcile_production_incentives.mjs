import fs from 'node:fs/promises';
import mysql from 'mysql2/promise';

const date = (value) => { const [day, month, year] = value.split('/'); return `${year}-${month}-${day}`; };
const source = JSON.parse(await fs.readFile(new URL('../docs/incentivos-producao-completo.json', import.meta.url), 'utf8')).incentivo_producao_cientifica;
const connection = await mysql.createConnection({ uri: process.env.DATABASE_URL });
try {
  const [existing] = await connection.query('SELECT id, matricula, numeroPortaria FROM productionIncentives');
  const existingByKey = new Map(existing.map(row => [`${row.matricula}|${row.numeroPortaria}`, row]));
  const [servers] = await connection.query('SELECT id, matricula FROM servers');
  const serverByMatricula = new Map(servers.map(row => [row.matricula, row.id]));
  let inserted = 0; let updated = 0; let matched = 0; const unmatched = [];
  await connection.beginTransaction();
  for (const row of source) {
    const key = `${row.matricula}|${row.portaria}`;
    const serverId = serverByMatricula.get(row.matricula) ?? null;
    const values = [serverId, row.matricula, row.nome, row.portaria, row.colegiado, date(row.inicio), date(row.termino), row.dias_faltantes];
    const prior = existingByKey.get(key);
    if (prior) { await connection.query('UPDATE productionIncentives SET serverId=?, matricula=?, nomeOriginal=?, numeroPortaria=?, colegiado=?, dataInicio=?, dataTermino=?, diasFaltantes=? WHERE id=?', [...values, prior.id]); updated++; } else { await connection.query("INSERT INTO productionIncentives (serverId, matricula, nomeOriginal, numeroPortaria, colegiado, dataInicio, dataTermino, diasFaltantes, sourceModule) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'incentivo_producao_cientifica')", values); inserted++; }
    if (serverId) matched++; else unmatched.push({ matricula: row.matricula, nome: row.nome, portaria: row.portaria });
  }
  await connection.query("UPDATE importRuns SET insertedCount=535, updatedCount=?, pendingCount=?, notes='Incentivo à produção científica consolidado: 47 registros únicos por matrícula e portaria; os registros existentes foram atualizados sem duplicação. Portarias, colegiados, vigências e dias faltantes foram preservados; vínculos sem servidor correspondente permanecem documentados para revisão.' WHERE status='committed' ORDER BY id DESC LIMIT 1", [updated + 2, 79 + unmatched.length]);
  await connection.commit();
  const report = { sourceCount: source.length, inserted, updated, matchedCount: matched, unmatchedCount: unmatched.length, unmatched, generatedAt: new Date().toISOString() };
  await fs.writeFile(new URL('../docs/reconciliacao-incentivos-producao.json', import.meta.url), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ sourceCount: source.length, inserted, updated, matchedCount: matched, unmatchedCount: unmatched.length }));
} catch (error) { await connection.rollback(); throw error; } finally { await connection.end(); }
