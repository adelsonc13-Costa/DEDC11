export type SexoRgps = "Masculino" | "Feminino";

export type RegraRgps = "permanente" | "pontos" | "idadeProgressiva" | "pedagio50" | "pedagio100";

const DATA_REFORMA = new Date(Date.UTC(2019, 10, 13)); // 13/11/2019, EC 103/2019
const MS_POR_ANO = 365.25 * 86400000;

const PARAM_PERMANENTE: Record<SexoRgps, { idadeAnos: number; tempoAnos: number }> = {
  Feminino: { idadeAnos: 62, tempoAnos: 15 },
  Masculino: { idadeAnos: 65, tempoAnos: 20 },
};

const PARAM_PONTOS: Record<SexoRgps, { pontosIniciais: number; pontosTeto: number; anoTeto: number; tempoMinimoAnos: number }> = {
  Feminino: { pontosIniciais: 86, pontosTeto: 100, anoTeto: 2033, tempoMinimoAnos: 30 },
  Masculino: { pontosIniciais: 96, pontosTeto: 105, anoTeto: 2028, tempoMinimoAnos: 35 },
};

const PARAM_IDADE_PROGRESSIVA: Record<SexoRgps, { idadeInicial: number; idadeTeto: number; anoTeto: number; tempoMinimoAnos: number }> = {
  Feminino: { idadeInicial: 56, idadeTeto: 62, anoTeto: 2031, tempoMinimoAnos: 30 },
  Masculino: { idadeInicial: 61, idadeTeto: 65, anoTeto: 2027, tempoMinimoAnos: 35 },
};

const PARAM_PEDAGIO: Record<SexoRgps, { tempoMinimoAntigoAnos: number; elegibilidadePedagio50Anos: number; idadeMinimaPedagio100: number }> = {
  Feminino: { tempoMinimoAntigoAnos: 30, elegibilidadePedagio50Anos: 28, idadeMinimaPedagio100: 57 },
  Masculino: { tempoMinimoAntigoAnos: 35, elegibilidadePedagio50Anos: 33, idadeMinimaPedagio100: 60 },
};

function somarAnos(data: Date, anos: number): Date {
  return new Date(data.getTime() + anos * MS_POR_ANO);
}

function anoDecimal(data: Date): number {
  return data.getTime() / MS_POR_ANO + 1970;
}

function deAnoDecimal(anoDecimalValor: number): Date {
  return new Date((anoDecimalValor - 1970) * MS_POR_ANO);
}

function diferencaAnos(inicio: Date, fim: Date): number {
  return (fim.getTime() - inicio.getTime()) / MS_POR_ANO;
}

/**
 * Estimativa de aposentadoria RGPS/INSS (Fase B — Terceirizados), com base nas
 * 5 regras da EC 103/2019 (Reforma da Previdência), conforme
 * claude/motor-calculo-aposentadoria-rgps-terceirizados.md (fonte: Lala).
 *
 * Retorna a data mais favorável (mais cedo) entre as regras aplicáveis ao
 * segurado, além do detalhamento de cada regra individualmente. É uma
 * estimativa — não substitui simulação oficial do INSS (Meu INSS/CNIS).
 */
export function estimarAposentadoriaRgps(params: {
  dataNascimento?: string | null;
  dataInicioContribuicaoInss?: string | null;
  sexo?: SexoRgps | string | null;
}) {
  const { dataNascimento, dataInicioContribuicaoInss, sexo } = params;
  if (!dataNascimento || !dataInicioContribuicaoInss || !sexo) return null;
  if (sexo !== "Masculino" && sexo !== "Feminino") return null;

  const nascimento = new Date(dataNascimento);
  const inicioContribuicao = new Date(dataInicioContribuicaoInss);
  if (Number.isNaN(nascimento.getTime()) || Number.isNaN(inicioContribuicao.getTime())) return null;

  const n = anoDecimal(nascimento);
  const c = anoDecimal(inicioContribuicao);

  // 1) Regra permanente (art. 201, I, CF + art. 19, EC 103/2019)
  const parPermanente = PARAM_PERMANENTE[sexo];
  const dataPermanente = new Date(Math.max(
    somarAnos(nascimento, parPermanente.idadeAnos).getTime(),
    somarAnos(inicioContribuicao, parPermanente.tempoAnos).getTime(),
  ));

  // 2) Transição por pontos (art. 15, EC 103/2019)
  const parPontos = PARAM_PONTOS[sexo];
  const anoPreCapPontos = n + c + parPontos.pontosIniciais - 2019;
  const anoPontos = anoPreCapPontos < parPontos.anoTeto
    ? anoPreCapPontos
    : (parPontos.pontosTeto + n + c) / 2;
  const dataPontosCondicao = deAnoDecimal(anoPontos);
  const dataTempoMinimoPontos = somarAnos(inicioContribuicao, parPontos.tempoMinimoAnos);
  const dataPontos = new Date(Math.max(dataPontosCondicao.getTime(), dataTempoMinimoPontos.getTime()));

  // 3) Transição por idade mínima progressiva (art. 16, EC 103/2019)
  const parIdade = PARAM_IDADE_PROGRESSIVA[sexo];
  const anoPreCapIdade = 2 * n + 2 * parIdade.idadeInicial - 2019;
  const anoIdade = anoPreCapIdade < parIdade.anoTeto
    ? anoPreCapIdade
    : anoDecimal(somarAnos(nascimento, parIdade.idadeTeto));
  const dataIdadeCondicao = deAnoDecimal(anoIdade);
  const dataTempoMinimoIdade = somarAnos(inicioContribuicao, parIdade.tempoMinimoAnos);
  const dataIdadeProgressiva = new Date(Math.max(dataIdadeCondicao.getTime(), dataTempoMinimoIdade.getTime()));

  // 4) Pedágio de 50% (art. 17, EC 103/2019) e 5) Pedágio de 100% (art. 20, EC 103/2019)
  const parPedagio = PARAM_PEDAGIO[sexo];
  const tempoEmReforma = diferencaAnos(inicioContribuicao, DATA_REFORMA);
  const dataOriginalTempoAntigo = somarAnos(inicioContribuicao, parPedagio.tempoMinimoAntigoAnos);

  let dataPedagio50: Date | null = null;
  if (tempoEmReforma >= parPedagio.elegibilidadePedagio50Anos && tempoEmReforma < parPedagio.tempoMinimoAntigoAnos) {
    const tempoFaltanteEmReforma50 = parPedagio.tempoMinimoAntigoAnos - tempoEmReforma;
    dataPedagio50 = somarAnos(dataOriginalTempoAntigo, tempoFaltanteEmReforma50 * 0.5);
  }

  let dataPedagio100: Date | null = null;
  if (inicioContribuicao.getTime() <= DATA_REFORMA.getTime()) {
    const tempoFaltanteEmReforma100 = Math.max(0, parPedagio.tempoMinimoAntigoAnos - tempoEmReforma);
    const dataTempoPedagio100 = somarAnos(dataOriginalTempoAntigo, tempoFaltanteEmReforma100);
    const dataIdadeMinimaPedagio100 = somarAnos(nascimento, parPedagio.idadeMinimaPedagio100);
    dataPedagio100 = new Date(Math.max(dataTempoPedagio100.getTime(), dataIdadeMinimaPedagio100.getTime()));
  }

  const candidatos: { regra: RegraRgps; data: Date }[] = [
    { regra: "permanente", data: dataPermanente },
    { regra: "pontos", data: dataPontos },
    { regra: "idadeProgressiva", data: dataIdadeProgressiva },
  ];
  if (dataPedagio50) candidatos.push({ regra: "pedagio50", data: dataPedagio50 });
  if (dataPedagio100) candidatos.push({ regra: "pedagio100", data: dataPedagio100 });

  const maisFavoravel = candidatos.reduce((melhor, atual) => (atual.data.getTime() < melhor.data.getTime() ? atual : melhor));

  return {
    dataAptidao: maisFavoravel.data,
    regraMaisFavoravel: maisFavoravel.regra,
    regras: {
      permanente: dataPermanente,
      pontos: dataPontos,
      idadeProgressiva: dataIdadeProgressiva,
      pedagio50: dataPedagio50,
      pedagio100: dataPedagio100,
    },
  };
}
