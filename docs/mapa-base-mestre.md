# Mapa de dependências da Base Mestre

## Estado atual auditado

A tabela `servers` já é o cadastro mestre de servidores, identificada por `id` técnico e `matricula` única. Ela contém nome, lotação/setor, cargo, jornada, nascimento e contratação. A lista de Servidores consulta essa tabela por tRPC e mantém o fallback visual apenas quando `VITE_DEMO_MODE=true`.

| Módulo | Fonte atual | Relação com servidor | Situação da propagação |
|---|---|---|---|
| Servidores | `servers` | `matricula` + `id` | Fonte principal e editável |
| Contatos | `contacts` | `serverId` ou `terceirizadoId` | Consulta persistida; atualização cruzada precisa ser centralizada |
| Aniversariantes | `servers`, `serviceRecords`, `interns`, `terceirizados` | `serverId` quando disponível; nomes em legados | Visualização consolidada; faltam vínculos para todos os legados |
| Tempo de serviço | `serviceRecords` | `serverId` quando disponível | Dados persistidos, mas alguns campos são cópia documental |
| Estagiários | `interns` | `serverId` opcional e matrícula | Cadastro funcional separado por natureza do vínculo |
| Terceirizados | `terceirizados` | `serverId` opcional e `terceirizadoId` nos contatos | Cadastro separado por contrato, sem correspondências seguras com servidores |
| Atos funcionais | `functionalActs` | `serverId` | Dependente do cadastro mestre |
| Produção científica | `productionIncentives` | `serverId` e matrícula | Dependente do cadastro mestre quando relacionado |
| Módulo D.E. | dados demonstrativos locais em `Home.tsx` | ainda não ligado aos atos persistidos | Preservado como conciliação documental demonstrativa |
| Fontes e auditoria | `contacts` e `importRuns` | vínculos por identificador quando existentes | Consulta de origem e metadados |

## Decisão arquitetural

A aba **Servidores** será a única área de edição dos dados pessoais e funcionais de servidores públicos. Módulos secundários consultarão `servers` por `serverId`/`matricula` e poderão manter dados documentais próprios apenas quando forem fatos de outra natureza, como frequência de terceirizado, portaria ou histórico de importação. Nomes não serão usados como chave de atualização.

A separação de `interns` e `terceirizados` permanece necessária porque são vínculos distintos e possuem atributos próprios. Quando uma pessoa tiver evidência de vínculo com `servers`, o campo `serverId` será usado; sem evidência, o registro permanecerá pendente e não será convertido automaticamente.

## Lacunas prioritárias

A edição de servidor atualmente atualiza os campos básicos do registro e invalida as consultas de lista e resumo, mas ainda não grava histórico de campo a campo. Inclusão e exclusão autorizada precisam de procedimentos específicos. Contatos e registros legados precisam receber atualizações por `serverId`, sem depender de comparação nominal durante a edição. O módulo demonstrativo de D.E. deve continuar intacto até que sua fonte documental seja ligada aos atos persistidos.
