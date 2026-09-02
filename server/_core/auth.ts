import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { sdk } from "./sdk";
import * as db from "../db";

export function registerAuthRoutes(app: Express) {
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { username, password } = req.body ?? {};

    if (!username || !password) {
      res.status(400).json({ error: "Usuário e senha são obrigatórios." });
      return;
    }

    if (!ENV.appUsername || !ENV.appPassword) {
      console.error("[Auth] APP_USERNAME ou APP_PASSWORD não configurados no ambiente.");
      res.status(500).json({ error: "Login não configurado no servidor." });
      return;
    }

    if (username !== ENV.appUsername || password !== ENV.appPassword) {
      res.status(401).json({ error: "Usuário ou senha inválidos." });
      return;
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
    res.json({ success: true });
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    res.json({ success: true });
  });
}
