import { timingSafeEqual } from "node:crypto";
import type { Request } from "express";
import { ENV } from "./env";

/**
 * Autenticação compartilhada por todas as rotas headless usadas pela Lala
 * (ingestão de achados, listagem de matrículas monitoradas, etc.) — o mesmo
 * Bearer token (`LALA_API_KEY`), comparado em tempo constante para evitar
 * timing attack.
 */
export function isAuthorizedForLala(req: Request): boolean {
  if (!ENV.lalaApiKey) return false; // nunca aceita token "vazio"
  const header = req.headers.authorization ?? "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return false;
  const expected = Buffer.from(ENV.lalaApiKey);
  const received = Buffer.from(token);
  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}
