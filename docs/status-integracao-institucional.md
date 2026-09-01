# Status da integração institucional

## Escopo e origem

A versão atual preserva o modo de demonstração sem login e usa o banco funcional como fonte principal quando as consultas tRPC respondem. As fontes estruturadas foram recebidas pelo responsável no contexto do projeto e copiadas para `docs/` sem credenciais, cookies ou tokens. Os arquivos processados nesta etapa são `contatos-completo.json`, `tempo-servico-completo.json`, `incentivos-producao-completo.json`, `estagiarios-completo.json` e `registros-estruturados-adicionais.json`.

A tabela web mencionada no histórico foi tratada como fonte de conferência de promoções, não como um endpoint de ingestão automática. O conteúdo de promoções foi incorporado somente depois da confirmação do responsável e convertido em atos funcionais; a captura não armazena credenciais nem depende de login na aplicação demo.

## Resultado persistido

| Entidade | Quantidade atual | Regra de fonte única |
|---|---:|---|
| Servidores | 84 | matrícula reconciliada; Fernando = 74493156 e Geovana = 74505880 |
| Contatos | 156 | nome normalizado para deduplicação; 84 vínculos seguros e 72 pendências |
| Tempo de serviço | 156 | nome normalizado; 154 inseridos e 2 atualizados |
| Estagiários | 38 | matrícula reconciliada; sete pendências documentais sem matrícula |
| Atos funcionais | 54 | origem e módulo preservados |
| Incentivos científicos | 47 | matrícula + portaria; 46 vínculos e 1 pendência |

## Modelagem de aniversariantes, averbações e origem

Aniversariantes são uma visão derivada de `serviceRecords.dataNascimento` e não duplicam pessoas no cadastro mestre. Averbações são persistidas como `serviceRecords.averbacaoDias`, preservando o valor nulo quando a fonte não informa o dado. A origem de cada lote fica registrada em `sourceModule`, enquanto a execução, totais, pendências e observações ficam em `importRuns`; conflitos autorizados permanecem em `importConflicts` e `docs/reconciliacoes-autorizadas.json`.

O arquivo `docs/dry-run-json.md` continua disponível como registro histórico do dry-run inicial do JSON textual. Ele não deve ser interpretado como o resultado da importação estruturada posterior; os relatórios `reconciliacao-*.json` e a consulta atual do banco são a referência da etapa persistida.

## Auditoria técnica

A normalização usada nas reconciliações remove acentos, pontuação, espaços redundantes e diferenças de caixa, preservando o texto original nos campos `nomeOriginal`. A associação automática só ocorre quando há uma correspondência única; os demais casos permanecem listados nos relatórios de reconciliação para revisão manual.

A camada de leitura pública é exposta por tRPC em `functional.summary` e `functional.list`. A mutação `functional.updateServer` atualiza o cadastro mestre e invalida as consultas do dashboard. A UI mostra estados de carregamento, erro e vazio, e só usa o conjunto visual de demonstração quando `VITE_DEMO_MODE` é exatamente `true`.
