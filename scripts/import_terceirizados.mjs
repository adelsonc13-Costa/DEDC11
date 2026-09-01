import fs from "node:fs";
import mysql from "mysql2/promise";

const sourceModule = "declaracoes-frequencia-terceirizados";
const input = JSON.parse(fs.readFileSync("docs/declaracoes-frequencia-terceirizados.json", "utf8"));
const declarations = input.declaracoes_frequencia ?? [];
const rows = declarations.flatMap((declaration) => declaration.funcionarios.map((employee) => ({
  ...employee,
  empresa: declaration.empresa,
  contrato: declaration.contrato,
  pagina: declaration.pagina,
  mesReferencia: declaration.mes_referencia,
  dataEmissao: declaration.data_emissao,
})));
const normalize = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]+/g, " ").trim().replace(/\s+/g, " ");
const connection = await mysql.createConnection(process.env.DATABASE_URL);
let insertedPeople = 0;
let updatedPeople = 0;
let insertedFrequencies = 0;
let linkedContacts = 0;
let insertedContacts = 0;
try {
  await connection.beginTransaction();
  const [existingPeople] = await connection.query("SELECT * FROM terceirizados");
  const peopleByName = new Map(existingPeople.map((person) => [person.nomeNormalizado, person]));
  const uniqueRows = new Map();
  for (const row of rows) uniqueRows.set(normalize(row.nome), row);
  for (const row of uniqueRows.values()) {
    const key = normalize(row.nome);
    const existing = peopleByName.get(key);
    let personId;
    if (existing) {
      personId = existing.id;
      await connection.query("UPDATE terceirizados SET cargoFuncao=COALESCE(NULLIF(?, ''), cargoFuncao), setor=COALESCE(NULLIF(?, ''), setor), empresa=COALESCE(NULLIF(?, ''), empresa), contrato=COALESCE(NULLIF(?, ''), contrato), updatedAt=CURRENT_TIMESTAMP WHERE id=?", [row.funcao, "UNEB – Campus XI", row.empresa, row.contrato, personId]);
      updatedPeople += 1;
    } else {
      const [result] = await connection.query("INSERT INTO terceirizados (nomeOriginal,nomeNormalizado,cargoFuncao,setor,localLotacao,empresa,contrato,situacaoContrato,sourceModule) VALUES (?,?,?,?,?,?,?,?,?)", [row.nome, key, row.funcao || null, "UNEB – Campus XI", "UNEB – Campus XI", row.empresa, row.contrato, "Sem vigência informada", sourceModule]);
      personId = result.insertId;
      peopleByName.set(key, { id: personId, nomeNormalizado: key });
      insertedPeople += 1;
    }
    const [frequency] = await connection.query("SELECT id FROM frequenciasTerceirizados WHERE terceirizadoId=? AND contrato=? AND mesReferencia=? LIMIT 1", [personId, row.contrato, row.mesReferencia]);
    if (!frequency.length) {
      await connection.query("INSERT INTO frequenciasTerceirizados (terceirizadoId,nomeOriginal,empresa,contrato,pagina,mesReferencia,dataEmissao,funcao,turno,ocorrencias,dias,substituto,sourceModule) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)", [personId, row.nome, row.empresa, row.contrato, row.pagina, row.mesReferencia, row.dataEmissao, row.funcao || null, row.turno || null, row.ocorrencias || null, row.dias || null, row.substituto || null, sourceModule]);
      insertedFrequencies += 1;
    }
  }
  const [existingContacts] = await connection.query("SELECT id,nomeOriginal,terceirizadoId FROM contacts");
  const contactsByName = new Map(existingContacts.map((contact) => [normalize(contact.nomeOriginal), contact]));
  for (const person of peopleByName.values()) {
    const contact = contactsByName.get(person.nomeNormalizado);
    if (contact && !contact.terceirizadoId) {
      await connection.query("UPDATE contacts SET terceirizadoId=? WHERE id=?", [person.id, contact.id]);
      linkedContacts += 1;
    } else if (!contact) {
      const row = uniqueRows.get(person.nomeNormalizado);
      await connection.query("INSERT INTO contacts (terceirizadoId,nomeOriginal,setorOriginal,sourceModule) VALUES (?,?,?,?)", [person.id, row.nome, "UNEB – Campus XI", sourceModule]);
      insertedContacts += 1;
    }
  }
  await connection.commit();
  console.log(JSON.stringify({ declarations: declarations.length, sourceEmployees: rows.length, uniqueEmployees: uniqueRows.size, insertedPeople, updatedPeople, insertedFrequencies, linkedContacts, insertedContacts }));
} catch (error) {
  await connection.rollback();
  console.error(error);
  process.exitCode = 1;
} finally {
  await connection.end();
}
