import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import * as db from "../db";
import { sdk } from "./sdk";

export function registerAuthRoutes(app: Express) {
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body ?? {};

      if (!username || !password) {
        return res.status(400).json({ error: "Usuário e senha são obrigatórios." });
      }

      if (!ENV.appUsername || !ENV.appPassword) {
        return res.status(500).json({ error: "Login não configurado no servidor." });
      }

      if (username !== ENV.appUsername || password !== ENV.appPassword) {
        return res.status(401).json({ error: "Usuário ou senha inválidos." });
      }

      const openId = `local_${ENV.appUsername}`;

      await db.upsertUser({
        openId,
        name: ENV.appUsername,
        email: null,
        loginMethod: "local",
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(openId, {
        name: ENV.appUsername,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      return res.json({ success: true });
    } catch (err) {
      console.error("Erro no login:", err);
      return res.status(500).json({ error: "Erro interno no servidor." });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return res.json({ success: true });
  });
}
