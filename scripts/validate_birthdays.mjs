import fs from "node:fs";
const source = JSON.parse(fs.readFileSync("docs/relatorio-datas-nascimento.json", "utf8"));
const rows = source.relatorio_datas_nascimento ?? [];
const normalize = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]+/g, " ").trim().replace(/\s+/g, " ");
const counts = {};
const names = new Map();
const invalidDates = [];
for (const row of rows) {
  counts[row.cargo] = (counts[row.cargo] ?? 0) + 1;
  const key = normalize(row.nome);
  names.set(key, (names.get(key) ?? 0) + 1);
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(row.nascimento)) invalidDates.push(row);
}
const duplicates = [...names.entries()].filter(([, count]) => count > 1);
console.log(JSON.stringify({ total: rows.length, byCargo: counts, duplicateNames: duplicates, invalidDates: invalidDates.length, missingPhone: rows.filter(row => !row.telefone).length, missingEmail: rows.filter(row => !row.email).length }, null, 2));
