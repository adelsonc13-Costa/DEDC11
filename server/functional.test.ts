import { describe, expect, it } from "vitest";
import { getDb, getFunctionalSummary, listFunctionalData, updateServerRecord } from "./db";
import { contacts, interns, serviceRecords, servers, terceirizados } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { appRouter } from "./routers";

describe("functional data integration", () => {
  it("exposes the public functional procedures", () => {
    expect((appRouter as any).functional.summary).toBeDefined();
    expect((appRouter as any).functional.list).toBeDefined();
    expect((appRouter as any).functional.updateServer).toBeDefined();
    expect((appRouter as any).functional.createServer).toBeDefined();
    expect((appRouter as any).functional.deleteServer).toBeDefined();
    expect((appRouter as any).functional.history).toBeDefined();
  });

  it("reads the imported totals from the database", async () => {
    const summary = await getFunctionalSummary();
    expect(summary.servers).toBeGreaterThanOrEqual(84);
    expect(summary.contacts).toBeGreaterThanOrEqual(156);
    expect(summary.services).toBeGreaterThanOrEqual(156);
    expect(summary.interns).toBeGreaterThanOrEqual(38);
    expect(summary.incentives).toBeGreaterThanOrEqual(47);
    expect(summary.terceirizados).toBe(28);
  });

  it("reads the imported terceirizados and frequencies", async () => {
    const data = await listFunctionalData("");
    expect(data.terceirizados).toHaveLength(28);
    expect(data.frequenciasTerceirizados).toHaveLength(28);
    expect(data.contacts.filter(contact => contact.terceirizadoId).length).toBeGreaterThanOrEqual(28);
  });

  it("finds the reconciled server by matrícula", async () => {
    const data = await listFunctionalData("74493156");
    expect(data.servers.some(server => server.matricula === "74493156" && server.nomeOriginal === "FERNANDO DE SOUZA NUNES")).toBe(true);
  });

  it("creates, audits and deletes a temporary server through the public contract", async () => {
    const db = await getDb();
    expect(db).toBeDefined();
    if (!db) return;
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    const matricula = `TEST-${Date.now()}`;
    const created = await caller.functional.createServer({ matricula, nomeOriginal: "Servidor de Teste Base Mestre", categoria: "Técnico", status: "Ativo", cargo: "Teste", setor: "DEDC XI", cargaHoraria: "40h", telefone: "(75) 0000-0000", emailInstitucional: "teste@uneb.br", changedBy: "vitest" });
    expect(created?.matricula).toBe(matricula);
    expect(created?.categoria).toBe("Técnico");
    const history = await caller.functional.history({ serverId: created!.id });
    expect(history.some(item => item.reason === "Inclusão na Base Mestre")).toBe(true);
    await caller.functional.deleteServer({ id: created!.id, changedBy: "vitest" });
    const removed = (await db.select().from(servers).where(eq(servers.matricula, matricula)).limit(1))[0];
    expect(removed).toBeUndefined();
  });

  it("persists and restores a server update", async () => {
    const db = await getDb();
    expect(db).toBeDefined();
    if (!db) return;
    const original = (await db.select().from(servers).where(eq(servers.id, 1)).limit(1))[0];
    expect(original).toBeDefined();
    if (!original) return;
    const temporaryName = `${original.nomeOriginal} · teste de mutação`;
    try {
      const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
      const changed = await caller.functional.updateServer({ id: original.id, nomeOriginal: temporaryName, setor: "Setor de Teste", cargo: "Cargo de Teste", categoria: "Técnico", cpf: "123.456.789-09", rg: "TESTE-01", status: "Ativo", telefone: "(75) 0000-0001", emailInstitucional: "auditoria@uneb.br", emailPessoal: "pessoal@exemplo.com", dataNascimento: "1980-01-02", dataContratacao: "2020-03-04" });
      expect(changed?.nomeOriginal).toBe(temporaryName);
      expect(changed?.categoria).toBe("Técnico");
      expect(changed?.cpf).toBe("123.456.789-09");
      expect(changed?.emailPessoal).toBe("pessoal@exemplo.com");
      expect(changed?.dataNascimento).toBeInstanceOf(Date);
    } finally {
      await updateServerRecord(original.id, { nomeOriginal: original.nomeOriginal, setor: original.setor, cargo: original.cargo, categoria: original.categoria, cpf: original.cpf, rg: original.rg, status: original.status, telefone: original.telefone, emailInstitucional: original.emailInstitucional, emailPessoal: original.emailPessoal, dataNascimento: original.dataNascimento, dataContratacao: original.dataContratacao }, "vitest-restore");
    }
    const restored = (await db.select().from(servers).where(eq(servers.id, original.id)).limit(1))[0];
    expect(restored?.nomeOriginal).toBe(original.nomeOriginal);
  });

  it("propagates master contact fields to linked contacts by serverId", async () => {
    const db = await getDb();
    expect(db).toBeDefined();
    if (!db) return;
    const linkedContact = (await db.select().from(contacts).limit(1))[0];
    if (!linkedContact?.serverId) return;
    const server = (await db.select().from(servers).where(eq(servers.id, linkedContact.serverId)).limit(1))[0];
    if (!server) return;
    const originalPhone = linkedContact.telefoneOriginal;
    const originalEmail = linkedContact.emailOriginal;
    const linkedService = (await db.select().from(serviceRecords).where(eq(serviceRecords.serverId, server.id)).limit(1))[0];
    const linkedIntern = (await db.select().from(interns).where(eq(interns.serverId, server.id)).limit(1))[0];
    const linkedContractor = (await db.select().from(terceirizados).where(eq(terceirizados.serverId, server.id)).limit(1))[0];
    try {
      await updateServerRecord(server.id, { setor: "Setor de Teste", cargo: "Cargo de Teste", telefone: "(75) 99999-0000", emailInstitucional: "propagacao@uneb.br", dataNascimento: "1980-01-02" }, "vitest");
      const changedContact = (await db.select().from(contacts).where(eq(contacts.id, linkedContact.id)).limit(1))[0];
      expect(changedContact?.telefoneOriginal).toBe("(75) 99999-0000");
      expect(changedContact?.emailOriginal).toBe("propagacao@uneb.br");
      if (linkedService) {
        const changedService = (await db.select().from(serviceRecords).where(eq(serviceRecords.id, linkedService.id)).limit(1))[0];
        expect(changedService?.setor).toBe("Setor de Teste");
        expect(changedService?.cargo).toBe("Cargo de Teste");
        expect(changedService?.dataNascimento).toBeInstanceOf(Date);
      }
      if (linkedIntern) {
        const changedIntern = (await db.select().from(interns).where(eq(interns.id, linkedIntern.id)).limit(1))[0];
        expect(changedIntern?.setorAtuacao).toBe("Setor de Teste");
        expect(changedIntern?.dataNascimento).toBeInstanceOf(Date);
      }
      if (linkedContractor) {
        const changedContractor = (await db.select().from(terceirizados).where(eq(terceirizados.id, linkedContractor.id)).limit(1))[0];
        expect(changedContractor?.setor).toBe("Setor de Teste");
        expect(changedContractor?.cargoFuncao).toBe("Cargo de Teste");
        expect(changedContractor?.dataNascimento).toBeInstanceOf(Date);
      }
    } finally {
      await updateServerRecord(server.id, { setor: server.setor, cargo: server.cargo, telefone: originalPhone, emailInstitucional: originalEmail, dataNascimento: server.dataNascimento }, "vitest-restore");
    }
  });

  it("enforces conditional intern fields through the public contract", async () => {
    const db = await getDb();
    expect(db).toBeDefined();
    if (!db) return;
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    const matricula = `TEST-EST-${Date.now()}`;
    const created = await caller.functional.createServer({ matricula, nomeOriginal: "Estagiário Condicional de Teste", categoria: "Estagiário", status: "Ativo", cargo: "Estagiário", setor: "NUPE", estagiarioCalculaVigencia: "Sim", contagemRenovacao: 2, dataContratacao: "2025-01-10", dataTerminoVigencia: "2026-01-10", participarComemoracao: "Não", motivoNaoParticipar: "Teste automatizado", changedBy: "vitest" });
    expect(created?.categoria).toBe("Estagiário");
    expect(created?.estagiarioCalculaVigencia).toBe("Sim");
    expect(created?.contagemRenovacao).toBe(2);
    expect(created?.dataTerminoVigencia).toBeInstanceOf(Date);
    await caller.functional.deleteServer({ id: created!.id, changedBy: "vitest" });
  });

  it("exposes and updates institutional review items", async () => {
    const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
    expect((appRouter as any).functional.reviewQueue).toBeDefined();
    expect((appRouter as any).functional.reviewConflict).toBeDefined();
    const queue = await caller.functional.reviewQueue({ status: "pending" });
    expect(Array.isArray(queue)).toBe(true);
    if (queue.length === 0) return;
    const item = queue[0].conflict;
    const reviewed = await caller.functional.reviewConflict({ id: item.id, status: "ignored", changedBy: "vitest-review" });
    expect(reviewed.status).toBe("ignored");
  });
});
