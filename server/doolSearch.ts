import { createHash } from "node:crypto";
import { inArray } from "drizzle-orm";
import { detectedPublications, importRuns } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Busca pública por matrícula no DOOL (Diário Oficial Online / EGBA).
 *
 * Achado técnico: a busca do buscanova (https://dool.egba.ba.gov.br/buscanova/)
 * chama, no navegador, esta mesma rota JSON pública — sem login, sem
 * CAPTCHA — e o campo `conteudo` já traz o texto INTEGRAL da página do
 * diário (não um trecho truncado). O que fica atrás de login é só a
 * visualização/download do PDF em si (`/ver/...`), então geramos o link
 * direto pra essa página e deixamos a autenticação por conta da sessão do
 * navegador de quem clicar — nunca automatizamos esse login (ver
 * server/_core/lalaAuth.ts e a conversa com o time sobre reCAPTCHA
 * Enterprise no login do DOOL: não é algo que este sistema tenta contornar).
 */
const DOOL_SEARCH_URL = "https://dool.egba.ba.gov.br/busca/busca/buscar/query/0/";

type DoolHit = {
  _id: string;
  _source: {
    conteudo: string;
    data?: string; // "AAAA-MM-DD"
    pagina?: string;
    diario_id?: string;
    pdf_id?: string;
    suplemento?: string;
  };
};

// Classificação best-effort só pra dar um ponto de partida pra revisão
// humana — nunca decide sozinha; todo achado sai daqui com
// intelligenceStatus "pendente". A palavra-chave mais específica (ex.:
// "licença-prêmio") é checada antes das mais genéricas (ex.: "licença").
const CATEGORY_KEYWORDS: Array<[string, string[]]> = [
  ["licenca-premio", ["licença-prêmio", "licenca-premio", "licença premio"]],
  ["ferias", ["gozo de férias", "gozo férias", "usufruto de férias", "período de férias", "periodo de ferias"]],
  ["pecunia", ["pecúnia", "pecunia"]],
  ["promocao", ["promoção", "promocao"]],
  ["progressao", ["progressão", "progressao"]],
  ["cessao", ["cessão", "cessao", "à disposição", "a disposicao"]],
  ["transferencia", ["transferência", "transferencia"]],
  ["afastamento", ["afastamento", "licença para tratamento de saúde", "licença médica", "licença para realização de curso", "licença capacitação", "licenca capacitacao"]],
];

function guessCategoria(text: string): string | null {
  const normalized = text.toLowerCase();
  const found = CATEGORY_KEYWORDS.find(([, keywords]) => keywords.some(keyword => normalized.includes(keyword)));
  return found ? found[0] : null;
}

function extractActNumber(text: string): string | null {
  const match = text.match(/Portaria\s*N[ºo°]\s*([\d./-]+)/i);
  return match ? `Portaria nº ${match[1]}` : null;
}

// Recorta um trecho ao redor da matrícula pesquisada — a página do diário
// costuma trazer vários atos de pessoas diferentes concatenados, então o
// texto inteiro (`conteudo`) não serve como descrição de UM achado.
function extractSnippet(fullText: string, matricula: string, radius = 500): string {
  const idx = fullText.indexOf(matricula);
  if (idx === -1) return fullText.slice(0, 800).trim();
  const start = Math.max(0, idx - radius);
  const end = Math.min(fullText.length, idx + matricula.length + radius);
  return fullText.slice(start, end).trim();
}

export type DoolAchado = {
  matricula: string;
  categoria: string | null;
  actNumber: string | null;
  publicationDate: string | null;
  description: string;
  documentUrl: string | null;
  sourceUrl: string;
  fingerprint: string;
};

export async function searchDoolByMatricula(matricula: string): Promise<DoolAchado[]> {
  const url = `${DOOL_SEARCH_URL}?1=1&q=${encodeURIComponent(matricula)}`;
  const response = await fetch(url, {
    signal: AbortSignal.timeout(20_000),
    headers: { "user-agent": "DEDC-XI-Vida-Funcional/1.0 (consulta institucional somente leitura)" },
  });
  if (!response.ok) throw new Error(`DOOL respondeu HTTP ${response.status}`);
  const json = (await response.json()) as { hits?: { hits?: DoolHit[] } };
  const hits = json.hits?.hits ?? [];

  return hits.map(hit => {
    const source = hit._source;
    const snippet = extractSnippet(source.conteudo ?? "", matricula);
    const categoria = guessCategoria(snippet) ?? guessCategoria(source.conteudo ?? "");
    const actNumber = extractActNumber(snippet);
    const documentUrl = source.diario_id && source.pagina ? `https://dool.egba.ba.gov.br/ver/${source.diario_id}/${source.pagina}/${matricula}` : null;
    const fingerprint = createHash("sha256")
      .update(`dool-egba|${source.diario_id ?? ""}|${source.pagina ?? ""}|${matricula}`)
      .digest("hex");
    return {
      matricula,
      categoria,
      actNumber,
      publicationDate: source.data ?? null,
      description: snippet.slice(0, 1800),
      documentUrl,
      sourceUrl: "https://dool.egba.ba.gov.br/buscanova/",
      fingerprint,
    };
  });
}

/**
 * Busca + grava na fila de revisão ("Fontes e Auditoria" / dossiê do
 * servidor). Nunca escreve em `servers` — mesma regra de não sobrescrita
 * do endpoint da Lala (server/lalaIngest.ts). Idempotente por fingerprint:
 * rodar a mesma busca de novo não duplica achados já registrados.
 */
export async function searchAndRegisterDoolFindings(matricula: string, nomeOriginal?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const achados = await searchDoolByMatricula(matricula);
  if (achados.length === 0) {
    return { total: 0, novos: 0, duplicados: 0 };
  }

  const fingerprints = achados.map(achado => achado.fingerprint);
  const existing = await db
    .select({ fingerprint: detectedPublications.fingerprint })
    .from(detectedPublications)
    .where(inArray(detectedPublications.fingerprint, fingerprints));
  const existingSet = new Set(existing.map(row => row.fingerprint));
  const novos = achados.filter(achado => !existingSet.has(achado.fingerprint));

  if (novos.length > 0) {
    const [run] = await db
      .insert(importRuns)
      .values({
        source: "dool-busca-individual",
        version: createHash("sha256").update(fingerprints.join("|")).digest("hex"),
        status: "committed",
        insertedCount: novos.length,
        updatedCount: 0,
        pendingCount: novos.length,
        notes: JSON.stringify({ matricula, nomeOriginal, buscadoEm: new Date().toISOString() }),
      })
      .$returningId();
    const runId = run?.id ?? null;

    await db.insert(detectedPublications).values(
      novos.map(achado => ({
        runId,
        matricula,
        nomeOriginal: nomeOriginal ?? null,
        sourceKey: "dool-egba",
        sourceLabel: "DOOL · Diário Oficial Online (EGBA)",
        sourceUrl: achado.sourceUrl,
        documentUrl: achado.documentUrl,
        eventType: achado.categoria ?? "publicacao-nao-classificada",
        actNumber: achado.actNumber,
        processoSei: null,
        publicationDate: achado.publicationDate ? new Date(`${achado.publicationDate}T00:00:00.000Z`) : null,
        description: achado.description,
        documentText: null,
        scanMode: "individual" as const,
        intelligenceStatus: "pendente" as const,
        masterValue: null,
        foundValue: null,
        fingerprint: achado.fingerprint,
        reviewStatus: "pending" as const,
      })),
    );
  }

  return { total: achados.length, novos: novos.length, duplicados: achados.length - novos.length };
}
