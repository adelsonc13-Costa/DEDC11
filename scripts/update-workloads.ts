import { getDb, updateServerRecord } from "../server/db";
import { servers } from "../drizzle/schema";
import { asc } from "drizzle-orm";

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/\s+/g, " ").trim();

const technicianExceptions = new Map([
  ["RAFAEL LIMA DE OLIVEIRA", "30h"],
  ["LORENA OLIVEIRA DA SILVA", "30h"],
]);

const db = await getDb();
if (!db) throw new Error("Database unavailable");

const rows = await db.select().from(servers).orderBy(asc(servers.nomeNormalizado));
const technicians = rows.filter(row => normalize(row.cargo ?? "").startsWith("TECNICO"));
const analyst = rows.find(row => normalize(row.nomeOriginal) === "JULIANA MELO LEITE");

if (!analyst) throw new Error("Juliana Melo Leite não foi encontrada na Base Mestre");
if (normalize(analyst.cargo ?? "").includes("TECNICO")) throw new Error("Juliana Melo Leite está classificada como técnica, não analista");

const changes: Array<{ id: number; name: string; previous: string | null; next: string }> = [];
for (const row of technicians) {
  const name = normalize(row.nomeOriginal);
  const next = technicianExceptions.get(name) ?? "40h";
  if (row.cargaHoraria !== next) {
    await updateServerRecord(row.id, { cargaHoraria: next }, "atualizacao-carga-horaria-2026-08-22");
    changes.push({ id: row.id, name: row.nomeOriginal, previous: row.cargaHoraria, next });
  }
}

if (analyst.cargaHoraria !== "20h") {
  await updateServerRecord(analyst.id, { cargaHoraria: "20h" }, "atualizacao-carga-horaria-2026-08-22");
  changes.push({ id: analyst.id, name: analyst.nomeOriginal, previous: analyst.cargaHoraria, next: "20h" });
}

console.log(JSON.stringify({ techniciansFound: technicians.length, analyst: analyst.nomeOriginal, changes }, null, 2));
