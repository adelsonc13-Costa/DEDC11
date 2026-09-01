import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, date } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const servers = mysqlTable("servers", {
  id: int("id").autoincrement().primaryKey(),
  idMestre: varchar("idMestre", { length: 36 }).notNull().unique(),
  matricula: varchar("matricula", { length: 32 }).notNull().unique(),
  nomeOriginal: text("nomeOriginal").notNull(),
  nomeNormalizado: varchar("nomeNormalizado", { length: 255 }).notNull(),
  setor: varchar("setor", { length: 180 }),
  cargo: varchar("cargo", { length: 180 }),
  categoria: varchar("categoria", { length: 80 }),
  status: varchar("status", { length: 64 }).default("Ativo"),
  cpf: varchar("cpf", { length: 32 }).unique(),
  rg: varchar("rg", { length: 64 }),
  telefone: varchar("telefone", { length: 64 }),
  emailInstitucional: varchar("emailInstitucional", { length: 320 }),
  emailPessoal: varchar("emailPessoal", { length: 320 }),
  cargaHoraria: varchar("cargaHoraria", { length: 32 }),
  dataNascimento: date("dataNascimento"),
  dataContratacao: date("dataContratacao"),
  dataTerminoVigencia: date("dataTerminoVigencia"),
  participarComemoracao: mysqlEnum("participarComemoracao", ["Sim", "Não"]).default("Sim"),
  motivoNaoParticipar: varchar("motivoNaoParticipar", { length: 255 }),
  docenteClasse: varchar("docenteClasse", { length: 80 }),
  docenteNivel: varchar("docenteNivel", { length: 32 }),
  tecnicoNivel: int("tecnicoNivel"),
  grau: int("grau"),
  referencia: int("referencia"),
  estagiarioCalculaVigencia: mysqlEnum("estagiarioCalculaVigencia", ["Sim", "Não"]).default("Não"),
  contagemRenovacao: int("contagemRenovacao").default(0),
  terceirizadoSubstituto: mysqlEnum("terceirizadoSubstituto", ["Sim", "Não"]).default("Não"),
  idServidorSubstituido: int("idServidorSubstituido"),
  incentivoTipo: varchar("incentivoTipo", { length: 120 }),
  incentivoPortaria: varchar("incentivoPortaria", { length: 180 }),
  incentivoDataInicio: date("incentivoDataInicio"),
  incentivoDataValidade: date("incentivoDataValidade"),
  afastamentoMotivo: varchar("afastamentoMotivo", { length: 80 }),
  afastamentoDataInicio: date("afastamentoDataInicio"),
  afastamentoDataFim: date("afastamentoDataFim"),
  afastamentoDocumentoSei: varchar("afastamentoDocumentoSei", { length: 180 }),
  ultimaVarredura: timestamp("ultimaVarredura"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const contacts = mysqlTable("contacts", {
  id: int("id").autoincrement().primaryKey(),
  serverId: int("serverId").references(() => servers.id),
  terceirizadoId: int("terceirizadoId").references(() => terceirizados.id),
  nomeOriginal: text("nomeOriginal").notNull(),
  setorOriginal: varchar("setorOriginal", { length: 180 }),
  telefoneOriginal: varchar("telefoneOriginal", { length: 64 }),
  emailOriginal: varchar("emailOriginal", { length: 320 }),
  sourceModule: varchar("sourceModule", { length: 120 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const serviceRecords = mysqlTable("serviceRecords", {
  id: int("id").autoincrement().primaryKey(),
  serverId: int("serverId").references(() => servers.id),
  nomeOriginal: text("nomeOriginal").notNull(),
  setor: varchar("setor", { length: 180 }),
  cargo: varchar("cargo", { length: 180 }),
  dataNascimento: date("dataNascimento"),
  dataContratacao: date("dataContratacao"),
  averbacaoDias: int("averbacaoDias"),
  sourceModule: varchar("sourceModule", { length: 120 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const interns = mysqlTable("interns", {
  id: int("id").autoincrement().primaryKey(),
  serverId: int("serverId").references(() => servers.id),
  matricula: varchar("matricula", { length: 32 }),
  nomeOriginal: text("nomeOriginal").notNull(),
  cursando: varchar("cursando", { length: 180 }),
  setorAtuacao: varchar("setorAtuacao", { length: 180 }),
  turno: varchar("turno", { length: 64 }),
  responsavel: varchar("responsavel", { length: 180 }),
  numeroProcesso: varchar("numeroProcesso", { length: 120 }),
  bolsa: varchar("bolsa", { length: 100 }),
  dataContratacao: date("dataContratacao"),
  dataNascimento: date("dataNascimento"),
  vencimento: date("vencimento"),
  renovacao: varchar("renovacao", { length: 32 }),
  sourceModule: varchar("sourceModule", { length: 120 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const terceirizados = mysqlTable("terceirizados", {
  id: int("id").autoincrement().primaryKey(),
  serverId: int("serverId").references(() => servers.id),
  nomeOriginal: text("nomeOriginal").notNull(),
  nomeNormalizado: varchar("nomeNormalizado", { length: 255 }).notNull(),
  cpf: varchar("cpf", { length: 32 }).unique(),
  cargoFuncao: varchar("cargoFuncao", { length: 180 }),
  setor: varchar("setor", { length: 180 }),
  localLotacao: varchar("localLotacao", { length: 180 }),
  telefone: varchar("telefone", { length: 64 }),
  email: varchar("email", { length: 320 }),
  empresa: varchar("empresa", { length: 255 }).notNull(),
  contrato: varchar("contrato", { length: 120 }).notNull(),
  numeroContrato: varchar("numeroContrato", { length: 120 }),
  inicioContrato: date("inicioContrato"),
  fimContrato: date("fimContrato"),
  situacaoContrato: varchar("situacaoContrato", { length: 64 }),
  dataNascimento: date("dataNascimento"),
  observacoes: text("observacoes"),
  sourceModule: varchar("sourceModule", { length: 120 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const frequenciasTerceirizados = mysqlTable("frequenciasTerceirizados", {
  id: int("id").autoincrement().primaryKey(),
  terceirizadoId: int("terceirizadoId").references(() => terceirizados.id),
  nomeOriginal: text("nomeOriginal").notNull(),
  empresa: varchar("empresa", { length: 255 }).notNull(),
  contrato: varchar("contrato", { length: 120 }).notNull(),
  pagina: int("pagina"),
  mesReferencia: varchar("mesReferencia", { length: 64 }),
  dataEmissao: varchar("dataEmissao", { length: 64 }),
  funcao: varchar("funcao", { length: 180 }),
  turno: varchar("turno", { length: 64 }),
  ocorrencias: text("ocorrencias"),
  dias: int("dias"),
  substituto: varchar("substituto", { length: 180 }),
  sourceModule: varchar("sourceModule", { length: 120 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const functionalActs = mysqlTable("functionalActs", {
  id: int("id").autoincrement().primaryKey(),
  serverId: int("serverId").references(() => servers.id),
  tipo: varchar("tipo", { length: 100 }).notNull(),
  portaria: varchar("portaria", { length: 180 }),
  processoSei: varchar("processoSei", { length: 180 }),
  setor: varchar("setor", { length: 180 }),
  cargaHoraria: varchar("cargaHoraria", { length: 32 }),
  sourceModule: varchar("sourceModule", { length: 120 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const productionIncentives = mysqlTable("productionIncentives", {
  id: int("id").autoincrement().primaryKey(),
  serverId: int("serverId").references(() => servers.id),
  matricula: varchar("matricula", { length: 32 }),
  nomeOriginal: text("nomeOriginal").notNull(),
  numeroPortaria: varchar("numeroPortaria", { length: 180 }),
  colegiado: varchar("colegiado", { length: 180 }),
  dataInicio: date("dataInicio"),
  dataTermino: date("dataTermino"),
  diasFaltantes: varchar("diasFaltantes", { length: 64 }),
  sourceModule: varchar("sourceModule", { length: 120 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const serverChangeHistory = mysqlTable("serverChangeHistory", {
  id: int("id").autoincrement().primaryKey(),
  serverId: int("serverId").references(() => servers.id),
  matricula: varchar("matricula", { length: 32 }),
  fieldName: varchar("fieldName", { length: 120 }).notNull(),
  previousValue: text("previousValue"),
  newValue: text("newValue"),
  changedBy: varchar("changedBy", { length: 255 }).notNull(),
  reason: varchar("reason", { length: 255 }),
  eventType: varchar("eventType", { length: 80 }),
  processSei: varchar("processSei", { length: 180 }),
  publicationNumber: varchar("publicationNumber", { length: 180 }),
  doeLink: varchar("doeLink", { length: 500 }),
  startDate: date("startDate"),
  endDate: date("endDate"),
  publicationDate: date("publicationDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const detectedPublications = mysqlTable("detectedPublications", {
  id: int("id").autoincrement().primaryKey(),
  serverId: int("serverId").references(() => servers.id),
  matricula: varchar("matricula", { length: 32 }),
  nomeOriginal: text("nomeOriginal"),
  sourceKey: varchar("sourceKey", { length: 80 }).notNull(),
  sourceLabel: varchar("sourceLabel", { length: 180 }).notNull(),
  sourceUrl: varchar("sourceUrl", { length: 500 }).notNull(),
  documentUrl: varchar("documentUrl", { length: 500 }),
  eventType: varchar("eventType", { length: 80 }).notNull(),
  publicationDate: date("publicationDate"),
  description: text("description"),
  documentText: text("documentText"),
  scanMode: mysqlEnum("scanMode", ["historical", "daily"]).notNull(),
  fingerprint: varchar("fingerprint", { length: 64 }).notNull().unique(),
  reviewStatus: mysqlEnum("reviewStatus", ["pending", "approved", "discarded"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const importRuns = mysqlTable("importRuns", {
  id: int("id").autoincrement().primaryKey(),
  source: varchar("source", { length: 255 }).notNull(),
  version: varchar("version", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["dry_run", "committed", "failed"]).notNull(),
  insertedCount: int("insertedCount").default(0).notNull(),
  updatedCount: int("updatedCount").default(0).notNull(),
  pendingCount: int("pendingCount").default(0).notNull(),
  notes: text("notes"),
  scheduleCronTaskUid: varchar("scheduleCronTaskUid", { length: 65 }).unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const importConflicts = mysqlTable("importConflicts", {
  id: int("id").autoincrement().primaryKey(),
  runId: int("runId").references(() => importRuns.id),
  serverId: int("serverId").references(() => servers.id),
  module: varchar("module", { length: 120 }).notNull(),
  recordKey: varchar("recordKey", { length: 120 }),
  conflictType: varchar("conflictType", { length: 100 }).notNull(),
  details: text("details").notNull(),
  status: mysqlEnum("status", ["pending", "resolved", "ignored"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const serversRelations = relations(servers, ({ many }) => ({
  contacts: many(contacts),
  serviceRecords: many(serviceRecords),
  interns: many(interns),
  functionalActs: many(functionalActs),
  productionIncentives: many(productionIncentives),
  terceirizados: many(terceirizados),
}));

export const terceirizadosRelations = relations(terceirizados, ({ many }) => ({
  frequencias: many(frequenciasTerceirizados),
}));

export const serverChangeHistoryRelations = relations(serverChangeHistory, ({ one }) => ({
  server: one(servers, { fields: [serverChangeHistory.serverId], references: [servers.id] }),
}));

export const detectedPublicationsRelations = relations(detectedPublications, ({ one }) => ({
  server: one(servers, { fields: [detectedPublications.serverId], references: [servers.id] }),
}));

export const importRunsRelations = relations(importRuns, ({ many }) => ({
  conflicts: many(importConflicts),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Server = typeof servers.$inferSelect;
export type InsertServer = typeof servers.$inferInsert;
