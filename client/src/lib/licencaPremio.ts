export type StatusQuinquenio = "gozado" | "pecunia" | "aberto";

export type Quinquenio = {
  inicio: Date;
  fim: Date;
  status: StatusQuinquenio;
};

export type AchadoLicencaPremio = {
  eventType?: string | null;
  publicationDate?: string | Date | null;
  description?: string | null;
  documentText?: string | null;
};

const MS_POR_ANO = 365.25 * 86400000;

// Corte informado por Del: admitidos ate 31/12/2015 tem direito a licenca-premio
// por quinquenio; depois disso, nao. Pendente de confirmacao com fonte primaria
// pela Lala (ver claude/motor-calculo-tempo-servico-licenca-aposentadoria.md) —
// tratar como configuravel/revisavel, nao definitivo.
const CORTE_ADMISSAO_DIREITO = new Date(Date.UTC(2015, 11, 31));

function somarAnos(data: Date, anos: number): Date {
  const resultado = new Date(data);
  resultado.setUTCFullYear(resultado.getUTCFullYear() + anos);
  return resultado;
}

function periodoCoincideComTexto(texto: string | null | undefined, anoInicio: number, anoFim: number): boolean {
  if (!texto) return false;
  const regex = /(\d{4})\s*(?:\/|-|a)\s*(\d{4})/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(texto))) {
    const a = Number(match[1]);
    const b = Number(match[2]);
    if (Math.abs(a - anoInicio) <= 1 && Math.abs(b - anoFim) <= 1) return true;
  }
  return false;
}

/**
 * Calcula as janelas de quinquenio de licenca-premio a partir da data de
 * admissao, e classifica cada uma cruzando com os achados (detectedPublications)
 * de categoria "licenca-premio" ou "pecunia" ja registrados para o servidor.
 *
 * Retorna null quando o servidor nao tem direito (admitido depois do corte,
 * ou sem data de admissao valida). Retorna um array vazio quando tem direito
 * mas ainda nao completou nenhum quinquenio.
 */
export function calcularQuinqueniosLicencaPremio(params: {
  dataContratacao?: string | Date | null;
  achados?: AchadoLicencaPremio[] | null;
  hoje?: Date;
}): Quinquenio[] | null {
  const { dataContratacao, achados, hoje = new Date() } = params;
  if (!dataContratacao) return null;
  const admissao = new Date(dataContratacao);
  if (Number.isNaN(admissao.getTime())) return null;
  if (admissao.getTime() > CORTE_ADMISSAO_DIREITO.getTime()) return null;

  const janelas: Quinquenio[] = [];
  let inicio = admissao;
  while (true) {
    const fim = somarAnos(inicio, 5);
    if (fim.getTime() > hoje.getTime()) break;

    const anoInicio = inicio.getUTCFullYear();
    const anoFim = fim.getUTCFullYear();
    const janelaDe = inicio.getTime();
    const janelaAte = somarAnos(fim, 2).getTime();

    let temPecunia = false;
    let temGozado = false;
    for (const achado of achados ?? []) {
      const tipo = achado.eventType;
      if (tipo !== "licenca-premio" && tipo !== "pecunia") continue;
      const dataAchado = achado.publicationDate ? new Date(achado.publicationDate) : null;
      const dataNaJanela = Boolean(dataAchado) && !Number.isNaN((dataAchado as Date).getTime()) && (dataAchado as Date).getTime() >= janelaDe && (dataAchado as Date).getTime() <= janelaAte;
      const textoNaJanela = periodoCoincideComTexto(achado.description, anoInicio, anoFim) || periodoCoincideComTexto(achado.documentText, anoInicio, anoFim);
      if (!dataNaJanela && !textoNaJanela) continue;
      if (tipo === "pecunia") temPecunia = true;
      if (tipo === "licenca-premio") temGozado = true;
    }

    janelas.push({ inicio, fim, status: temPecunia ? "pecunia" : temGozado ? "gozado" : "aberto" });
    inicio = fim;
  }

  return janelas;
}

/** Atalho pra contar quantos quinquenios estao em aberto (uso em telas de lista/resumo). */
export function contarQuinqueniosEmAberto(quinquenios: Quinquenio[] | null): number {
  if (!quinquenios) return 0;
  return quinquenios.filter(q => q.status === "aberto").length;
}
