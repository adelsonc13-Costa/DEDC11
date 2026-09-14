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

// Corte informado por Del: admitidos ate 31/12/2015 tem direito a licenca-premio
// por quinquenio; depois disso, nao. Pendente de confirmacao com fonte primaria
// pela Lala (ver claude/motor-calculo-tempo-servico-licenca-aposentadoria.md) —
// tratar como configuravel/revisavel, nao definitivo.
const CORTE_ADMISSAO_DIREITO = new Date(Date.UTC(2015, 11, 31));

// Quando uma mencao de ano (ex: "1991/1996") aparece logo depois de uma dessas
// expressoes, ela NAO conta como confirmacao daquele quinquenio - e so uma nota
// dizendo que aquele periodo ainda nao foi apurado/confirmado pelo DOOL.
const NEGACAO_PROXIMA = /(ainda\s+n[aã]o|n[aã]o\s+(foram|foi)?\s*confirmad|sem\s+confirma[cç][aã]o|n[aã]o\s+encontrou)/i;
const RAIO_NEGACAO = 120; // caracteres antes da mencao do ano onde procuramos negacao

// O desfecho REAL do quinquenio esta descrito no texto do achado, nao na
// categoria (eventType) dele — um achado "licenca-premio" pode muito bem
// descrever um pedido INDEFERIDO (ou seja, o direito continua em aberto).
const PADRAO_ABERTO = /confirmado em aberto|\bem aberto\b|indeferid|n[aã]o usufruiu|risco de perda/i;
const PADRAO_PECUNIA_PENDENTE = /pec[uú]nia[^.]*(em andamento|sem confirma[cç][aã]o|pendente)/i;
const PADRAO_PECUNIA_CONFIRMADA = /convertid[oa]\s+em\s+pec[uú]nia|pec[uú]nia\s+(paga|deferida|confirmada)/i;
const PADRAO_GOZADO = /\bgozad[oa]\b|\bgozou\b|usufruiu\s+(integralmente|o\s+per[ií]odo)/i;

function somarAnos(data: Date, anos: number): Date {
  const resultado = new Date(data);
  resultado.setUTCFullYear(resultado.getUTCFullYear() + anos);
  return resultado;
}

/**
 * Extrai todas as mencoes genuinas de intervalo de anos (ex: "2016/2021") no
 * texto, ignorando as que aparecem dentro de uma nota do tipo "os quinquenios
 * X, Y e Z ainda nao foram confirmados" (que sao o oposto de uma confirmacao).
 */
function extrairMencoesGenuinasDeAno(texto: string | null | undefined): Array<[number, number]> {
  if (!texto) return [];
  const regex = /(\d{4})\s*(?:\/|-|a)\s*(\d{4})/gi;
  const mencoes: Array<[number, number]> = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(texto))) {
    const a = Number(match[1]);
    const b = Number(match[2]);
    const inicioContexto = Math.max(0, match.index - RAIO_NEGACAO);
    const contextoAntes = texto.slice(inicioContexto, match.index);
    if (NEGACAO_PROXIMA.test(contextoAntes)) continue;
    mencoes.push([a, b]);
  }
  return mencoes;
}

function bateComJanela(mencao: [number, number], anoInicio: number, anoFim: number): boolean {
  return Math.abs(mencao[0] - anoInicio) <= 1 && Math.abs(mencao[1] - anoFim) <= 1;
}

/**
 * A partir do texto de um achado que genuinamente fala desse quinquenio,
 * decide o status real (aberto/pecunia/gozado) olhando o desfecho descrito —
 * nao a categoria do achado, que so diz do assunto, nao do resultado.
 */
function classificarDesfecho(texto: string | null | undefined): StatusQuinquenio | null {
  if (!texto) return null;
  if (PADRAO_ABERTO.test(texto)) return "aberto";
  if (PADRAO_PECUNIA_PENDENTE.test(texto)) return "aberto";
  if (PADRAO_PECUNIA_CONFIRMADA.test(texto)) return "pecunia";
  if (PADRAO_GOZADO.test(texto)) return "gozado";
  return null;
}

/**
 * Calcula as janelas de quinquenio de licenca-premio a partir da data de
 * admissao, e classifica cada uma cruzando com os achados (detectedPublications)
 * de categoria "licenca-premio" ou "pecunia" ja registrados para o servidor.
 *
 * Retorna null quando o servidor nao tem direito (admitido depois do corte,
 * ou sem data de admissao valida). Retorna um array vazio quando tem direito
 * mas ainda nao completou nenhum quinquenio.
 *
 * Por padrao cada quinquenio comeca como "aberto" (nao ha prova de que foi
 * gozado ou pago) e so muda de status quando um achado especifico e genuino
 * descreve um desfecho diferente.
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

    let status: StatusQuinquenio = "aberto";
    for (const achado of achados ?? []) {
      const tipo = achado.eventType;
      if (tipo !== "licenca-premio" && tipo !== "pecunia") continue;

      const mencoes = [...extrairMencoesGenuinasDeAno(achado.description), ...extrairMencoesGenuinasDeAno(achado.documentText)];
      const textoNaJanela = mencoes.some(m => bateComJanela(m, anoInicio, anoFim));
      // Se o texto menciona explicitamente OUTRO quinquenio especifico (e nao
      // este), o achado "pertence" aquele outro periodo - nao deixamos a data
      // de publicacao (com folga de +2 anos) vazar esse achado pra ca so
      // porque caiu por coincidencia dentro da janela deste quinquenio.
      const pertenceAOutroQuinquenioEspecifico = !textoNaJanela && mencoes.some(m => !bateComJanela(m, anoInicio, anoFim));

      const dataAchado = achado.publicationDate ? new Date(achado.publicationDate) : null;
      const dataNaJanela = !pertenceAOutroQuinquenioEspecifico && Boolean(dataAchado) && !Number.isNaN((dataAchado as Date).getTime()) && (dataAchado as Date).getTime() >= janelaDe && (dataAchado as Date).getTime() <= janelaAte;
      if (!dataNaJanela && !textoNaJanela) continue;

      const desfecho = classificarDesfecho(achado.description) ?? classificarDesfecho(achado.documentText);
      if (desfecho) {
        status = desfecho;
        break;
      }
      // achado bate na janela mas nao descreve um desfecho claro: mantem o
      // status atual (default "aberto") e segue olhando os demais achados,
      // caso algum outro seja mais explicito.
    }

    janelas.push({ inicio, fim, status });
    inicio = fim;
  }

  return janelas;
}

/** Atalho pra contar quantos quinquenios estao em aberto (uso em telas de lista/resumo). */
export function contarQuinqueniosEmAberto(quinquenios: Quinquenio[] | null): number {
  if (!quinquenios) return 0;
  return quinquenios.filter(q => q.status === "aberto").length;
}
