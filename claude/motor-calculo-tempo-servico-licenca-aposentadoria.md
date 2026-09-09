# Motor de Cálculo — Tempo de Serviço, Licença-Prêmio e Estimativa de Aposentadoria

Levantado a partir de regras explicadas por Del. Isso não é um registro de achado isolado — é lógica de cálculo que deve rodar sobre os dados já existentes no cadastro (Data de Admissão, Data de Nascimento, achados de `averbacao` e `licenca-premio`).

## 1. Licença-Prêmio por Quinquênio

Regra confirmada por Del: servidores admitidos até 2015 têm direito a licença-prêmio a cada 5 anos (quinquênio), contado a partir da Data de Admissão. Servidores admitidos depois de 2015 não têm mais esse direito.

Cálculo esperado:

1. Se Data de Admissão for até 2015: gerar automaticamente as janelas de quinquênio a partir da admissão (ex.: admitido em 28/07/1993 → quinquênios 1993/1998, 1998/2003, 2003/2008, 2008/2013, 2013/2018...).
2. Se Data de Admissão for depois de 2015: não gerar nenhuma janela — o servidor simplesmente não tem esse direito.
3. Para cada quinquênio gerado, cruzar com os achados de categoria `licenca-premio` já registrados (que trazem o período/quinquênio no texto) e classificar automaticamente:
   - Gozado/usufruído — achado confirma licença tirada nesse período.
   - Convertido em pecúnia — achado (categoria `pecunia`) indica conversão em vez de gozo.
   - Em aberto — nenhum achado encontrado para aquele quinquênio específico. Isso é um alerta útil: sinaliza um direito não resolvido, que pode ter sido esquecido ou ainda não pesquisado nas fontes (DOOL/PGDP).

Caso real que já ilustra a utilidade disso: no dossiê da Idnéia (74003213) já registramos licença-prêmio dos quinquênios 1993/1998, 2003/2008 e uma referência a 2008/2013 — falta exatamente o quinquênio 1998/2003, que essa lógica de cálculo teria sinalizado automaticamente como "em aberto" em vez de precisarmos notar isso manualmente.

**Pendência a confirmar com fonte primária**: o corte exato de 2015 (data específica, não só o ano) e a base legal exata dessa mudança — hoje é informação passada por Del, ainda não conferida num texto de lei. Essa confirmação é escopo da Lala (normativas/estatutário), não do João — o motor de cálculo pode ser implementado com a regra como está, mas o corte deve ser tratado como configurável/revisável, não hardcoded como verdade definitiva, até confirmação.

## 2. Estimativa de Aposentadoria

Regra confirmada por Del: o tempo de serviço para fins de aposentadoria deve somar:

- Anos trabalhados (Data de Admissão até hoje)
- + Averbação (se houver achados de categoria `averbacao` — tempo de outros vínculos contado para aposentadoria)
- Cruzado com a idade da pessoa e a lei de aposentadoria vigente, para já produzir uma estimativa de quando a pessoa se torna elegível — não só registrar depois que já aconteceu.

Padrão observado nos dois casos reais já processados (Idnéia, técnica, e Zoraya, docente — ambas usando a mesma EC nº 26/2020, art. 4º caput e §2º, I, c/c art. 3º, §7º): a aposentadoria integral exige dois requisitos cumulativos, cada um com sua própria data de cumprimento:

1. Tempo mínimo de contribuição (tempo de serviço + averbação) — data em que esse total atinge o mínimo exigido.
2. Idade mínima — data em que a pessoa completa a idade exigida.

A pessoa só está apta na data mais tardia entre as duas — no caso da Idnéia, o tempo mínimo foi atingido em 14/05/2022, mas a idade mínima só em 25/09/2024, então a data de aptidão real foi 25/09/2024 (a mais tardia).

Cálculo esperado no sistema: para cada servidor, calcular e exibir no dossiê:

- Data estimada em que atinge o tempo mínimo de contribuição (projeção futura, se ainda não atingiu).
- Data em que atinge a idade mínima (data de nascimento + idade exigida).
- Data de aptidão estimada = a mais tardia das duas.

Isso transforma a aposentadoria de "descoberta depois que já é fato" (como aconteceu com a Idnéia e a Zoraya, que só documentamos via Parecer Técnico/Portaria já prontos) para uma estimativa proativa, útil pro RH planejar com antecedência.

**Pendência**: confirmar se a regra de tempo mínimo/idade mínima da EC 26/2020 (arts. 3º/4º) é a mesma para todas as categorias (técnico, analista, docente) ou se varia — os dois casos já vistos (uma técnica, uma docente) usaram a mesma citação legal, o que sugere que é uma regra geral do regime próprio de previdência do estado, não específica de categoria, mas vale confirmar com o texto integral da EC antes de fixar isso como regra única no sistema. Também escopo da Lala, não do João.

## Status

Regras de negócio levantadas, ainda não implementadas. Nenhum código ou schema alterado. A implementação técnica (motor de cálculo, novos campos/derivações no dossiê) depende de confirmação prévia das duas pendências legais acima — o João pode desenhar a estrutura de cálculo assumindo as regras como descritas, mas os parâmetros (corte de 2015, requisitos da EC 26/2020) devem ficar configuráveis/revisáveis, não fixos, até a Lala confirmar as fontes primárias.
