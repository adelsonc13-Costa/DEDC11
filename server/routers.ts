import { z } from "zod";
import { servers } from "../drizzle/schema";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { createServerRecord, deleteServerRecord, getFunctionalSummary, listDetectedPublications, listFunctionalData, listReviewQueue, listServerChangeHistory, updateReviewConflict, updateServerRecord } from "./db";

const nullableText = z.string().nullable().optional();
const nullableDate = z.string().nullable().optional().transform(value => value ? new Date(`${value}T00:00:00.000Z`) : value);
const nullableInt = z.union([z.string(), z.number()]).nullable().optional().transform(value => value === "" || value === null || value === undefined ? value : Number(value));
const nullableChoice = (values: readonly [string, ...string[]]) => z.enum(values).nullable().optional();

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  functional: router({
    summary: publicProcedure.query(() => getFunctionalSummary()),
    list: publicProcedure.input(z.object({ search: z.string().default("") })).query(({ input }) => listFunctionalData(input.search)),
    updateServer: publicProcedure.input(z.object({
      id: z.number().int().positive(),
      nomeOriginal: z.string().optional(),
      setor: nullableText,
      cargo: nullableText,
      categoria: nullableText,
      status: nullableText,
      cpf: nullableText,
      rg: nullableText,
      telefone: nullableText,
      emailInstitucional: nullableText,
      emailPessoal: nullableText,
      cargaHoraria: nullableText,
      dataNascimento: nullableDate,
      dataContratacao: nullableDate,
      dataTerminoVigencia: nullableDate,
      participarComemoracao: nullableChoice(["Sim", "Não"]),
      motivoNaoParticipar: nullableText,
      docenteClasse: nullableText,
      docenteNivel: nullableText,
      tecnicoNivel: nullableInt,
      grau: nullableInt,
      referencia: nullableInt,
      estagiarioCalculaVigencia: nullableChoice(["Sim", "Não"]),
      contagemRenovacao: nullableInt,
      terceirizadoSubstituto: nullableChoice(["Sim", "Não"]),
      idServidorSubstituido: nullableInt,
      incentivoTipo: nullableText,
      incentivoPortaria: nullableText,
      incentivoDataInicio: nullableDate,
      incentivoDataValidade: nullableDate,
      afastamentoMotivo: nullableText,
      afastamentoDataInicio: nullableDate,
      afastamentoDataFim: nullableDate,
      afastamentoDocumentoSei: nullableText,
      ultimaVarredura: nullableDate,
      changedBy: z.string().optional(),
    })).mutation(({ input }) => {
      const { id, changedBy, ...patch } = input;
      return updateServerRecord(id, patch as Partial<typeof servers.$inferInsert>, changedBy ?? "modo-demo");
    }),
    createServer: publicProcedure.input(z.object({
      matricula: z.string().min(1).max(32),
      nomeOriginal: z.string().min(3),
      setor: nullableText,
      cargo: nullableText,
      categoria: nullableText,
      status: nullableText,
      cpf: nullableText,
      rg: nullableText,
      telefone: nullableText,
      emailInstitucional: nullableText,
      emailPessoal: nullableText,
      cargaHoraria: nullableText,
      dataNascimento: nullableDate,
      dataContratacao: nullableDate,
      dataTerminoVigencia: nullableDate,
      participarComemoracao: nullableChoice(["Sim", "Não"]),
      motivoNaoParticipar: nullableText,
      docenteClasse: nullableText,
      docenteNivel: nullableText,
      tecnicoNivel: nullableInt,
      grau: nullableInt,
      referencia: nullableInt,
      estagiarioCalculaVigencia: nullableChoice(["Sim", "Não"]),
      contagemRenovacao: nullableInt,
      terceirizadoSubstituto: nullableChoice(["Sim", "Não"]),
      idServidorSubstituido: nullableInt,
      incentivoTipo: nullableText,
      incentivoPortaria: nullableText,
      incentivoDataInicio: nullableDate,
      incentivoDataValidade: nullableDate,
      afastamentoMotivo: nullableText,
      afastamentoDataInicio: nullableDate,
      afastamentoDataFim: nullableDate,
      afastamentoDocumentoSei: nullableText,
      ultimaVarredura: nullableDate,
      changedBy: z.string().optional(),
    })).mutation(({ input }) => { const { changedBy, ...serverInput } = input; return createServerRecord(serverInput as typeof servers.$inferInsert, changedBy ?? "modo-demo"); }),
    deleteServer: publicProcedure.input(z.object({ id: z.number().int().positive(), changedBy: z.string().optional() })).mutation(({ input }) => deleteServerRecord(input.id, input.changedBy ?? "modo-demo")),
    history: publicProcedure.input(z.object({ serverId: z.number().int().positive().optional() }).default({})).query(({ input }) => listServerChangeHistory(input.serverId)),
    reviewQueue: publicProcedure.input(z.object({ status: z.enum(["pending", "resolved", "ignored"]).optional() }).default({})).query(({ input }) => listReviewQueue(input.status)),
    detectedPublications: publicProcedure.input(z.object({ limit: z.number().int().min(1).max(500).default(100) })).query(({ input }) => listDetectedPublications(input.limit)),
    reviewConflict: publicProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["resolved", "ignored"]), changedBy: z.string().optional() })).mutation(({ input }) => updateReviewConflict(input.id, input.status, input.changedBy ?? "modo-demo")),
  }),
});

export type AppRouter = typeof appRouter;
