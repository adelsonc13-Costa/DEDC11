import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  // const hostname = req.hostname;
  // const shouldSetDomain =
  //   hostname &&
  //   !LOCAL_HOSTS.has(hostname) &&
  //   !isIpAddress(hostname) &&
  //   hostname !== "127.0.0.1" &&
  //   hostname !== "::1";

  // const domain =
  //   shouldSetDomain && !hostname.startsWith(".")
  //     ? `.${hostname}`
  //     : shouldSetDomain
  //       ? hostname
  //       : undefined;

  // O front-end e a API são servidos pelo mesmo domínio (dedc11.onrender.com),
  // então este cookie de sessão nunca precisa trafegar entre sites diferentes.
  // "SameSite=None" exige obrigatoriamente o atributo "Secure" — se o servidor
  // calcular "secure: false" nessa combinação por qualquer motivo (por
  // exemplo, o cabeçalho x-forwarded-proto não chegando como esperado atrás
  // do proxy da Render), o Chrome descarta o cookie silenciosamente: o login
  // responde sucesso, mas nenhuma sessão fica de fato salva no navegador, e a
  // próxima checagem de autenticação sempre volta "não logado" — foi
  // confirmado que é exatamente isso que está acontecendo em produção.
  // "Lax" cobre com folga o único caso que este cookie precisa (login local e
  // o redirecionamento de volta do OAuth, ambos navegação de nível superior)
  // sem depender de "Secure" para não ser descartado.
  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: isSecureRequest(req),
  };
}
