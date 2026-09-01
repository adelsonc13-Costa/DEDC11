import mysql from "mysql2/promise";
const normalize = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]+/g, " ").trim().replace(/\s+/g, " ");
const db = await mysql.createConnection(process.env.DATABASE_URL);
try {
  const [servers] = await db.query("SELECT id,nomeOriginal,nomeNormalizado FROM servers");
  const [contractors] = await db.query("SELECT id,nomeOriginal,nomeNormalizado,serverId FROM terceirizados");
  const byName = new Map();
  for (const server of servers) {
    const key = server.nomeNormalizado || normalize(server.nomeOriginal);
    const list = byName.get(key) ?? [];
    list.push(server);
    byName.set(key, list);
  }
  let linked = 0;
  let pending = 0;
  for (const contractor of contractors) {
    const matches = byName.get(contractor.nomeNormalizado || normalize(contractor.nomeOriginal)) ?? [];
    if (matches.length === 1) {
      if (contractor.serverId !== matches[0].id) await db.query("UPDATE terceirizados SET serverId=? WHERE id=?", [matches[0].id, contractor.id]);
      linked += 1;
    } else {
      pending += 1;
    }
  }
  console.log(JSON.stringify({ totalContractors: contractors.length, linked, pending, serverCandidates: servers.length }));
} finally {
  await db.end();
}
