import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, date } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name").notNull(),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }).default("local"),
  role: varchar("role", { length: 32 }).default("user"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn"),
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
  cargoComissionado: varchar("cargoComissionado", { length: 80 }),
  substitutoComissionado: varchar("substitutoComissionado", { length: 180 }),
  portariaSubstituicao: varchar("portariaSubstituicao", { length: 180 }),
  contrato: varchar("contrato", { length: 120 }),
  empresa: varchar("empresa", { length: 180 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const interns = mysqlTable("interns", {
  id: int("id").autoincrement().primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const productionIncentives = mysqlTable("productionIncentives", {
  id: int("id").autoincrement().primaryKey(),
  serverId: int("serverId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const functionalActs = mysqlTable("functionalActs", {
  id: int("id").autoincrement().primaryKey(),
  serverId: int("serverId"),
  type: varchar("type", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const frequenciasTerceirizados = mysqlTable("frequenciasTerceirizados", {
  id: int("id").autoincrement().primaryKey(),
  serverId: int("serverId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const detectedPublications = mysqlTable("detectedPublications", {
  id: int("id").autoincrement().primaryKey(),
  title: text("title"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const importConflicts = mysqlTable("importConflicts", {
  id: int("id").autoincrement().primaryKey(),
  details: text("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const importRuns = mysqlTable("importRuns", {
  id: int("id").autoincrement().primaryKey(),
  status: varchar("status", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const contacts = mysqlTable("contacts", {
  id: int("id").autoincrement().primaryKey(),
  name: text("name"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Server = typeof servers.$inferSelect;
export type InsertServer = typeof servers.$inferInsert;
