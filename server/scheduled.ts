import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { importConflicts, importRuns } from "../drizzle/schema";
import { getDb } from "./db";
import { sdk } from "./_core/sdk";
import { runInstitutionalSync } from "./institutionalSync";
import { notifyOwner } from "./_core/notification";

export async function institutionalSyncHandler(req: Request, res: Response) {
  const startedAt = new Date().toISOString();
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only", timestamp: startedAt });
    const db = await getDb();
    if (!db) return res.status(500).json({ error: "database-unavailable", timestamp: startedAt });
    const ownerRun = (await db.select().from(importRuns).where(eq(importRuns.scheduleCronTaskUid, user.taskUid)).limit(1))[0];
    if (!ownerRun) return res.json({ ok: true, skipped: "orphan", taskUid: user.taskUid, timestamp: startedAt });
    const result = await runInstitutionalSync(user.taskUid);
    const runConflicts = result.runId ? await db.select().from(importConflicts).where(eq(importConflicts.runId, result.runId)) : [];
    const critical = runConflicts.filter(item => item.status === "pending" && item.details.includes('"alert48h":true'));
    let notificationSent = false;
    if (critical.length > 0) {
      notificationSent = await notifyOwner({ title: "Alerta de retorno em até 48 horas", content: `${critical.length} ocorrência(s) de afastamento exigem revisão na aba Fontes e auditoria. Nenhuma alteração automática foi aplicada.` });
    }
    return res.json({ ok: true, ...result, criticalAlerts: critical.length, notificationSent, timestamp: new Date().toISOString() });
  } catch (error) {
    return res.status(500).json({ error: String(error), stack: error instanceof Error ? error.stack : undefined, context: { url: req.originalUrl, taskUid: req.headers["x-task-uid"] ?? null }, timestamp: startedAt });
  }
}
