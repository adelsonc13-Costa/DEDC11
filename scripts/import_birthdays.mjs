import fs from "node:fs";
import mysql from "mysql2/promise";

const sourceModule = "relatorio-datas-nascimento";
const source = JSON.parse(fs.readFileSync("docs/relatorio-datas-nascimento.json", "utf8"));
const rows = source.relatorio_datas_nascimento ?? [];
const normalize = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]+/g, " ").trim().replace(/\s+/g, " ");
const toDate = (value) => { const [day, month, year] = value.split("/"); return `${year}-${month}-${day}`; };
const db = await mysql.createConnection(process.env.DATABASE_URL);
let updatedServers = 0, updatedInterns = 0, updatedContractors = 0, updatedService = 0, updatedContacts = 0, insertedContacts = 0, pending = 0;
const conflicts = [];
try {
  await db.beginTransaction();
  const [servers] = await db.query("SELECT id,nomeOriginal,nomeNormalizado FROM servers");
  const [interns] = await db.query("SELECT id,nomeOriginal,matricula FROM interns");
  const [contractors] = await db.query("SELECT id,nomeOriginal,nomeNormalizado FROM terceirizados");
  const [services] = await db.query("SELECT id,serverId,nomeOriginal FROM serviceRecords");
  const [contacts] = await db.query("SELECT id,serverId,terceirizadoId,nomeOriginal FROM contacts");
  const index = (items) => { const map = new Map(); for (const item of items) { const key = normalize(item.nomeNormalizado || item.nomeOriginal); const list = map.get(key) ?? []; list.push(item); map.set(key, list); } return map; };
  const serverIndex = index(servers), internIndex = index(interns), contractorIndex = index(contractors), serviceIndex = index(services), contactIndex = index(contacts);
  const contactFor = (serverId, contractorId, key) => contacts.find(contact => (serverId && contact.serverId === serverId) || (contractorId && contact.terceirizadoId === contractorId) || normalize(contact.nomeOriginal) === key);
  for (const row of rows) {
    const key = normalize(row.nome);
    const birthDate = toDate(row.nascimento);
    let identity = null;
    if (row.cargo === "Estagiário") {
      let matches = internIndex.get(key) ?? [];
      if (key === normalize("SUELEN MENEZES DOS SANTOS") && matches.length > 1) {
        const preferred = matches.find(item => item.matricula === "92181439");
        matches = preferred ? [preferred] : [];
        conflicts.push(`${row.nome}: duas datas na fonte; aplicado ao cadastro 92181439 conforme reconciliação autorizada.`);
      }
      if (matches.length !== 1) { pending += 1; continue; }
      identity = { kind: "intern", id: matches[0].id };
      await db.query("UPDATE interns SET dataNascimento=? WHERE id=?", [birthDate, matches[0].id]);
      updatedInterns += 1;
    } else if (row.cargo === "Terceirizado") {
      const matches = contractorIndex.get(key) ?? [];
      if (matches.length !== 1) { pending += 1; conflicts.push(`${row.nome}: terceirizado sem registro mestre correspondente.`); continue; }
      identity = { kind: "contractor", id: matches[0].id };
      await db.query("UPDATE terceirizados SET dataNascimento=?, telefone=COALESCE(NULLIF(?, ''), telefone), email=COALESCE(NULLIF(?, ''), email), setor=COALESCE(NULLIF(?, ''), setor), updatedAt=CURRENT_TIMESTAMP WHERE id=?", [birthDate, row.telefone, row.email, row.setor, matches[0].id]);
      updatedContractors += 1;
    } else {
      const matches = serverIndex.get(key) ?? [];
      if (matches.length !== 1) { pending += 1; conflicts.push(`${row.nome}: servidor sem correspondência única no cadastro mestre.`); continue; }
      identity = { kind: "server", id: matches[0].id };
      await db.query("UPDATE servers SET dataNascimento=? WHERE id=?", [birthDate, matches[0].id]);
      updatedServers += 1;
      const serviceMatches = (serviceIndex.get(key) ?? []).filter(item => !item.serverId || item.serverId === matches[0].id);
      if (serviceMatches.length) { await db.query("UPDATE serviceRecords SET dataNascimento=? WHERE id=?", [birthDate, serviceMatches[0].id]); updatedService += 1; }
    }
    const contact = contactFor(identity.kind === "server" ? identity.id : null, identity.kind === "contractor" ? identity.id : null, key);
    if (contact) {
      await db.query("UPDATE contacts SET telefoneOriginal=COALESCE(NULLIF(?, ''), telefoneOriginal), emailOriginal=COALESCE(NULLIF(?, ''), emailOriginal), setorOriginal=COALESCE(NULLIF(?, ''), setorOriginal) WHERE id=?", [row.telefone, row.email, row.setor, contact.id]);
      updatedContacts += 1;
    } else if (identity.kind === "server") {
      await db.query("INSERT INTO contacts (serverId,nomeOriginal,setorOriginal,telefoneOriginal,emailOriginal,sourceModule) VALUES (?,?,?,?,?,?)", [identity.id, row.nome, row.setor, row.telefone, row.email, sourceModule]);
      insertedContacts += 1;
    } else if (identity.kind === "contractor") {
      await db.query("INSERT INTO contacts (terceirizadoId,nomeOriginal,setorOriginal,telefoneOriginal,emailOriginal,sourceModule) VALUES (?,?,?,?,?,?)", [identity.id, row.nome, row.setor, row.telefone, row.email, sourceModule]);
      insertedContacts += 1;
    }
  }
  const notes = JSON.stringify({ total: rows.length, updatedServers, updatedInterns, updatedContractors, updatedService, updatedContacts, insertedContacts, pending, conflicts });
  await db.query("INSERT INTO importRuns (source,version,status,insertedCount,updatedCount,pendingCount,notes) VALUES (?,?,?,?,?,?,?)", [sourceModule, "2026-08-21", "committed", insertedContacts, updatedServers + updatedInterns + updatedContractors + updatedService + updatedContacts, pending, notes]);
  await db.commit();
  console.log(JSON.stringify({ total: rows.length, updatedServers, updatedInterns, updatedContractors, updatedService, updatedContacts, insertedContacts, pending, conflicts }));
} catch (error) {
  await db.rollback();
  console.error(error);
  process.exitCode = 1;
} finally { await db.end(); }
