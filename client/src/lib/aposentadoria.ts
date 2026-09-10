export type RegimeAposentadoria = "Regra permanente" | "Transição por pontos" | "Transição por pedágio";
export type Sexo = "Masculino" | "Feminino";

const PARAMETROS_RPPS: Record<RegimeAposentadoria, Record<Sexo, { idadeAnos: number; tempoAnos: number }>> = {
  "Regra permanente": { Feminino: { idadeAnos: 61, tempoAnos: 25 }, Masculino: { idadeAnos: 64, tempoAnos: 25 } },
  "Transição por pontos": { Feminino: { idadeAnos: 54, tempoAnos: 30 }, Masculino: { idadeAnos: 59, tempoAnos: 35 } },
  "Transição por pedágio": { Feminino: { idadeAnos: 57, tempoAnos: 30 }, Masculino: { idadeAnos: 60, tempoAnos: 35 } },
};

function somarAnos(data: Date, anos: number): Date {
  const resultado = new Date(data);
  resultado.setUTCFullYear(resultado.getUTCFullYear() + anos);
  return resultado;
}

export function estimarAposentadoriaRpps(params: {
  dataNascimento?: string | null;
  dataContratacao?: string | null;
  sexo?: Sexo | string | null;
  regime?: RegimeAposentadoria | string | null;
  averbacaoDias?: number | null;
}) {
  const { dataNascimento, dataContratacao, sexo, regime, averbacaoDias } = params;
  if (!dataNascimento || !dataContratacao || !sexo || !regime) return null;
  if (!(sexo in { Masculino: 1, Feminino: 1 })) return null;
  if (!(regime in PARAMETROS_RPPS)) return null;
  const nascimento = new Date(dataNascimento);
  const admissao = new Date(dataContratacao);
  if (Number.isNaN(nascimento.getTime()) || Number.isNaN(admissao.getTime())) return null;
  const parametros = PARAMETROS_RPPS[regime as RegimeAposentadoria][sexo as Sexo];
  const dataIdadeMinima = somarAnos(nascimento, parametros.idadeAnos);
  const dataTempoMinimoBase = somarAnos(admissao, parametros.tempoAnos);
  const diasAverbados = averbacaoDias ?? 0;
  const dataTempoMinimo = new Date(dataTempoMinimoBase.getTime() - diasAverbados * 86400000);
  const dataAptidao = dataIdadeMinima.getTime() > dataTempoMinimo.getTime() ? dataIdadeMinima : dataTempoMinimo;
  return { dataIdadeMinima, dataTempoMinimo, dataAptidao, idadeAnos: parametros.idadeAnos, tempoAnos: parametros.tempoAnos };
}
