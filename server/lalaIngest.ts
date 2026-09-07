import { createHash } from "node:crypto";
import type { Request, Response } from "express";
import { z } from "zod";
import { eq, inArray } from "drizzle-orm";
import { detectedPublications, importRuns, servers } from "../drizzle/schema";
import { getDb } from "./db";
import { isAuthorizedForLala } from "./_core/lalaAuth";

/**
 * Ponte de ingestão da agente Lala (Módulo de Inteligência Funcional, ver
 * claude/comando-mestre-iala.md). A Lala pesquisa DOOL/EGBA, PGDP e SPO fora
 * deste sistema e envia os achados aqui — tanto a carga histórica (DOOL a
 * partir de 2007, SPO a partir de 2000) quanto a varredura diária (09:30).
 *
 * Este endpoint NUNCA escreve na tabela `servers`. Cada achado vira uma linha
 * em `detectedPublications` com reviewStatus "pending": entra na fila de
 * revisão do módulo "Fontes e Auditoria", igual ao que a sincronização
 * institucional interna já faz. A decisão de aplicar (ou não) uma mudança ao
 * Cadastro Mestre continua sendo humana — exatamente a regra de não
 * sobrescrita da seção 7 do comando mestre da Lala.
 */

const CATEGORIAS = [
  "ferias",
  "afastamento",
  "licenca-premio",
  "pecunia",
  "promocao",
  "progressao",
  "transferencia",
  "cessao",
] as const;

const FONTES = {
  "dool-egba": "DOOL · Diário Oficial Online (EGBA)",
  "spo-uneb": "SPO · Sistema de Publicações Oficiais",
  "pgdp-uneb": "PGDP · Pró-Reitoria de Gestão e Desenvolvimento de Pessoas",
} as const;

// "outra" cobre documentos fora das três fontes públicas do comando mestre da
// Lala (ex.: certidões internas, mapas de tempo de contribuição emitidos pela
// própria UNEB) — nesse caso o achado precisa trazer `sourceLabel` com o nome
// da fonte por extenso, já que não há uma sigla fixa pra mapear.
const FONTE_KEYS = ["dool-egba", "spo-uneb", "pgdp-uneb", "outra"] as const;

const nullableTrimmed = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .optional();

// Lala às vezes envia string vazia ("") em vez de omitir o campo quando não
// há URL pública (ex.: certidão interna). z.string().url().optional() só
// aceita `undefined` — "" ainda cairia no .url() e falharia. Este preprocess
// normaliza "" (e strings só de espaço) para `undefined` antes da validação.
const optionalUrl = z.preprocess(
  value => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().url().max(500).optional(),
);

const AchadoSchema = z
  .object({
    matricula: z.string().trim().min(1).max(32).optional(),
    nomeOriginal: z.string().trim().min(1).max(255).optional(),
    categoria: z.enum(CATEGORIAS),
    fonte: z.enum(FONTE_KEYS),
    // opcional: documentos sem publicação web (certidões internas, processos
    // em papel digitalizado) não têm URL pública — nesse caso omita o campo
    // (ou envie "", que é normalizado para ausente).
    sourceUrl: optionalUrl,
    // obrigatório quando fonte === "outra" (validado abaixo)
    sourceLabel: nullableTrimmed,
    documentUrl: optionalUrl,
    actNumber: nullableTrimmed,
    processoSei: nullableTrimmed,
    // aceita "AAAA-MM-DD" ou "DD/MM/AAAA"
    publicationDate: z
      .string()
      .regex(/^(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})$/)
      .optional(),
    description: z.string().trim().min(1).max(2000),
    documentText: z.string().trim().max(20000).optional(),
    intelligenceStatus: z.enum(["confirmado", "pendente", "divergencia", "nao_pesquisado"]),
    // obrigatórios quando intelligenceStatus === "divergencia" (validado abaixo)
    masterValue: z.string().trim().max(2000).optional(),
    foundValue: z.string().trim().max(2000).optional(),
  })
  .refine(
    achado => achado.intelligenceStatus !== "divergencia" || (achado.masterValue && achado.foundValue),
    { message: "masterValue e foundValue são obrigatórios quando intelligenceStatus é 'divergencia'", path: ["masterValue"] },
  )
  .refine(achado => Boolean(achado.matricula) || Boolean(achado.nomeOriginal), {
    message: "informe matricula e/ou nomeOriginal para permitir o cruzamento com o Cadastro Mestre",
    path: ["matricula"],
  })
  .refine(achado => achado.fonte !== "outra" || Boolean(achado.sourceLabel), {
    message: "sourceLabel é obrigatório quando fonte é 'outra'",
    path: ["sourceLabel"],
  })
  .refine(achado => Boolean(achado.sourceUrl) || Boolean(achado.documentUrl) || Boolean(achado.sourceLabel), {
    message: "informe sourceUrl, documentUrl, ou sourceLabel descrevendo onde o documento está arquivado",
    path: ["sourceUrl"],
  });

const PacoteSchema = z.object({
  // "individual" = consulta individualizada (Modo 1 do comando mestre da
  // Lala, dossiê sob demanda de uma pessoa específica); "historical" = carga
  // histórica em lote; "daily" = rotina automática das 09:30.
  scanMode: z.enum(["historical", "daily", "individual"]),
  // rótulo curto e legível do lote, ex.: "Iala · varredura diária 06/09/2026"
  // ou "Iala · dossiê individual matrícula 000123"
  batchLabel: z.string().trim().min(1).max(180),
  achados: z.array(AchadoSchema).min(1).max(500),
});

function parsePublicationDate(value?: string): Date | null {
  if (!value) return null;
  const br = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (br) return new Date(Date.UTC(Number(br[3]), Number(br[2]) - 1, Number(br[1])));
  return new Date(`${value}T00:00:00.000Z`);
}

function buildFingerprint(achado: z.infer<typeof AchadoSchema>): string {
  const documentRef = achado.documentUrl ?? achado.sourceUrl;
  const key = [
    achado.fonte,
    achado.categoria,
    achado.matricula ?? "",
    // Quando há URL, ela já identifica o documento com segurança. Sem URL
    // (ex.: certidão interna via fonte "outra"), cai no sourceLabel — mas
    // duas certidões diferentes da mesma fonte/matrícula sem URL colidiriam,
    // então soma-se um hash curto da descrição só nesse caso, pra não
    // deduplicar achados distintos.
    documentRef ?? [achado.sourceLabel ?? "", createHash("sha256").update(achado.description).digest("hex").slice(0, 16)].join(":"),
    achado.actNumber ?? "",
    achado.publicationDate ?? "",
  ].join("|");
  return createHash("sha256").update(key).digest("hex");
}

export async function lalaIngestHandler(req: Request, res: Response) {
  const receivedAt = new Date().toISOString();

  if (!isAuthorizedForLala(req)) {
    return res.status(401).json({ error: "unauthorized", timestamp: receivedAt });
  }

  const parsed = PacoteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid-payload", issues: parsed.error.issues, timestamp: receivedAt });
  }
  const { scanMode, batchLabel, achados } = parsed.data;

  const db = await getDb();
  if (!db) {
    return res.status(500).json({ error: "database-unavailable", timestamp: receivedAt });
  }

  try {
    // Cruza cada achado com o Cadastro Mestre (só leitura — nunca grava em `servers`).
    const matriculas = Array.from(new Set(achados.map(a => a.matricula).filter((v): v is string => Boolean(v))));
    const matchedServers = matriculas.length
      ? await db.select({ id: servers.id, matricula: servers.matricula, nomeOriginal: servers.nomeOriginal }).from(servers).where(inArray(servers.matricula, matriculas))
      : [];
    const serverByMatricula = new Map(matchedServers.map(server => [server.matricula, server]));

    const candidates = achados.map(achado => {
      const matched = achado.matricula ? serverByMatricula.get(achado.matricula) : undefined;
      return {
        achado,
        matched,
        fingerprint: buildFingerprint(achado),
      };
    });

    const fingerprints = candidates.map(candidate => candidate.fingerprint);
    const existing = fingerprints.length
      ? await db.select({ fingerprint: detectedPublications.fingerprint }).from(detectedPublications).where(inArray(detectedPublications.fingerprint, fingerprints))
      : [];
    const existingSet = new Set(existing.map(row => row.fingerprint));

    const toInsert = candidates.filter(candidate => !existingSet.has(candidate.fingerprint));
    const duplicated = candidates.length - toInsert.length;
    const unmatchedServers = candidates.filter(candidate => candidate.achado.matricula && !candidate.matched).length;

    const version = createHash("sha256").update(fingerprints.join("|")).digest("hex");
    const [run] = await db
      .insert(importRuns)
      .values({
        source:
          scanMode === "historical"
            ? "lala-carga-historica"
            : scanMode === "individual"
              ? "lala-consulta-individual"
              : "lala-varredura-diaria",
        version,
        status: "committed",
        insertedCount: toInsert.length,
        updatedCount: 0,
        pendingCount: toInsert.length,
        notes: JSON.stringify({ batchLabel, receivedAt, totalRecebidos: achados.length, duplicated, unmatchedServers }),
      })
      .$returningId();
    const runId = run?.id ?? null;

    if (toInsert.length > 0) {
      await db.insert(detectedPublications).values(
        toInsert.map(({ achado, matched, fingerprint }) => ({
          runId,
          serverId: matched?.id ?? null,
          matricula: achado.matricula ?? matched?.matricula ?? null,
          nomeOriginal: achado.nomeOriginal ?? matched?.nomeOriginal ?? null,
          sourceKey: achado.fonte,
          sourceLabel: achado.fonte === "outra" ? (achado.sourceLabel ?? "Fonte não classificada") : FONTES[achado.fonte],
          sourceUrl: achado.sourceUrl ?? null,
          documentUrl: achado.documentUrl ?? null,
          eventType: achado.categoria,
          actNumber: achado.actNumber ?? null,
          processoSei: achado.processoSei ?? null,
          publicationDate: parsePublicationDate(achado.publicationDate),
          description: achado.description,
          documentText: achado.documentText ?? null,
          scanMode,
          intelligenceStatus: achado.intelligenceStatus,
          masterValue: achado.masterValue ?? null,
          foundValue: achado.foundValue ?? null,
          fingerprint,
          reviewStatus: "pending" as const,
        })),
      );
    }

    return res.json({
      ok: true,
      runId,
      batchLabel,
      scanMode,
      recebidos: achados.length,
      inseridos: toInsert.length,
      duplicados: duplicated,
      semCorrespondenciaNoCadastroMestre: unmatchedServers,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[LalaIngest] Falha ao processar pacote:", error);
    return res.status(500).json({ error: String(error), stack: error instanceof Error ? error.stack : undefined, timestamp: receivedAt });
  }
}
