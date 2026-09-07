import type { Request, Response } from "express";
import { servers } from "../drizzle/schema";
import { getDb } from "./db";
import { isAuthorizedForLala } from "./_core/lalaAuth";

/**
 * Lista, para consumo por um job headless (cron da Lala), as matrículas do
 * Cadastro Mestre que devem ser monitoradas nas fontes públicas. Existe pra
 * que esse job não precise depender do export "Excel completo" (pensado
 * para uso humano, atrás de sessão de login) — é a mesma autenticação por
 * Bearer token do endpoint de ingestão (`/api/ingest/lala`).
 *
 * Somente leitura. Inclui `ultimaVarredura` para o job poder buscar só o
 * que é novo desde a última verificação de cada servidor, em vez de
 * reprocessar o histórico inteiro a cada execução (ver comando-mestre-iala.md).
 */
export async function monitoredServersHandler(req: Request, res: Response) {
  const receivedAt = new Date().toISOString();

  if (!isAuthorizedForLala(req)) {
    return res.status(401).json({ error: "unauthorized", timestamp: receivedAt });
  }

  const db = await getDb();
  if (!db) {
    return res.status(500).json({ error: "database-unavailable", timestamp: receivedAt });
  }

  try {
    const rows = await db
      .select({
        matricula: servers.matricula,
        nomeOriginal: servers.nomeOriginal,
        categoria: servers.categoria,
        status: servers.status,
        setor: servers.setor,
        ultimaVarredura: servers.ultimaVarredura,
      })
      .from(servers);

    // Só serve pra quem está de fato ativo — não faz sentido a Lala gastar
    // buscas em quem já desligou do quadro.
    const ativos = rows.filter(row => (row.status ?? "Ativo") === "Ativo");

    return res.json({
      ok: true,
      total: ativos.length,
      servidores: ativos,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[MonitoredServers] Falha ao listar matrículas:", error);
    return res.status(500).json({ error: String(error), timestamp: receivedAt });
  }
}
