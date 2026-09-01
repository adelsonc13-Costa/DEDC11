import fs from 'node:fs/promises';
import mysql from 'mysql2/promise';

const sqlFile = process.argv[2] ?? 'import-commit.sql';
const sql = await fs.readFile(new URL(`../docs/${sqlFile}`, import.meta.url), 'utf8');
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL ausente');
const connection = await mysql.createConnection({ uri: process.env.DATABASE_URL, multipleStatements: true });
try {
  await connection.query(sql);
  const [rows] = await connection.query(`
    SELECT
      (SELECT COUNT(*) FROM servers) AS servers,
      (SELECT COUNT(*) FROM contacts) AS contacts,
      (SELECT COUNT(*) FROM serviceRecords) AS serviceRecords,
      (SELECT COUNT(*) FROM interns) AS interns,
      (SELECT COUNT(*) FROM functionalActs) AS functionalActs,
      (SELECT COUNT(*) FROM productionIncentives) AS productionIncentives,
      (SELECT COUNT(*) FROM importRuns WHERE status='committed') AS committedRuns
  `);
  console.log(JSON.stringify(rows[0]));
} finally {
  await connection.end();
}
