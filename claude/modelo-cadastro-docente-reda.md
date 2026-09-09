# Modelo de Cadastro — Docente (Efetivo e REDA/Substituto)

Baseado no modelo real usado pela PGDP (Sistema RH Bahia/SAP, via despacho SEI 074.6944.2020.0035395-21) e em 3 casos concretos de REDA analisados nesta sessão. Segue a mesma lógica de campo condicional dinâmico já usada no Cadastro Mestre: o **Regime de Contratação** (Efetivo ou REDA) decide quais campos aparecem.

## 1. Docente Efetivo

| Grupo | Campos |
|---|---|
| Vínculo funcional | **Classe** (Auxiliar/Assistente/Adjunto/Titular/Pleno), **Nível** (A/B), Regime de trabalho (20h/40h/D.E.), Cargo, Colegiado/Departamento, Campus |
| Tempo de serviço | Data de ingresso, Tempo de Magistério, Tempo de Serviço Público total, Data de implemento de requisitos de aposentadoria |
| Remuneração/incentivos | Lista: tipo (Titulação/Produção Científica/GEAA/CET), percentual, vigência início-fim |
| Averbações | Lista: tipo (tempo público municipal/federal/estadual, exclusiva adicional, desaverbação), período, dias |
| Licenças | Lista: tipo (licença-prêmio, dedução de adiantamento), período aquisitivo, período de gozo |
| **Situação atual** | Ativo em exercício / **Afastado** (com motivo e vínculo ao REDA que está cobrindo a vaga, se houver) |

Quando um efetivo está **afastado**, o dossiê dele deve mostrar quem está cobrindo a vaga (vínculo inverso ao REDA), não só o REDA apontar para ele.

**Nota sobre férias de docente**: diferente do técnico/analista (férias individuais, com período aquisitivo e data de gozo programada por pessoa), a férias do docente é **recesso coletivo institucional em janeiro**, igual para todo o corpo docente. Não faz sentido modelar como achado individual por matrícula — não deve entrar no cadastro pessoal do docente, é uma informação de calendário acadêmico da instituição, não da pessoa. A categoria `ferias` do endpoint de achados, portanto, não se aplica a docentes (continua válida só para técnico/analista).

## 2. Docente REDA (Professor Substituto) — registro próprio, não um campo dentro do efetivo

O REDA precisa ser uma **pessoa com cadastro próprio** na lista de Servidores (matrícula, contrato, histórico), e não um dado embutido no dossiê de outra pessoa — porque a relação com o(s) efetivo(s) substituído(s) é **N:M**: um REDA pode cobrir mais de um efetivo ao mesmo tempo (caso real: Gilsimar Cerqueira de Oliveira, matrícula 92092405, cobrindo simultaneamente a saída de Jean da Silva Santos para a Pró-Reitoria e de Ivan dos Reis Cardoso para a Coordenação do Colegiado).

| Grupo | Campos |
|---|---|
| Base legal da contratação | Seleção Pública, nº do Edital / ano (não é concurso) |
| Área/Matéria/Componente Curricular | Texto livre ou lista, conforme edital de aprovação |
| Portaria de convocação inicial | Número + data de publicação no D.O.E. |
| Carga horária | Semanal (ex.: 40h) |
| **Vaga substituída** | Classe/Nível da vaga (ex.: "Auxiliar, Nível A"), **nome e matrícula do efetivo substituído**, **número do processo** (usado para consulta de andamento) |
| Vigência atual do contrato | Data início, data fim previsto — **pode ser um prazo fixo do edital OU vinculado à duração do afastamento do efetivo coberto** (ex.: "2 anos, tempo de afastamento da docente") |
| **Teto de permanência** | **Máximo 72 meses (6 anos)**: 36 meses do contrato inicial + até 36 meses de renovação. Sistema deve alertar ao se aproximar do limite. |
| Histórico de prorrogações | Lista: cada prorrogação com número de portaria, período, status dos documentos exigidos |
| Histórico de contratações da pessoa | Lista de vínculos REDA anteriores (recontratação) |
| **Efetivo(s) coberto(s)** | **Lista** (relação N:M) — cada item: nome/matrícula do efetivo, **motivo do afastamento** (enum abaixo), portaria comprobatória do afastamento do efetivo |
| Aprovação interna (pré-PGDP) | Colegiado de Curso (data da reunião/decisão) → Conselho Departamental (data da ratificação) — etapa anterior ao processo seguir para a PGDP |
| Checklist de renovação | Atestado de Frequência, Declaração de Desempenho, Portaria(s) de nomeação do(s) efetivo(s) substituído(s) — cada item com status pendente/anexado |
| Justificativa/carga prevista | Texto livre — turmas, projetos de extensão, comissões que o REDA vai assumir |
| **Vida funcional própria** | O docente substituto **não é um registro raso** — acumula histórico igual um efetivo: **comissões** (designações), **publicações**, **incentivos/pecúnia**. Usa as mesmas categorias de achado (`designacao`, `pecunia`, etc.), só não tem `progressao`/`promocao` (vedado pelo Art. 50). |

### Enum: Motivo do afastamento do efetivo

Base legal: Art. 47, caput, c/c Art. 33, incisos I e II, da Lei nº 8.352/2002.

1. Exoneração ou demissão
2. Falecimento
3. Aposentadoria
4. Afastamento ou licença de concessão obrigatória
5. Licença para capacitação (qualificação/estudo) — Art. 33, I e II

## 2.1 Técnico REDA — modelo diferente do Docente REDA

Confirmado por Del: **não é a mesma lógica do Docente REDA**. O Técnico REDA vem de **Concurso Público** (não Seleção Pública/Edital), com **cadastro de reserva** — candidatos aprovados vão sendo **convocados enquanto a vigência do concurso estiver válida**, sem estar vinculado a substituir uma pessoa específica ausente (diferente do Docente Substituto, que sempre cobre a vaga de alguém).

Por isso o Técnico REDA precisa de **cadastro próprio completo** (não um campo de referência simples anexado a outro cadastro, como o formulário atual do RH faz hoje — ver seção 5).

| Grupo | Campos |
|---|---|
| Base legal da contratação | Concurso Público — número do concurso/edital, data de homologação |
| Vigência do concurso | Data de validade do concurso (o Técnico REDA só pode ser convocado enquanto essa vigência estiver ativa) |
| Portaria de convocação | Número + data de publicação no D.O.E. |
| Posição no cadastro de reserva | Classificação/ordem de chamada, se relevante |
| Carga horária | Semanal |
| Vigência atual do contrato | Data início, data fim |
| Vida funcional própria | Mesma lógica do Docente REDA — comissões, publicações, incentivos, sem progressão/promoção |

## 3. Restrição automática do REDA

Conforme Art. 50 da Lei 8.352/2002: docentes REDA **não têm direito a progressão de Nível**. A interface deve bloquear/ocultar esse campo para registros com Regime de Contratação = REDA, em vez de deixar como uma opção que alguém pode marcar por engano.

## 4. Pendência no `applyField`

O endpoint `/api/ingest/lala` hoje só aceita `grau`, `referencia`, `tecnicoNivel` (técnico/analista) em `applyField`. Para a automação valer também para docentes, precisa adicionar **`classe`** e **`nivel`** à lista de campos aplicáveis.

## 5. Comparação com o formulário real do RH (Microsoft Forms — "Cadastro de Funcionário")

Levantado nesta sessão (navegação com dados fictícios, sem submissão) para conferir como o RH coleta esses dados hoje, na prática. Estrutura completa:

**Página 1 — comum a todas as categorias:** Nome completo, Data de aniversário, Telefone, Data de admissão, Setor, Carga horária.

**Setor (dropdown, lista fechada usada hoje pelo RH)**: Equipamento, Comunicação, Colegiado de Pedagogia, LIEGEO, LACARD, Laboratório de Informática, Recursos Humanos, Colegiado de Administração, Colegiado de Geografia, NUPE, Direção, Acadêmica, Administrativo, Financeiro, Almoxarifado, Informática, Protocolo, Mestrado, Biblioteca, CPCT, NAI. Vale usar essa lista como base do enum de "Setor/Departamento" no Cadastro Mestre, já que é a que o RH já usa.

**Página 2 — ramifica por Categoria (terceirizado/Docente/Técnico/Estagiário):**

- **Docente** → Classe Funcional (Assistente/Auxiliar/Adjunto/Plena/Substituto/Titular). Se Titular: Matrícula/Email/Titulação. Se qualquer outra classe (inclusive Plena e Substituto): só "Nível (A/B)". **Duas imprecisões no formulário atual do RH, que nosso modelo já corrige**: (1) Pleno não deveria ter pergunta de Nível, já que não tem A/B na lei; (2) só Titular pede matrícula/email, as outras classes não pedem — inconsistente.
- **Técnico** → Grau/referência (texto livre) + pergunta booleana **"Reda? (Sim/Não)"**. Se Sim: Nome do substituto, Matrícula do substituto, Número do processo — anexado ao cadastro do efetivo, não um cadastro à parte.
- **Estagiário** → Número do processo, Matrícula, Email, Titulação.
- **terceirizado** → Empresa (dropdown: Convic, Narwal, Creta, MAP, Positiva).

**Diferença importante de modelagem a decidir com o João**: o formulário atual do RH trata REDA de forma leve — um simples campo de referência (nome + matrícula + processo) anexado ao cadastro do efetivo, sem cadastro próprio. Isso é **mais simples** que o modelo completo que fechamos nas seções 1–2 deste documento (registro próprio do REDA, relação N:M, checklist de prorrogação, aprovação interna). Recomendo manter o modelo completo (é o que os casos reais como Gilsimar exigem — 1 REDA cobrindo 2 efetivos não cabe num campo simples), mas **adicionar também um campo de referência rápida no dossiê do efetivo** (nome/matrícula do substituto atual, somente leitura, derivado do vínculo N:M) — assim replicamos a visão rápida que o RH já usa, sem perder a riqueza do modelo completo por trás.

Também vale notar: o "Reda?" do formulário do RH só existe no caminho Técnico — no caminho Docente, a única forma de indicar REDA é escolher a classe "Substituto". Isso sugere que, na prática, REDA técnico e REDA docente têm sido tratados como conceitos diferentes pelo RH, mesmo sendo estruturalmente parecidos (ambos são contratação temporária cobrindo uma vaga). Vale unificar isso no Cadastro Mestre.

## 6. Casos de referência usados para montar este modelo

- **Zoraya Maria de Oliveira Marques** (matrícula 74282397) e **Macário Protazio Costa Junior** (nº pessoal SAP 72332875) — usados só como referência de estrutura de campos (tela real da PGDP), ambos já aposentados, não são casos ativos de dossiê.
- **Gilsimar Cerqueira de Oliveira** (matrícula 92092405) — REDA cobrindo 2 efetivos simultaneamente (Jean da Silva Santos → Pró-Reitoria; Ivan dos Reis Cardoso → Coordenação de Colegiado). Confirma relação N:M e o fluxo de checklist de prorrogação.
- **Nizaneia Nascimento de Matos** substituindo **Ana Cristina da Silva Pereira** (afastada para estudo/qualificação) — confirma o enum de motivos (Art. 47/33) e o fluxo de aprovação interna (Colegiado → Conselho Departamental → PGDP) antes da contratação.

## Status

Modelo desenhado, ainda não implementado no schema (`drizzle/schema.ts`), no formulário de cadastro (`Home.tsx`) nem no endpoint de ingestão (`server/lalaIngest.ts`). Pendências técnicas conhecidas: nova entidade/tabela para REDA (docente e técnico) com relação N:M a efetivos onde aplicável (não cabe como campo simples no Cadastro Mestre atual), expansão de `APPLY_FIELDS` com `classe`/`nivel`, exclusão da categoria `ferias` para docentes na validação de achados, campo de referência rápida (somente leitura) no dossiê do efetivo apontando para o substituto atual, e alerta de teto de permanência (72 meses) para Docente REDA.
