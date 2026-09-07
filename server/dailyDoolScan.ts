import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { servers } from "../drizzle/schema";
import { getDb } from "./db";
import { isAuthorizedForLala } from "./_core/lalaAuth";
import { searchAndRegisterDoolFindings } from "./doolSearch";

/**
 * Varredura diária automática (Modo 2 do comando mestre da Lala, 09:30):
 * percorre todas as matrículas ativas do Cadastro Mestre e busca cada uma
 * no DOOL (busca pública, sem login — ver doolSearch.ts), gravando achados
 * novos na fila de revisão. Pensado pra ser chamado por um Render Cron Job
 * (ou qualquer disparador externo agendado), autenticado com o mesmo
 * Bearer token da Lala.
 *
 * Roda sequencial com uma pequena pausa entre matrículas — 89 servidores
 * hoje, tende a crescer; evita martelar o DOOL com dezenas de requisições
 * simultâneas.
 */
const PAUSA_ENTRE_BUSCAS_MS = 300;
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function dailyDoolScanHandler(req: Request, res: Response) {
  const receivedAt = new Date().toISOString();

  if (!isAuthorizedForLala(req)) {
    return res.status(401).json({ error: "unauthorized", timestamp: receivedAt });
  }

  const db = await getDb();
  if (!db) {
    return res.status(500).json({ error: "database-unavailable", timestamp: receivedAt });
  }

  try {
    const rows = await db.select({ id: servers.id, matricula: servers.matricula, nomeOriginal: servers.nomeOriginal, status: servers.status }).from(servers);
    const ativos = rows.filter(row => (row.status ?? "Ativo") === "Ativo");

    const resultados: Array<{ matricula: string; ok: boolean; total?: number; novos?: number; duplicados?: number; error?: string }> = [];

    for (const servidor of ativos) {
      try {
        const resultado = await searchAndRegisterDoolFindings(servidor.matricula, servidor.nomeOriginal);
        resultados.push({ matricula: servidor.matricula, ok: true, ...resultado });
        await db.update(servers).set({ ultimaVarredura: new Date() }).where(eq(servers.id, servidor.id));
      } catch (error) {
        resultados.push({ matricula: servidor.matricula, ok: false, error: String(error) });
      }
      await sleep(PAUSA_ENTRE_BUSCAS_MS);
    }

    const falhas = resultados.filter(item => !item.ok);
    const totalNovos = resultados.reduce((sum, item) => sum + (item.novos ?? 0), 0);

    return res.json({
      ok: true,
      totalServidores: ativos.length,
      totalNovosAchados: totalNovos,
      totalFalhas: falhas.length,
      falhas: falhas.length > 0 ? falhas : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[DailyDoolScan] Falha na varredura diária:", error);
    return res.status(500).json({ error: String(error), timestamp: receivedAt });
  }
}
