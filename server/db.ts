import { and, asc, desc, eq, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { randomUUID } from "node:crypto";
import { contacts, detectedPublications, frequenciasTerceirizados, functionalActs, importConflicts, importRuns, InsertUser, interns, productionIncentives, serverChangeHistory, servers, serviceRecords, terceirizados, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function listFunctionalData(search = "") {
  const db = await getDb();
  if (!db) return { servers: [], functionalActs: [], interns: [], contacts: [], serviceRecords: [], productionIncentives: [], terceirizados: [], frequenciasTerceirizados: [], importRuns: [] };
  const filter = search.trim() ? or(like(servers.nomeNormalizado, `%${search.trim().toUpperCase()}%`), like(servers.matricula, `%${search.trim()}%`)) : undefined;
  const [serverRows, actRows, internRows, contactRows, serviceRows, incentiveRows, contractorRows, frequencyRows, runRows] = await Promise.all([
    db.select().from(servers).where(filter).orderBy(asc(servers.nomeNormalizado)),
    db.select().from(functionalActs).orderBy(desc(functionalActs.createdAt)),
    db.select().from(interns).orderBy(asc(interns.nomeOriginal)),
    db.select().from(contacts).orderBy(asc(contacts.nomeOriginal)),
    db.select().from(serviceRecords).orderBy(asc(serviceRecords.nomeOriginal)),
    db.select().from(productionIncentives).orderBy(asc(productionIncentives.dataTermino)),
    db.select().from(terceirizados).orderBy(asc(terceirizados.nomeNormalizado)),
    db.select().from(frequenciasTerceirizados).orderBy(desc(frequenciasTerceirizados.createdAt)),
    db.select().from(importRuns).orderBy(desc(importRuns.createdAt)).limit(5),
  ]);
  return { servers: serverRows, functionalActs: actRows, interns: internRows, contacts: contactRows, serviceRecords: serviceRows, productionIncentives: incentiveRows, terceirizados: contractorRows, frequenciasTerceirizados: frequencyRows, importRuns: runRows };
}

export async function listDetectedPublications(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(detectedPublications).orderBy(desc(detectedPublications.publicationDate), desc(detectedPublications.createdAt)).limit(Math.min(Math.max(limit, 1), 500));
}

export async function listReviewQueue(status?: "pending" | "resolved" | "ignored") {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({ conflict: importConflicts, run: importRuns }).from(importConflicts).leftJoin(importRuns, eq(importConflicts.runId, importRuns.id)).orderBy(desc(importConflicts.createdAt));
  return status ? rows.filter(row => row.conflict.status === status) : rows;
}

export async function updateReviewConflict(id: number, status: "resolved" | "ignored", changedBy = "modo-demo") {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const existing = (await db.select().from(importConflicts).where(eq(importConflicts.id, id)).limit(1))[0];
  if (!existing) throw new Error("Review item not found");
  if (status === "resolved" && existing.serverId) {
    let details: { eventType?: string; extracted?: { portaria?: string | null; publicationDate?: string | null; startDate?: string | null; endDate?: string | null; days?: string | null } } = {};
    try { details = JSON.parse(existing.details); } catch { details = {}; }
    const toDate = (value?: string | null) => {
      if (!value) return null;
      const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      return match ? new Date(Date.UTC(Number(match[3]), Number(match[2]) - 1, Number(match[1]))) : new Date(`${value}T00:00:00.000Z`);
    };
    const start = toDate(details.extracted?.startDate ?? details.extracted?.publicationDate);
    const days = details.extracted?.days ? Number(details.extracted.days) : 0;
    const extractedEnd = details.extracted?.endDate ? toDate(details.extracted.endDate) : null;
    const end = extractedEnd ?? (start && days > 0 ? new Date(start.getTime() + days * 86_400_000) : null);
    const eventType = details.eventType;
    const patch = eventType === "incentivo"
      ? { incentivoTipo: "Produção Científica / Pós-Graduação", incentivoPortaria: details.extracted?.portaria ?? null, incentivoDataInicio: start, incentivoDataValidade: null }
      : eventType === "saude"
        ? { afastamentoMotivo: "Saúde", afastamentoDataInicio: start, afastamentoDataFim: end, afastamentoDocumentoSei: null }
        : eventType === "estudo"
          ? { afastamentoMotivo: "Estudo", afastamentoDataInicio: start, afastamentoDataFim: end, afastamentoDocumentoSei: null }
          : {};
    if (Object.keys(patch).length > 0) await updateServerRecord(existing.serverId, patch, changedBy);
  }
  await db.update(importConflicts).set({ status }).where(eq(importConflicts.id, id));
  const run = existing.runId ? (await db.select().from(importRuns).where(eq(importRuns.id, existing.runId)).limit(1))[0] : undefined;
  if (run) {
    const pendingCount = (await db.select().from(importConflicts).where(eq(importConflicts.runId, run.id))).filter(item => item.status === "pending").length;
    let runNotes: Record<string, unknown> = {};
    try { runNotes = run.notes ? JSON.parse(run.notes) : {}; } catch { runNotes = {}; }
    await db.update(importRuns).set({ pendingCount, notes: JSON.stringify({ ...runNotes, lastReview: { conflictId: id, status, changedBy, reviewedAt: new Date().toISOString() } }) }).where(eq(importRuns.id, run.id));
  }
  return { ...existing, status };
}

export async function updateServerRecord(id: number, patch: Partial<typeof servers.$inferInsert>, changedBy = "modo-demo") {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  return db.transaction(async tx => {
    const before = (await tx.select().from(servers).where(eq(servers.id, id)).limit(1))[0];
    if (!before) throw new Error("Server not found");
    await tx.update(servers).set({ ...patch, updatedAt: new Date() }).where(eq(servers.id, id));
    if (patch.telefone !== undefined || patch.emailInstitucional !== undefined || patch.setor !== undefined) {
      await tx.update(contacts).set({
        ...(patch.telefone !== undefined ? { telefoneOriginal: patch.telefone } : {}),
        ...(patch.emailInstitucional !== undefined ? { emailOriginal: patch.emailInstitucional } : {}),
        ...(patch.setor !== undefined ? { setorOriginal: patch.setor } : {}),
      }).where(eq(contacts.serverId, id));
    }
    if (patch.dataNascimento !== undefined || patch.dataContratacao !== undefined || patch.setor !== undefined || patch.cargo !== undefined) {
      await tx.update(interns).set({
        ...(patch.dataNascimento !== undefined ? { dataNascimento: patch.dataNascimento } : {}),
        ...(patch.dataContratacao !== undefined ? { dataContratacao: patch.dataContratacao } : {}),
        ...(patch.setor !== undefined ? { setorAtuacao: patch.setor } : {}),
      }).where(eq(interns.serverId, id));
      await tx.update(terceirizados).set({
        ...(patch.dataNascimento !== undefined ? { dataNascimento: patch.dataNascimento } : {}),
        ...(patch.setor !== undefined ? { setor: patch.setor, localLotacao: patch.setor } : {}),
        ...(patch.cargo !== undefined ? { cargoFuncao: patch.cargo } : {}),
      }).where(eq(terceirizados.serverId, id));
      await tx.update(serviceRecords).set({
        ...(patch.dataNascimento !== undefined ? { dataNascimento: patch.dataNascimento } : {}),
        ...(patch.dataContratacao !== undefined ? { dataContratacao: patch.dataContratacao } : {}),
        ...(patch.setor !== undefined ? { setor: patch.setor } : {}),
        ...(patch.cargo !== undefined ? { cargo: patch.cargo } : {}),
      }).where(eq(serviceRecords.serverId, id));
    }
    if (patch.setor !== undefined) await tx.update(functionalActs).set({ setor: patch.setor }).where(eq(functionalActs.serverId, id));
    const after = (await tx.select().from(servers).where(eq(servers.id, id)).limit(1))[0];
    if (after) {
      for (const [fieldName, newValue] of Object.entries(patch)) {
        const previousValue = (before as Record<string, unknown>)[fieldName];
        if (String(previousValue ?? "") !== String(newValue ?? "")) {
          await tx.insert(serverChangeHistory).values({ serverId: id, matricula: after.matricula, fieldName, previousValue: previousValue == null ? null : String(previousValue), newValue: newValue == null ? null : String(newValue), changedBy, reason: "Edição na Base Mestre" });
        }
      }
    }
    return after;
  });
}

export async function createServerRecord(input: typeof servers.$inferInsert, changedBy = "modo-demo") {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const nomeNormalizado = input.nomeNormalizado ?? input.nomeOriginal.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]+/g, " ").trim().replace(/\s+/g, " ");
  const result = await db.insert(servers).values({ ...input, idMestre: input.idMestre ?? randomUUID(), nomeNormalizado });
  const created = (await db.select().from(servers).where(eq(servers.matricula, input.matricula)).limit(1))[0];
  if (created) await db.insert(serverChangeHistory).values({ serverId: created.id, matricula: created.matricula, fieldName: "__record__", previousValue: null, newValue: JSON.stringify(created), changedBy, reason: "Inclusão na Base Mestre" });
  return created;
}

export async function deleteServerRecord(id: number, changedBy = "modo-demo") {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const before = (await db.select().from(servers).where(eq(servers.id, id)).limit(1))[0];
  if (!before) throw new Error("Server not found");
  const [actDependent, contactDependent, internDependent, serviceDependent, incentiveDependent] = await Promise.all([
    db.select({ id: functionalActs.id }).from(functionalActs).where(eq(functionalActs.serverId, id)).limit(1),
    db.select({ id: contacts.id }).from(contacts).where(eq(contacts.serverId, id)).limit(1),
    db.select({ id: interns.id }).from(interns).where(eq(interns.serverId, id)).limit(1),
    db.select({ id: serviceRecords.id }).from(serviceRecords).where(eq(serviceRecords.serverId, id)).limit(1),
    db.select({ id: productionIncentives.id }).from(productionIncentives).where(eq(productionIncentives.serverId, id)).limit(1),
  ]);
  if ([actDependent, contactDependent, internDependent, serviceDependent, incentiveDependent].some(rows => rows.length > 0)) throw new Error("Server has related functional data");
  await db.insert(serverChangeHistory).values({ serverId: id, matricula: before.matricula, fieldName: "__record__", previousValue: JSON.stringify(before), newValue: null, changedBy, reason: "Exclusão autorizada na Base Mestre" });
  await db.update(serverChangeHistory).set({ serverId: null }).where(eq(serverChangeHistory.serverId, id));
  await db.delete(servers).where(eq(servers.id, id));
  return { success: true } as const;
}

export async function listServerChangeHistory(serverId?: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(serverChangeHistory).where(serverId ? eq(serverChangeHistory.serverId, serverId) : undefined).orderBy(desc(serverChangeHistory.createdAt)).limit(100);
}

export async function getFunctionalSummary() {
  const db = await getDb();
  if (!db) return { servers: 0, acts: 0, interns: 0, contacts: 0, services: 0, incentives: 0 };
  const [s, a, i, c, sr, pi, t] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(servers),
    db.select({ count: sql<number>`count(*)` }).from(functionalActs),
    db.select({ count: sql<number>`count(*)` }).from(interns),
    db.select({ count: sql<number>`count(*)` }).from(contacts),
    db.select({ count: sql<number>`count(*)` }).from(serviceRecords),
    db.select({ count: sql<number>`count(*)` }).from(productionIncentives),
    db.select({ count: sql<number>`count(*)` }).from(terceirizados),
  ]);
  return { servers: Number(s[0]?.count ?? 0), acts: Number(a[0]?.count ?? 0), interns: Number(i[0]?.count ?? 0), contacts: Number(c[0]?.count ?? 0), services: Number(sr[0]?.count ?? 0), incentives: Number(pi[0]?.count ?? 0), terceirizados: Number(t[0]?.count ?? 0) };
}
