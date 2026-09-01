# Diagnóstico do DOOL e achados PGDP — 22/08/2026

## DOOL/Egba

A URL pública `https://dool.egba.ba.gov.br/buscanova/` respondeu, por extração pública, com a interface carregada e a mensagem: “O campo para busca deve ser preenchido com pelo menos 3 caracteres”. Também exibiu “página 1 de 0” e nenhum resultado porque a consulta foi aberta sem termo. Portanto, a falha do robô não é necessariamente uma falha do site: a rotina atual faz uma requisição GET sem preencher o formulário nem enviar termo/período, enquanto o DOOL exige parâmetros de busca. No teste automatizado, a requisição da aplicação terminou em timeout/status 0; a interface pública, por outro lado, respondeu quando acessada diretamente.

## Portal UNEB/PGDP

`https://portal.uneb.br/servidores/` respondeu HTTP 200 e funciona como índice. Ele encaminha para as páginas PGDP de Promoção Docente, Promoção Técnico e Analista, Progressão Docente e Progressão Técnico e Analista.

As páginas públicas confirmadas foram:

| Área | URL | Conteúdo identificado |
|---|---|---|
| Promoção Docente | https://pgdp.uneb.br/promocao-docente-2/ | Listas de promoção, orientações e portarias publicadas, incluindo Portaria 51691421 de 13/08/2026 e 51690497 de 06/08/2026. |
| Promoção Técnico e Analista | https://pgdp.uneb.br/promocao-tecnico/ | Orientações, documentos de promoção, PFAC, listas provisórias/definitivas e atos de 2026/2025. |
| Progressão Docente | https://pgdp.uneb.br/progressao-docente/ | Lista de Progressão de julho e portarias publicadas em 2026, incluindo 51687066 de 06/08/2026. |
| Progressão Técnico e Analista | https://pgdp.uneb.br/progressao-tecnico/ | Listas de requisitos, grau/referência, manuais, instruções normativas e portarias de 2026. |

## Conclusão operacional

O PGDP já tem material público suficiente para ser monitorado por links HTML e PDFs, com revisão por matrícula/nome. O robô atual, entretanto, estava monitorando apenas o índice Portal UNEB/Servidores; ele ainda precisa seguir os quatro links PGDP e seus documentos vinculados para encontrar promoções e progressões específicas.

O DOOL precisa de um adaptador próprio que envie termo de pelo menos três caracteres e, idealmente, período de pesquisa. Não é seguro considerar status 0 como “nenhuma publicação”; deve ser exibido como fonte indisponível/sem resposta e permanecer na fila de revisão.

## Referências

[1]: https://dool.egba.ba.gov.br/buscanova/ "Busca pública do DOOL/Egba"
[2]: https://portal.uneb.br/servidores/ "Portal UNEB — Servidores"
[3]: https://pgdp.uneb.br/promocao-docente-2/ "PGDP — Promoção Docente"
[4]: https://pgdp.uneb.br/promocao-tecnico/ "PGDP — Promoção Técnico e Analista"
[5]: https://pgdp.uneb.br/progressao-docente/ "PGDP — Progressão Docente"
[6]: https://pgdp.uneb.br/progressao-tecnico/ "PGDP — Progressão Técnico e Analista"


## Verificação complementar do DOOL

A página oficial do DOOL informa que a busca por palavra está disponível para acervo a partir de 30 de junho de 2007, com navegação por edições e consulta por palavra-chave. A página de busca pública retornou a validação “O campo para busca deve ser preenchido com pelo menos 3 caracteres”, confirmando que uma requisição sem termo não é uma consulta válida. A alternativa operacional segura é usar a busca parametrizada do DOOL por matrícula/nome com termo de no mínimo três caracteres, limitar o intervalo por ano/data quando suportado e preservar o PDF/link original. Caso a interface automatizada continue instável, a EGBA publica o canal de pesquisa do acervo: pesquisadiario@egba.ba.gov.br e telefones (71) 3343-2817/2885.

Fontes oficiais consultadas: https://dool.egba.ba.gov.br/ e https://dool.egba.ba.gov.br/buscanova/.


## Teste parametrizado executado

Em 22/08/2026 foram testadas quatro variantes públicas de consulta no endpoint `https://dool.egba.ba.gov.br/buscanova/`, usando a matrícula `92118841`, períodos 2024–2026 e termos nos formatos `q`, `busca`, `termo` e `search`. Todas falharam no ambiente de execução com `SSLEOFError: UNEXPECTED_EOF_WHILE_READING`, sem retorno HTTP. Portanto, a falha atual é de conexão TLS/edge antes da validação do formulário, e não uma resposta de “nenhum resultado”.

O relatório PGDP permanece consolidado com 311 documentos persistidos: 62 de Promoção Docente, 102 de Promoção Técnico e Analista, 60 de Progressão Docente e 87 de Progressão Técnico e Analista. Todos estão pendentes de revisão; 8 pendências anteriores estão resolvidas e 6 descartadas. A aba Fontes e auditoria passou a carregar até 500 registros, permitindo visualizar os 311 documentos.
