import { createHash } from "node:crypto";
import { desc, eq, inArray } from "drizzle-orm";
import { detectedPublications, importConflicts, importRuns, servers } from "../drizzle/schema";
import { getDb } from "./db";

export const INSTITUTIONAL_SOURCES = [
  { key: "portal-uneb", label: "Portal UNEB · Servidores", url: "https://portal.uneb.br/servidores/" },
  { key: "pgdp-promocao-docente", label: "PGDP · Promoção Docente", url: "https://pgdp.uneb.br/promocao-docente-2/" },
  { key: "pgdp-promocao-tecnico", label: "PGDP · Promoção Técnico e Analista", url: "https://pgdp.uneb.br/promocao-tecnico/" },
  { key: "pgdp-progressao-docente", label: "PGDP · Progressão Docente", url: "https://pgdp.uneb.br/progressao-docente/" },
  { key: "pgdp-progressao-tecnico", label: "PGDP · Progressão Técnico e Analista", url: "https://pgdp.uneb.br/progressao-tecnico/" },
  { key: "dool-egba", label: "DOOL · Diário Oficial Online", url: "https://dool.egba.ba.gov.br/buscanova/" },
  { key: "spo-uneb", label: "SPO · Sistema de Publicações Oficiais", url: "http://www.spo.uneb.br/" },
] as const;

export const CAREER_POSITIVE_TERMS = ["promoção concedida", "progressão deferida", "habilitado para promoção", "processo deferido", "publicação de portaria de progressão", "lista de servidores contemplados", "deferido", "contemplado"] as const;
export const CAREER_NEGATIVE_TERMS = ["indeferido", "não habilitado", "processo negado", "recurso improcedente", "não contemplado", "excluído da lista", "falta de documentação", "falta de requisitos"] as const;

export const EVENT_KEYWORDS = {
  incentivo: ["conceder incentivo", "produção científica", "incentivo pós-graduação", "adicional de titulação"],
  saude: ["licença para tratamento de saúde", "licença médica", "junta médica", "homologar atestado"],
  estudo: ["afastamento para estudo", "mestrado", "doutorado", "pós-doutorado", "licença capacitação"],
  carreira: ["progressão", "promoção", "estabilidade"],
} as const;

type SourceDocument = { title: string; url: string };
type SourceResult = (typeof INSTITUTIONAL_SOURCES)[number] & { ok: boolean; status: number; finalUrl: string; fingerprint: string; excerpt: string; fullText: string; documents: SourceDocument[] };
type EventKind = keyof typeof EVENT_KEYWORDS;

const stripMarkup = (html: string) => html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/\s+/g, " ").trim();
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const extractFirst = (text: string, patterns: RegExp[]) => patterns.map(pattern => text.match(pattern)?.[1]).find(Boolean) ?? null;
const parseDate = (value: string | null) => {
  if (!value) return null;
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return match ? new Date(Date.UTC(Number(match[3]), Number(match[2]) - 1, Number(match[1]))) : new Date(`${value}T00:00:00.000Z`);
};
const formatDate = (value: Date | null) => value ? value.toISOString().slice(0, 10) : null;
export const classify = (text: string): EventKind[] => (Object.entries(EVENT_KEYWORDS) as [EventKind, readonly string[]][]).filter(([, words]) => words.some(word => normalize(text).includes(normalize(word)))).map(([kind]) => kind);
export const classifyCareerStatus = (text: string): "confirmed" | "negative" | "pending" => {
  const normalized = normalize(text);
  if (CAREER_NEGATIVE_TERMS.some(term => normalized.includes(normalize(term)))) return "negative";
  if (CAREER_POSITIVE_TERMS.some(term => normalized.includes(normalize(term)))) return "confirmed";
  return "pending";
};

export function extractEvent(text: string, kind: EventKind) {
  const date = extractFirst(text, [/\b(\d{2}\/\d{2}\/\d{4})\b/, /\b(\d{4}-\d{2}-\d{2})\b/]);
  const portaria = extractFirst(text, [/(?:portaria|ato)[^\d]{0,24}(\d{3,})/i]);
  const days = extractFirst(text, [/\b(\d{1,3})\s+dias?\b/i]);
  const percentage = extractFirst(text, [/(\d{1,3}(?:[.,]\d+)?)\s*%/]);
  const sei = extractFirst(text, [/\b(\d{3}\.\d{4}\.\d{4}\.\d{7}-\d{2})\b/]);
  const start = parseDate(date);
  const end = start && days ? new Date(start.getTime() + Number(days) * 86_400_000) : null;
  return { kind, publicationDate: date, startDate: kind === "saude" || kind === "estudo" ? date : null, endDate: kind === "saude" || kind === "estudo" ? formatDate(end) : null, days, portaria, percentage, sei, institution: kind === "estudo" ? extractFirst(text, [/(?:institui[cç][aã]o|universidade|faculdade)[^.;]{0,120}/i]) : null, alert48h: Boolean(end && end.getTime() - Date.now() <= 48 * 60 * 60 * 1000 && end.getTime() >= Date.now()), serviceTimeImpact: kind === "saude" || kind === "estudo" ? "revisão institucional necessária" : null };
}

async function readSource(source: (typeof INSTITUTIONAL_SOURCES)[number]): Promise<SourceResult> {
  try {
    const response = await fetch(source.url, { redirect: "follow", signal: AbortSignal.timeout(25_000), headers: { "user-agent": "DEDC-XI-Vida-Funcional/1.0 (consulta institucional somente leitura)" } });
    const html = await response.text();
    const fullText = stripMarkup(html);
    const excerpt = fullText.slice(0, 1600);
    const documents = Array.from(html.matchAll(/<a[^>]+href=["']([^"']+\.pdf(?:\?[^"']*)?)["'][^>]*>([\s\S]*?)<\/a>/gi)).map(match => ({ title: stripMarkup(match[2]).slice(0, 240) || match[1].split("/").pop() || "Documento PDF", url: new URL(match[1], response.url).toString() })).slice(0, 200);
    const fingerprint = createHash("sha256").update(`${response.status}|${response.url}|${fullText}|${documents.map(item => item.url).join("|")}`).digest("hex");
    return { ...source, ok: response.ok, status: response.status, finalUrl: response.url, fingerprint, excerpt, fullText, documents };
  } catch (error) {
    return { ...source, ok: false, status: 0, finalUrl: source.url, fingerprint: `error:${String(error)}`, excerpt: `Falha de consulta: ${String(error)}`, fullText: "", documents: [] };
  }
}

export async function runInstitutionalSync(taskUid?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const observedAt = new Date();
  const results = await Promise.all(INSTITUTIONAL_SOURCES.map(readSource));
  const [serverRows, previous] = await Promise.all([
    db.select({ id: servers.id, matricula: servers.matricula, nomeOriginal: servers.nomeOriginal }).from(servers),
    db.select().from(importRuns).where(eq(importRuns.source, "sincronizacao-institucional-diaria")).orderBy(desc(importRuns.createdAt)).limit(1),
  ]);
  const prior = previous[0];
  const version = createHash("sha256").update(results.map(item => `${item.key}:${item.fingerprint}`).join("|")).digest("hex");
  const changed = !prior || prior.version !== version;
  const hasFailure = results.some(item => !item.ok);
  const [run] = await db.insert(importRuns).values({ source: "sincronizacao-institucional-diaria", version, status: hasFailure ? "failed" : "committed", insertedCount: 0, updatedCount: 0, pendingCount: 0, notes: JSON.stringify({ taskUid: taskUid ?? prior?.scheduleCronTaskUid ?? null, observedAt: observedAt.toISOString(), keywords: EVENT_KEYWORDS, sources: results.map(({ key, label, url, status, ok, finalUrl, documents }) => ({ key, label, url, status, ok, finalUrl, documentCount: documents.length })) }), scheduleCronTaskUid: null }).$returningId();
  const runId = run?.id;
  let pendingCount = 0;
  let detectedCount = 0;
  const conflicts: Array<typeof importConflicts.$inferInsert> = [];
  const pgdpDocuments = results.flatMap(source => source.key.startsWith("pgdp-") ? source.documents.map(document => ({ source, document })) : []);
  const fingerprints = pgdpDocuments.map(({ source, document }) => createHash("sha256").update(`${source.key}|${document.url}|${document.title}`).digest("hex"));
  const existingDetected = fingerprints.length ? await db.select({ fingerprint: detectedPublications.fingerprint }).from(detectedPublications).where(inArray(detectedPublications.fingerprint, fingerprints)) : [];
  const existingFingerprintSet = new Set(existingDetected.map(item => item.fingerprint));
  const newDetected = pgdpDocuments.flatMap(({ source, document }, index) => {
    const fingerprint = fingerprints[index];
    if (existingFingerprintSet.has(fingerprint)) return [];
    const documentContext = `${document.title} ${source.label}`;
    const kinds = classify(documentContext);
    const inferredKind = kinds[0] ?? (source.key.includes("promocao") ? "carreira" : source.key.includes("progressao") ? "carreira" : null);
    if (!inferredKind || (inferredKind === "carreira" && classifyCareerStatus(documentContext) === "negative")) return [];
    const careerStatus = inferredKind === "carreira" ? classifyCareerStatus(documentContext) : null;
    const matched = serverRows.find(server => normalize(document.title).includes(normalize(server.matricula)) || normalize(document.title).includes(normalize(server.nomeOriginal)));
    return [{ serverId: matched?.id ?? null, matricula: matched?.matricula ?? null, nomeOriginal: matched?.nomeOriginal ?? null, sourceKey: source.key, sourceLabel: source.label, sourceUrl: source.url, documentUrl: document.url, eventType: inferredKind, publicationDate: parseDate(extractFirst(document.title, [/\b(\d{2}\/\d{2}\/\d{4})\b/, /\b(\d{4}-\d{2}-\d{2})\b/])), description: `${document.title}${careerStatus ? ` · Status PGDP: ${careerStatus === "confirmed" ? "confirmado" : "processo em andamento"}` : ""}`, documentText: null, scanMode: "daily" as const, fingerprint, reviewStatus: "pending" as const }];
  });
  if (newDetected.length) { await db.insert(detectedPublications).values(newDetected); detectedCount = newDetected.length; }
  for (const source of results) {
    const kinds = classify(source.fullText);
    if (kinds.length === 0 && !source.ok) {
      conflicts.push({ runId, module: "sincronizacao-institucional", recordKey: source.key, conflictType: "source_unavailable", details: JSON.stringify({ label: source.label, url: source.url, finalUrl: source.finalUrl, httpStatus: source.status, observedAt: observedAt.toISOString(), excerpt: source.excerpt }), status: "pending" });
      continue;
    }
    if (!changed) continue;
    const matched = serverRows.filter(server => normalize(source.fullText).includes(normalize(server.matricula)) || normalize(source.fullText).includes(normalize(server.nomeOriginal)));
    for (const kind of kinds) {
      const extracted = extractEvent(source.fullText, kind);
      if (matched.length === 0) {
        conflicts.push({ runId, module: "sincronizacao-institucional", recordKey: `${source.key}:${kind}`, conflictType: "event_without_server_match", details: JSON.stringify({ source: source.label, url: source.url, eventType: kind, extracted, observedAt: observedAt.toISOString(), excerpt: source.excerpt }), status: "pending" });
      } else {
        for (const server of matched.slice(0, 50)) {
          conflicts.push({ runId, serverId: server.id, module: "sincronizacao-institucional", recordKey: `${server.matricula}:${kind}`, conflictType: "event_detected_review", details: JSON.stringify({ source: source.label, url: source.url, eventType: kind, matricula: server.matricula, nome: server.nomeOriginal, extracted, observedAt: observedAt.toISOString(), excerpt: source.excerpt }), status: "pending" });
        }
        await db.update(servers).set({ ultimaVarredura: observedAt }).where(eq(servers.id, matched[0].id));
      }
    }
  }
  if (runId && conflicts.length > 0) {
    await db.insert(importConflicts).values(conflicts);
    pendingCount = conflicts.length;
    await db.update(importRuns).set({ pendingCount }).where(eq(importRuns.id, runId));
  }
  return { runId, changed, hasFailure, version, pendingCount, detectedCount, keywords: EVENT_KEYWORDS, sources: results.map(({ key, label, url, status, ok, finalUrl, documents }) => ({ key, label, url, status, ok, finalUrl, documentCount: documents.length })) };
}
