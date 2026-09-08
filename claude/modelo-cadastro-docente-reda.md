# Modelo de Cadastro — Docente (Efetivo e REDA/Substituto)

Baseado no modelo real usado pela PGDP (Sistema RH Bahia/SAP, via despacho SEI 074.6944.2020.0035395-21) e em 3 casos concretos de REDA analisados. Segue a mesma lógica de campo condicional dinâmico já usada no Cadastro Mestre: o **Regime de Contratação** (Efetivo ou REDA) decide quais campos aparecem.

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
| Vigência atual do contrato | Data início, data fim previsto — **pode ser um prazo fixo do edital OU vinculado à duração do afastamento do efetivo coberto** (ex.: "2 anos, tempo de afastamento da docente") |
| Histórico de prorrogações | Lista: cada prorrogação com número de portaria, período, status dos documentos exigidos |
| Histórico de contratações da pessoa | Lista de vínculos REDA anteriores (recontratação) |
| **Efetivo(s) coberto(s)** | **Lista** (relação N:M) — cada item: nome/matrícula do efetivo, **motivo do afastamento** (enum abaixo), portaria comprobatória do afastamento do efetivo |
| Aprovação interna (pré-PGDP) | Colegiado de Curso (data da reunião/decisão) → Conselho Departamental (data da ratificação) — etapa anterior ao processo seguir para a PGDP |
| Checklist de renovação | Atestado de Frequência, Declaração de Desempenho, Portaria(s) de nomeação do(s) efetivo(s) substituído(s) — cada item com status pendente/anexado |
| Justificativa/carga prevista | Texto livre — turmas, projetos de extensão, comissões que o REDA vai assumir |

### Enum: Motivo do afastamento do efetivo

Base legal: Art. 47, caput, c/c Art. 33, incisos I e II, da Lei nº 8.352/2002.

1. Exoneração ou demissão
2. Falecimento
3. Aposentadoria
4. Afastamento ou licença de concessão obrigatória
5. Licença para capacitação (qualificação/estudo) — Art. 33, I e II

## 3. Restrição automática do REDA

Conforme Art. 50 da Lei 8.352/2002: docentes REDA **não têm direito a progressão de Nível**. A interface deve bloquear/ocultar esse campo para registros com Regime de Contratação = REDA, em vez de deixar como uma opção que alguém pode marcar por engano.

## 4. Pendência no `applyField`

O endpoint `/api/ingest/lala` hoje só aceita `grau`, `referencia`, `tecnicoNivel` (técnico/analista) em `applyField`. Para a automação valer também para docentes, precisa adicionar **`classe`** e **`nivel`** à lista de campos aplicáveis.

## 5. Casos de referência usados para montar este modelo

- **Zoraya Maria de Oliveira Marques** (matrícula 74282397) e **Macário Protazio Costa Junior** (nº pessoal SAP 72332875) — usados só como referência de estrutura de campos (tela real da PGDP), ambos já aposentados, não são casos ativos de dossiê.
- **Gilsimar Cerqueira de Oliveira** (matrícula 92092405) — REDA cobrindo 2 efetivos simultaneamente (Jean da Silva Santos → Pró-Reitoria; Ivan dos Reis Cardoso → Coordenação de Colegiado). Confirma relação N:M e o fluxo de checklist de prorrogação.
- **Nizaneia Nascimento de Matos** substituindo **Ana Cristina da Silva Pereira** (afastada para estudo/qualificação) — confirma o enum de motivos (Art. 47/33) e o fluxo de aprovação interna (Colegiado → Conselho Departamental → PGDP) antes da contratação.

## Status

Modelo desenhado, ainda não implementado no schema (`drizzle/schema.ts`), no formulário de cadastro (`Home.tsx`) nem no endpoint de ingestão (`server/lalaIngest.ts`). Pendências técnicas conhecidas: nova entidade/tabela para REDA com relação N:M a efetivos (não cabe como campo simples no Cadastro Mestre atual), expansão de `APPLY_FIELDS` com `classe`/`nivel`, exclusão da categoria `ferias` para docentes na validação de achados.
