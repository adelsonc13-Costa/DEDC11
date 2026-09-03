// Direção Arquivo Vivo: editorial institucional, azul-marinho, marfim e dourado; dados claramente demonstrativos.
import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { FunctionalModules } from "@/components/FunctionalModules";
import { Activity, Archive, ArrowUpRight, Bell, BookOpen, Building2, CalendarDays, CheckCircle2, ChevronRight, CircleAlert, ClipboardCheck, Clock3, Download, FileText, Filter, GraduationCap, LayoutDashboard, Menu, Network, Plus, Search, ShieldCheck, Users, X } from "lucide-react";

const nav = [
  { id: "painel", label: "Painel", icon: LayoutDashboard },
  { id: "servidores", label: "Servidores", icon: Users },
  { id: "dedicacao", label: "Módulo D.E.", icon: ShieldCheck },
  { id: "alertas", label: "Tempo de serviço", icon: Bell },
  { id: "aniversariantes", label: "Aniversariantes", icon: CalendarDays },
  { id: "analises", label: "Análise funcional", icon: ClipboardCheck },
  { id: "estagiarios", label: "Estagiários", icon: GraduationCap },
  { id: "terceirizados", label: "Terceirizados", icon: Building2 },
  { id: "fontes", label: "Fontes e auditoria", icon: Network },
  { id: "permissoes", label: "Permissões", icon: ShieldCheck },
];

const servers = [
  { name: "Ana Paula Santos", registration: "DED11-0458", role: "Docente · Classe D", cargo: "Docente — Magistério Superior", regime: "40h", contract: "Efetivo", latestAct: "Progressão · vigente", status: "Em exercício", source: "DOOL" },
  { name: "Carlos Eduardo Lima", registration: "DED11-0312", role: "Docente · Classe C", cargo: "Docente — Magistério Superior", regime: "40h", contract: "Efetivo", latestAct: "D.E. · em análise", status: "Em análise", source: "SPO" },
  { name: "Marta Oliveira Reis", registration: "DED11-0197", role: "Técnica · Analista", cargo: "Analista Universitária", regime: "30h", contract: "Efetivo", latestAct: "Licença · vigente", status: "Em exercício", source: "PGDP" },
  { name: "Rafael Nascimento", registration: "DED11-0521", role: "Docente · Classe B", cargo: "Docente — Magistério Superior", regime: "40h", contract: "Temporário", latestAct: "—", status: "Férias programadas", source: "DOOL" },
];

const alerts = [
  { title: "Revisão de progressão — Ana Paula Santos", date: "28 ago 2026", tone: "gold" },
  { title: "Vigência de D.E. — Carlos Eduardo Lima", date: "03 set 2026", tone: "red" },
  { title: "Conferência documental — Marta Oliveira Reis", date: "17 set 2026", tone: "blue" },
];

const deValidated = [
  { name: "Jusceli Maria Oliveira de Carvalho Cardoso", portaria: "00825277", source: "DOE-BA", period: "2024", type: "Individual", start: "16/07/2024" },
  { name: "Simone Ribeiro Santos", portaria: "00847017", source: "DOE-BA", period: "2024", type: "Individual", start: "08/09/2024" },
  { name: "Elivania Reis de Andrade Alves", portaria: "00909682", source: "DOE-BA", period: "2025", type: "Individual", start: "16/03/2025" },
  { name: "Marcia Torres Neri Soares", portaria: "00929097", source: "DOE-BA", period: "2025", type: "Individual", start: "28/04/2025" },
  { name: "Selma Barros Daltro de Castro", portaria: "00910931", source: "DOE-BA", period: "2025", type: "Individual", start: "10/03/2025" },
  { name: "Edson Barreto Lima", portaria: "01039456", source: "DOE-BA", period: "2026", type: "Individual", start: "05/03/2026" },
  { name: "Rafael de Oliveira Rodrigues", portaria: "01039458", source: "DOE-BA", period: "2026", type: "Individual", start: "05/03/2026" },
  { name: "Isabelle Sanches Pereira", portaria: "367/2024", source: "DOE-BA", period: "2024", type: "Coletiva", start: "25/04/2024" },
  { name: "Isaura Santana Fontes", portaria: "367/2024", source: "DOE-BA", period: "2024", type: "Coletiva", start: "25/04/2024" },
  { name: "Jean da Silva Santos", portaria: "367/2024", source: "DOE-BA", period: "2024", type: "Coletiva", start: "25/04/2024" },
  { name: "Keilla Petronilia Santos Lopes", portaria: "367/2024", source: "DOE-BA", period: "2024", type: "Coletiva", start: "25/04/2024" },
  { name: "Jussara Fraga Portugal", portaria: "368/2024", source: "DOE-BA", period: "2024", type: "Coletiva", start: "25/04/2024" },
];
const deReclassified = [
  { name: "Bruno Leonardo Goncalves e Castro", registration: "74531241", source: "DOE-BA / SPO", type: "Progressão", reason: "A portaria 51578245 é progressão/horizontalização, não Dedicação Exclusiva." },
  { name: "Jucelia Macedo Pacheco", registration: "74509845", source: "DOE-BA / SPO", type: "Progressão", reason: "A portaria 51578245 é progressão/horizontalização, não Dedicação Exclusiva." },
  { name: "Claudene Ferreira Mendes Rios", registration: "74275141", source: "DOE-BA", type: "Licença-prêmio", reason: "Publicações referem-se a licença-prêmio convertida em pecúnia, sem concessão de D.E." },
  { name: "Maria da Paz de Jesus Rodrigues", registration: "74533079", source: "DOE-BA", type: "Afastamento", reason: "Publicações referem-se a afastamento para doutorado e licenças, sem concessão de D.E." },
  { name: "Ivan dos Reis Cardoso", registration: "74384213", source: "DOE-BA", type: "Incentivo", reason: "Ato registrado é incentivo funcional de doutorado, não D.E." },
  { name: "Monica Moreira de Oliveira Torres", registration: "74003435", source: "DOE-BA", type: "Comissão", reason: "Publicações referem-se a comissões e designações; a numeração citada não existe no acervo." },
  { name: "Glauce Maciel Barbosa Pereira", registration: "74449560", source: "DOE-BA", type: "Remoção", reason: "Publicações referem-se a remoção; a numeração citada não existe no acervo." },
  { name: "Telma Regina Batista Nascimento", registration: "74339088", source: "DOE-BA", type: "Comissão", reason: "Publicações referem-se a comissões; não confundir com outro registro de D.E. oficial." },
  { name: "Ana Cristina Silva de Oliveira Pereira", registration: "74282747", source: "DOE-BA", type: "Incentivo", reason: "Publicações referem-se a incentivos e comissões, sem publicação de D.E." },
  { name: "Joao Luiz da Silva Casas", registration: "92107257", source: "SPO", type: "Concurso", reason: "Nomeado em 40h via concurso; a planilha rotulava erroneamente como D.E." },
  { name: "Emilly Mascarenhas Costa", registration: "92102857", source: "DOE-BA", type: "Promoção", reason: "Portarias encontradas são de progressão/promoção, não D.E." },
  { name: "Zraydelson dos Santos", registration: "74626267", source: "DOE-BA", type: "Promoção", reason: "Portarias encontradas são de promoção; possível D.E. futura deve ser monitorada." },
  { name: "Madryracy Ferreira Coutinho Medeiros Ovidio", registration: "74372140", source: "SPO", type: "Outra natureza", reason: "Verificação no SPO não localizou portaria de D.E.; atos encontrados são de outra natureza." },
];

function Metric({ label, value, caption, icon: Icon, accent, featured = false }: { label: string; value: string; caption: string; icon: typeof Users; accent: string; featured?: boolean }) {
  return <div className={`relative overflow-hidden rounded-2xl border border-[#e4dfd4] bg-[#fffdf9] p-5 shadow-[0_12px_30px_rgba(37,52,72,0.06)] ${featured ? "sm:row-span-2 sm:p-7" : ""}`}><div className={`absolute left-0 top-0 h-full w-1 ${accent}`} /><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a6f3d]">{label}</p><p className={`${featured ? "text-5xl" : "text-4xl"} mt-3 font-serif text-[#102641]`}>{value}</p><p className="mt-2 max-w-[15rem] text-xs leading-5 text-slate-500">{caption}</p></div><div className="rounded-xl bg-[#f5f1e9] p-3 text-[#102641]"><Icon className="h-5 w-5" /></div></div><div className="pointer-events-none absolute bottom-0 right-0 h-16 w-20 rounded-tl-[3rem] border-l border-t border-[#eeeae0] opacity-70" /></div>;
}

function PanelHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <header className="mb-7"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9a7940]">{eyebrow}</p><h1 className="mt-2 font-serif text-3xl font-semibold tracking-[-0.02em] text-[#102641] md:text-4xl">{title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{description}</p></header>;
}

export default function Home() {
  const demoMode = import.meta.env.VITE_DEMO_MODE === "true";
  const functionalList = trpc.functional.list.useQuery({ search: "" });
  const functionalSummary = trpc.functional.summary.useQuery();
  const reviewQueue = trpc.functional.reviewQueue.useQuery();
  const detectedPublications = trpc.functional.detectedPublications.useQuery({ limit: 500 });
  const reviewConflict = trpc.functional.reviewConflict.useMutation({ onSuccess: () => reviewQueue.refetch() });
  const updateServer = trpc.functional.updateServer.useMutation();
  const createServer = trpc.functional.createServer.useMutation();
  const deleteServer = trpc.functional.deleteServer.useMutation();
  const utils = trpc.useUtils();

  const [active, setActive] = useState(() => {
    const requested = new URLSearchParams(window.location.search).get("module");
    return nav.some(item => item.id === requested) ? requested! : "painel";
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  type UiServer = (typeof servers)[number] & { id?: number; categoria?: string | null; telefone?: string | null; emailInstitucional?: string | null; emailPessoal?: string | null; cpf?: string | null; rg?: string | null; dataNascimento?: Date | string | null; dataContratacao?: Date | string | null; dataTerminoVigencia?: Date | string | null; participarComemoracao?: "Sim" | "Não" | null; motivoNaoParticipar?: string | null; docenteClasse?: string | null; docenteNivel?: string | null; tecnicoNivel?: number | null; grau?: number | null; referencia?: number | null; estagiarioCalculaVigencia?: "Sim" | "Não" | null; contagemRenovacao?: number | null; terceirizadoSubstituto?: "Sim" | "Não" | null; idServidorSubstituido?: number | null; incentivoTipo?: string | null; incentivoPortaria?: string | null; incentivoDataInicio?: Date | string | null; incentivoDataValidade?: Date | string | null; afastamentoMotivo?: string | null; afastamentoDataInicio?: Date | string | null; afastamentoDataFim?: Date | string | null; afastamentoDocumentoSei?: string | null; ultimaVarredura?: Date | string | null; cargoComissionado?: string | null; substitutoComissionado?: string | null; portariaSubstituicao?: string | null };
  const [selectedServer, setSelectedServer] = useState<UiServer | null>(null);
  const [serverRecords, setServerRecords] = useState<UiServer[]>(demoMode ? servers as UiServer[] : []);
  const serverRecordsFromDb = useMemo(() => (functionalList.data?.servers ?? []).map(server => ({ ...server, id: server.id, name: server.nomeOriginal, registration: server.matricula, role: server.cargo ?? "Cadastro institucional", cargo: server.cargo ?? "Não informado", regime: server.cargaHoraria ?? "Não informado", contract: "Cadastro institucional", latestAct: functionalList.data?.functionalActs.some(act => act.serverId === server.id) ? "Ato registrado" : "Sem ato relacionado", status: server.status ?? "Ativo", source: "Importação institucional", categoria: server.categoria ?? "Não informada", telefone: server.telefone ?? "", emailInstitucional: server.emailInstitucional ?? "", dataNascimento: server.dataNascimento ?? null, dataContratacao: server.dataContratacao ?? null })), [functionalList.data]);
  useEffect(() => { if (functionalList.data) setServerRecords(serverRecordsFromDb.length > 0 ? serverRecordsFromDb : demoMode ? servers : []); }, [functionalList.data, serverRecordsFromDb, demoMode]);
  const [editingServer, setEditingServer] = useState<UiServer | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createDraft, setCreateDraft] = useState({ matricula: "", nomeOriginal: "", categoria: "", status: "Ativo", cargo: "", setor: "", cargaHoraria: "", cpf: "", rg: "", telefone: "", emailInstitucional: "", emailPessoal: "", dataNascimento: "", dataContratacao: "", dataTerminoVigencia: "", participarComemoracao: "Sim", motivoNaoParticipar: "", docenteClasse: "", docenteNivel: "", tecnicoNivel: "", grau: "", referencia: "", estagiarioCalculaVigencia: "Não", contagemRenovacao: "0", terceirizadoSubstituto: "Não", idServidorSubstituido: "", incentivoTipo: "", incentivoPortaria: "", incentivoDataInicio: "", incentivoDataValidade: "", afastamentoMotivo: "", afastamentoDataInicio: "", afastamentoDataFim: "", afastamentoDocumentoSei: "", ultimaVarredura: "", cargoComissionado: "Nenhum", substitutoComissionado: "", portariaSubstituicao: "" });
  const [serverSearch, setServerSearch] = useState("");
  const [regimeFilter, setRegimeFilter] = useState("Todos os regimes");
  const [serverPage, setServerPage] = useState(1);
  const [deSearch, setDeSearch] = useState("");
  const [deStatus, setDeStatus] = useState("Todos os status");
  const [deSource, setDeSource] = useState("Todas as fontes");
  const [dePeriod, setDePeriod] = useState("Todos os períodos");
  const [deType, setDeType] = useState("Todos os tipos");
  const [deSort, setDeSort] = useState("Nome A–Z");
  const [dePage, setDePage] = useState(1);
  const [expandedDe, setExpandedDe] = useState<string | null>(null);
  const current = nav.find(item => item.id === active) ?? nav[0];
  const summary = functionalSummary.data;
  const historyInput = useMemo(() => ({ serverId: selectedServer?.id }), [selectedServer?.id]);
  const serverHistory = trpc.functional.history.useQuery(historyInput, { enabled: Boolean(selectedServer?.id) });
  const selectedMaster = selectedServer as (typeof selectedServer & { categoria?: string; telefone?: string; emailInstitucional?: string; emailPessoal?: string; cpf?: string; rg?: string; dataNascimento?: Date | string | null; dataContratacao?: Date | string | null; dataTerminoVigencia?: Date | string | null; participarComemoracao?: "Sim" | "Não" | null; motivoNaoParticipar?: string | null; docenteClasse?: string | null; docenteNivel?: string | null; tecnicoNivel?: number | null; grau?: number | null; referencia?: number | null; estagiarioCalculaVigencia?: "Sim" | "Não" | null; contagemRenovacao?: number | null; terceirizadoSubstituto?: "Sim" | "Não" | null; idServidorSubstituido?: number | null; cargoComissionado?: string | null; substitutoComissionado?: string | null; portariaSubstituicao?: string | null });
  const formatMasterDate = (value?: Date | string | null) => value ? new Date(value).toLocaleDateString("pt-BR") : "Não informado";
  const inputDate = (value?: Date | string | null) => value ? new Date(value).toISOString().slice(0, 10) : "";
  const updateCreateField = (key: string, value: string) => setCreateDraft(current => {
    const next = { ...current, [key]: value };
    const admission = key === "dataContratacao" ? value : next.dataContratacao;
    const calculates = key === "estagiarioCalculaVigencia" ? value : next.estagiarioCalculaVigencia;
    if (next.categoria === "Estagiário" && calculates === "Sim" && admission) {
      const date = new Date(`${admission}T00:00:00.000Z`);
      date.setUTCMonth(date.getUTCMonth() + 12);
      next.dataTerminoVigencia = date.toISOString().slice(0, 10);
    }
    return next;
  });
  const updateDraftField = (key: string, value: string) => setDraft(current => {
    const next = { ...current, [key]: value };
    const admission = key === "admission" ? value : next.admission;
    const calculates = key === "estagiarioCalculaVigencia" ? value : next.estagiarioCalculaVigencia;
    if (next.category === "Estagiário" && calculates === "Sim" && admission) {
      const date = new Date(`${admission}T00:00:00.000Z`);
      date.setUTCMonth(date.getUTCMonth() + 12);
      next.vencimento = date.toISOString().slice(0, 10);
    }
    return next;
  });

  const filteredRecords = serverRecords.filter(server => `${server.name} ${server.registration}`.toLowerCase().includes(serverSearch.toLowerCase()) && (regimeFilter === "Todos os regimes" || server.regime === regimeFilter));
  const serverPageSize = 100;
  const totalServerPages = Math.max(1, Math.ceil(filteredRecords.length / serverPageSize));
  const visibleServerRecords = filteredRecords.slice((serverPage - 1) * serverPageSize, serverPage * serverPageSize);
  const filteredValidated = deValidated.filter(item => item.name.toLowerCase().includes(deSearch.toLowerCase()) && (deSource === "Todas as fontes" || item.source === deSource) && (dePeriod === "Todos os períodos" || item.period === dePeriod) && (deType === "Todos os tipos" || item.type === deType) && (deStatus === "Todos os status" || deStatus === "Vigente"));
  const filteredReclassified = deReclassified.filter(item => item.name.toLowerCase().includes(deSearch.toLowerCase()) && (deSource === "Todas as fontes" || item.source.includes(deSource)) && (deType === "Todos os tipos" || item.type === deType) && (deStatus === "Todos os status" || deStatus === "Reclassificado"));
  const sortItems = <T extends { name: string }>(items: T[]) => [...items].sort((a, b) => deSort === "Nome Z–A" ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name));
  const sortedValidated = sortItems(filteredValidated);
  const sortedReclassified = sortItems(filteredReclassified);
  const pageSize = 4;
  const totalDePages = Math.max(1, Math.ceil(Math.max(sortedValidated.length, sortedReclassified.length) / pageSize));
  const visibleValidated = sortedValidated.slice((dePage - 1) * pageSize, dePage * pageSize);
  const visibleReclassified = sortedReclassified.slice((dePage - 1) * pageSize, dePage * pageSize);
  const saveServer = async (record: UiServer) => {
    if (!record.id) return;
    setSaveError(null);
    setSaveSuccess(false);
    if (draft.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) { setSaveError("Informe um e-mail institucional válido."); return; }
    if (draft.emailPersonal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.emailPersonal)) { setSaveError("Informe um e-mail pessoal válido."); return; }
    if (draft.cpf && draft.cpf.replace(/\D/g, "").length !== 11) { setSaveError("O CPF deve conter 11 dígitos."); return; }
    try {
      const updated = await updateServer.mutateAsync({ id: record.id, nomeOriginal: draft.name, setor: draft.department, cargo: draft.role, categoria: draft.category || null, cpf: draft.cpf || null, rg: draft.rg || null, cargaHoraria: draft.workload, telefone: draft.phone || null, emailInstitucional: draft.email || null, emailPessoal: draft.emailPersonal || null, dataNascimento: draft.birthDate || null, dataContratacao: draft.admission || null, dataTerminoVigencia: draft.vencimento || null, participarComemoracao: draft.participarComemoracao || null, motivoNaoParticipar: draft.motivoNaoParticipar || null, docenteClasse: draft.docenteClasse || null, docenteNivel: draft.docenteNivel || null, tecnicoNivel: draft.tecnicoNivel || null, grau: draft.grau || null, referencia: draft.referencia || null, estagiarioCalculaVigencia: draft.estagiarioCalculaVigencia || null, contagemRenovacao: draft.contagemRenovacao || null, terceirizadoSubstituto: draft.terceirizadoSubstituto || null, idServidorSubstituido: draft.idServidorSubstituido || null, incentivoTipo: draft.incentivoTipo || null, incentivoPortaria: draft.incentivoPortaria || null, incentivoDataInicio: draft.incentivoDataInicio || null, incentivoDataValidade: draft.incentivoDataValidade || null, afastamentoMotivo: draft.afastamentoMotivo || null, afastamentoDataInicio: draft.afastamentoDataInicio || null, afastamentoDataFim: draft.afastamentoDataFim || null, afastamentoDocumentoSei: draft.afastamentoDocumentoSei || null, cargoComissionado: draft.cargoComissionado || null, substitutoComissionado: draft.substitutoComissionado || null, portariaSubstituicao: draft.portariaSubstituicao || null, status: draft.status || "Ativo", changedBy: "usuário-demo" });
      const next = { ...record, ...updated, id: record.id, name: updated?.nomeOriginal ?? record.name, registration: updated?.matricula ?? record.registration, role: updated?.cargo ?? record.role, cargo: updated?.cargo ?? record.cargo, regime: updated?.cargaHoraria ?? record.regime, status: updated?.status ?? record.status, categoria: updated?.categoria ?? record.categoria, telefone: updated?.telefone ?? record.telefone, emailInstitucional: updated?.emailInstitucional ?? record.emailInstitucional, dataNascimento: updated?.dataNascimento ?? record.dataNascimento, dataContratacao: updated?.dataContratacao ?? record.dataContratacao };
      setServerRecords(currentRecords => currentRecords.map(item => item.id === record.id ? next : item));
      setSelectedServer(next);
      setEditingServer(null);
      setSaveSuccess(true);
      await Promise.all([utils.functional.list.invalidate(), utils.functional.summary.invalidate(), utils.functional.history.invalidate()]);
    } catch {
      setSaveError("Não foi possível salvar a alteração. Tente novamente.");
    }
  };
  const exportServers = () => { const header = "Matrícula,Nome,Vínculo,Cargo,Regime,Contratação,Ato mais recente\n"; const body = filteredRecords.map(server => [server.registration, server.name, server.role, server.cargo, server.regime, server.contract, server.latestAct].map(value => `"${value}"`).join(",")).join("\n"); const blob = new Blob([header + body], { type: "text/csv;charset=utf-8" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "servidores-dedc-xi-demo.csv"; link.click(); URL.revokeObjectURL(url); };
  const exportDeCsv = () => { const header = "Nome,Matrícula,Status,Portaria,Fonte,Tipo,Período,Início,Justificativa\n"; const validated = deValidated.map(item => [item.name, "", "Vigente", item.portaria, item.source, item.type, item.period, item.start, "Portaria específica localizada"]); const reclassified = deReclassified.map(item => [item.name, item.registration, "Reclassificado", "", item.source, item.type, "", "", item.reason]); const body = [...validated, ...reclassified].map(row => row.map(value => `"${value}"`).join(",")).join("\n"); const blob = new Blob([header + body], { type: "text/csv;charset=utf-8" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "modulo-de-dedicacao-exclusiva-demo.csv"; link.click(); URL.revokeObjectURL(url); };
  const exportDePdf = () => { const escapeHtml = (value: string) => value.replace(/[&<>\"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[character] ?? character)); const validatedRows = deValidated.map(item => `<tr><td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.portaria)}</td><td>${escapeHtml(item.source)}</td><td>${escapeHtml(item.type)}</td><td>${escapeHtml(item.start)}</td></tr>`).join(""); const reclassifiedRows = deReclassified.map(item => `<tr><td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.registration)}</td><td>${escapeHtml(item.type)}</td><td colspan="2">${escapeHtml(item.reason)}</td></tr>`).join(""); const printWindow = window.open("", "_blank", "noopener,noreferrer"); if (printWindow) { printWindow.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Relatório D.E. — DEDC XI</title><style>@page{size:A4;margin:16mm}*{box-sizing:border-box}body{font:10px Arial,sans-serif;color:#182d43;margin:0}.header{border-bottom:4px solid #d8b56d;padding-bottom:14px;margin-bottom:18px}.brand{font-weight:800;letter-spacing:.18em;font-size:13px}.unit{color:#637487;font-size:10px;margin-top:5px}.eyebrow{font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:#987638;font-weight:700;margin:20px 0 7px}.title{font:700 24px Georgia,serif;margin:0}.subtitle{color:#637487;line-height:1.5}.metrics{display:flex;gap:10px;margin:15px 0}.metric{border:1px solid #ddd8cc;padding:10px;flex:1;background:#faf8f2}.metric b{display:block;font:700 22px Georgia,serif;margin-top:4px}.metric span{font-size:8px;text-transform:uppercase;letter-spacing:.1em;color:#7d6a48}table{width:100%;border-collapse:collapse;margin:8px 0 18px}th{text-align:left;background:#102641;color:#fff;padding:7px;font-size:8px;text-transform:uppercase;letter-spacing:.08em}td{border-bottom:1px solid #e8e3d9;padding:7px;vertical-align:top;line-height:1.35}.validated th{background:#39724d}.reclassified th{background:#9d4d3d}.footer{border-top:1px solid #ddd8cc;margin-top:20px;padding-top:9px;color:#788695;font-size:8px;line-height:1.5}</style></head><body><header class="header"><div class="brand">UNEB · DEDC XI</div><div class="unit">Departamento de Educação · Campus XI · Serrinha</div></header><div class="eyebrow">Relatório demonstrativo de conciliação</div><h1 class="title">Dedicação Exclusiva</h1><p class="subtitle">Mapa de evidências, portarias e casos reclassificados para acompanhamento funcional.</p><div class="metrics"><div class="metric"><span>D.E. validados</span><b>12</b></div><div class="metric"><span>Reclassificados</span><b>13</b></div><div class="metric"><span>Fontes consultadas</span><b>03</b></div></div><div class="eyebrow">Evidência confirmada</div><table class="validated"><thead><tr><th>Nome</th><th>Portaria</th><th>Fonte</th><th>Tipo</th><th>Início</th></tr></thead><tbody>${validatedRows}</tbody></table><div class="eyebrow">Revisão necessária</div><table class="reclassified"><thead><tr><th>Nome</th><th>Matrícula</th><th>Natureza</th><th colspan="2">Justificativa</th></tr></thead><tbody>${reclassifiedRows}</tbody></table><div class="footer"><b>MODO DEMONSTRAÇÃO — dados fictícios.</b> Este relatório apresenta uma simulação visual e não substitui documento oficial. A validação institucional deve preservar a fonte, a data de consulta, o responsável pela revisão e a trilha de auditoria.</div></body></html>`); printWindow.document.close(); printWindow.focus(); printWindow.print(); } };
  
const createServerFromDraft = async () => {
  setCreateError(null);

  try {
    const dadosParaSalvar = { ...createDraft };

    const categoria = String(dadosParaSalvar.categoria ?? "")
      .trim()
      .toLowerCase();

    const cpfLimpo = String(dadosParaSalvar.cpf ?? "").replace(/\D/g, "");

    const isTerceirizado =
      categoria === "terceirizado" ||
      categoria === "terceirizados";

    if (isTerceirizado) {
      if (cpfLimpo.length > 0) {
        dadosParaSalvar.matricula = `TERC-${cpfLimpo}`.slice(0, 32);
      } else {
        const sufixo = crypto
          .randomUUID()
          .replace(/-/g, "")
          .slice(0, 27);

        dadosParaSalvar.matricula = `TERC-${sufixo}`;
      }
    }

    if (!dadosParaSalvar.matricula?.trim()) {
      throw new Error("A matrícula é obrigatória.");
    }

    await createServer.mutateAsync({
      ...dadosParaSalvar,
      dataNascimento: dadosParaSalvar.dataNascimento || null,
      dataContratacao: dadosParaSalvar.dataContratacao || null,
      dataTerminoVigencia: dadosParaSalvar.dataTerminoVigencia || null,
      changedBy: "usuário-demo",
    });

    setCreateOpen(false);

    setCreateDraft({
      matricula: "",
      nomeOriginal: "",
      categoria: "",
      status: "Ativo",
      cargo: "",
      setor: "",
      cargaHoraria: "",
      cpf: "",
      rg: "",
      telefone: "",
      emailInstitucional: "",
      emailPessoal: "",
      dataNascimento: "",
      dataContratacao: "",
      dataTerminoVigencia: "",
      participarComemoracao: "Sim",
      motivoNaoParticipar: "",
      docenteClasse: "",
      docenteNivel: "",
      tecnicoNivel: "",
      grau: "",
      referencia: "",
      estagiarioCalculaVigencia: "Não",
      contagemRenovacao: "0",
      terceirizadoSubstituto: "Não",
      idServidorSubstituido: "",
      incentivoTipo: "",
      incentivoPortaria: "",
      incentivoDataInicio: "",
      incentivoDataValidade: "",
      afastamentoMotivo: "",
      afastamentoDataInicio: "",
      afastamentoDataFim: "",
      afastamentoDocumentoSei: "",
      ultimaVarredura: "",
      cargoComissionado: "Nenhum",
      substitutoComissionado: "",
      portariaSubstituicao: "",
    });

    await Promise.all([
      utils.functional.list.invalidate(),
      utils.functional.summary.invalidate(),
    ]);
  } catch {
    setCreateError(
      "Não foi possível incluir. Verifique se a matrícula já existe e se os campos obrigatórios estão preenchidos.",
    );
  }
};

