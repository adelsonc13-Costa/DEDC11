
# Auditoria comparativa preliminar

## Projeto principal publicado

O projeto principal acessível em `https://dedc11vida-x62unti3.manus.space/` apresenta um painel demonstrativo sem login, navegação lateral com Painel, Servidores, Módulo D.E., Alertas, Análise funcional, Estagiários e Fontes e auditoria. A tela Servidores possui listagem com nome, matrícula, vínculo, situação e fonte; pesquisa e filtros são apenas visuais. O dossiê abre em modal e já possui edição demonstrativa com campos de identificação básica, vínculo, unidade, contato, admissão, carga horária, titulação, último ato e observações. O salvamento é local, sem persistência.

O dashboard usa indicadores estáticos fictícios, distribuição por tipo de ato e alertas fictícios. Não há, no modo publicado atual, cadastro real, paginação, ordenação, histórico funcional persistente, atualização global, relatórios ou integração com banco real.

## Projeto de referência

O endereço `https://dedc11vida-rz9m7sck.manus.space/servidores` foi acessado, mas exibiu uma tela de autenticação institucional (“Sign in to continue”). Sem uma sessão autenticada, não foi possível observar a listagem, os campos de edição, filtros, componentes ou o comportamento interno do projeto de referência. Não é seguro inferir esses recursos a partir da URL.

## Matriz preliminar

| Recurso | Projeto principal observado | Projeto de referência observado | Decisão provisória |
|---|---|---|---|
| Dashboard | Interface demonstrativa com indicadores fictícios | Não acessível sem autenticação | Preservar layout do principal; substituir estáticos por fonte única quando o ambiente real for conectado |
| Servidores | Listagem demonstrativa e dossiê modal | Não acessível | Preservar a navegação e ampliar após auditoria autenticada |
| Cadastro/edição | Formulário demonstrativo local | Não acessível | Manter campos atuais; incorporar somente campos confirmados no projeto de referência |
| Pesquisa/filtros | Controles visuais sem lógica completa | Não acessível | Implementar somente após definir fonte de dados |
| Histórico | Não implementado persistentemente | Não acessível | Planejar como requisito estrutural do projeto base |
| Banco de dados | Não usado pela publicação demonstrativa | Não acessível | Não alterar nem migrar sem abrir o projeto base editável |
| Autenticação | Removida no modo demonstração | Exigida pelo projeto de referência | Manter demonstração separada do ambiente institucional real |
| Responsividade | Sidebar responsiva e modal adaptável | Não acessível | Preservar e testar em dispositivos reais |

## Risco principal

O domínio publicado atualmente não está comprovadamente ligado ao projeto original com banco e dados institucionais. A versão demonstrativa foi criada como projeto web estático separado porque o identificador do projeto original não pôde ser aberto nesta sessão. Para cumprir integralmente a regra de preservar dados e evoluir o projeto atual, é necessário abrir o projeto original editável ou obter acesso autenticado ao projeto de referência antes de qualquer migração estrutural.

## Dedicação Exclusiva — referência

A URL `https://dedc11vida-rz9m7sck.manus.space/dedicacao-exclusiva` foi aberta diretamente. Nesta sessão, a página exibiu uma tela em branco; o HTML continha apenas o título `DEDC 11 — Vida Funcional` e o bundle JavaScript `/assets/index-DgR480mq.js`, sem texto, controles ou estrutura de conteúdo renderizada. Portanto, não é possível inferir com segurança os campos e ações dessa tela apenas pela URL. Uma captura autenticada ou acesso pela sessão do usuário será necessário para auditoria visual dessa funcionalidade.

## Validação ao vivo do Módulo D.E. consolidado

No preview do projeto principal, a navegação para **Módulo D.E.** funcionou após selecionar o item correto. A tela renderizou os cartões de indicadores **D.E. validados — 12** e **Reclassificados — 13**, os grupos de evidência confirmada e revisão necessária, portarias, referências DOE-BA, datas de início/fim, link para reprodução oficial e a seção de metodologia da conciliação.

A primeira tentativa de clique abriu Alertas porque a lista de controles mudou de índice durante a atualização; a segunda seleção abriu corretamente o Módulo D.E. Isso indica uma questão de identificação do controle na automação, não uma falha de navegação do painel.

## Validação da evolução do Módulo D.E.

No preview atualizado, a navegação para Módulo D.E. renderizou a lista ampliada com os 12 registros validados e os 13 reclassificados. Também foram confirmados os controles operacionais: busca por nome, status (Todos/Vigente/Reclassificado), fonte (Todas/DOE-BA/SPO), período (Todos/2024/2025/2026) e tipo de ato, incluindo Individual, Coletiva, Progressão, Licença-prêmio, Afastamento, Incentivo, Comissão, Remoção, Concurso, Promoção e Outra natureza.

## Validação dos três aprimoramentos

No preview atualizado, o Módulo D.E. apresentou o seletor de ordenação `Nome A–Z`/`Nome Z–A`, os cinco filtros, a lista paginada com quatro registros por grupo e a indicação `Página 1 de 4`. Cada registro validado passou a oferecer `Ver detalhes da portaria`, e cada reclassificado oferece `Ver detalhes da reclassificação`. A ordenação inicial exibiu Edson Barreto Lima, Elivania Reis de Andrade Alves, Isabelle Sanches Pereira e Isaura Santana Fontes, confirmando o comportamento A–Z.

## Validação dos três aprimoramentos atuais

O dossiê de Ana Paula Santos abriu corretamente a partir da tabela de Servidores e exibiu o botão Editar. A visualização ampliada confirmou vínculo, cargo, regime, contratação, situação, unidade/departamento, contato institucional, admissão, titulação, fonte documental, último ato e data de conferência. A tela Servidores também confirmou os comandos Excel completo, Cadastrar servidor, busca e filtro de regime.

## Validação de busca e paginação de Servidores

No preview atualizado, a tela Servidores apresentou o campo `Buscar por nome ou matrícula`, o filtro de regime e a paginação operacional. Com os quatro registros demonstrativos, a primeira página exibiu três registros e o contador `Exibindo 1–3 de 4 registros`, com `Página 1 de 2` e controles `Anterior` e `Próxima`.

## Auditoria da fonte de Promoção dos Professores

A sessão autorizada exibiu o módulo Promoção dos Professores com 54 registros. Foram identificados os campos Nome completo, Matrícula, Setor, Data de nascimento, Titulação, Nível, C.H., Portaria e Processo SEI. A origem oferece baixar PDF, adicionar registro, editar, excluir, ordenar por nome e definir linhas por página. O módulo Docentes aparece no mesmo sistema e deve ser a entidade principal de relacionamento. O conteúdo foi apenas lido; nenhum registro foi alterado ou exportado.

## Status do mapeamento ampliado

A sessão autorizada do sistema-fonte permitiu acessar a tabela Promoção dos Professores, com 54 registros e os campos identificados. O menu da origem também expõe Docentes, Estagiários, Técnicos, Aniversariantes e Tempo de Serviço. A tentativa de mudar o conteúdo por um clique de menu permaneceu na rota de promoções, portanto os demais módulos ainda não foram coletados. Nenhuma importação ou gravação foi executada.

A criação de campos e a migração incremental devem aguardar a coleta completa dos sete módulos autorizados e a prévia de duplicidades/conflitos.
