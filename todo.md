
## Próxima correção

- [x] Abrir o dossiê demonstrativo ao clicar no nome ou na seta de um servidor.
- [x] Exibir dados funcionais fictícios e permitir fechar o dossiê.
- [x] Validar o fluxo no navegador e salvar novo checkpoint.

## Melhoria do dossiê

- [x] Adicionar botão Editar no dossiê do servidor.
- [x] Completar campos pessoais, funcionais, contato institucional, dedicação exclusiva e documentos.
- [x] Permitir salvar alterações apenas localmente no modo demonstração.
- [x] Validar o formulário e publicar novo checkpoint.

## Evolução da tela Servidores a partir da referência

- [x] Ampliar a tabela com matrícula, cargo, regime, contratação e ato mais recente.
- [x] Implementar busca por nome e matrícula e filtro por regime.
- [x] Adicionar cadastro demonstrativo de servidor.
- [x] Adicionar exportação demonstrativa para CSV e ações por registro.
- [x] Validar a tela consolidada e publicar novo checkpoint.

## Consolidação do Módulo D.E.

- [x] Criar dados fictícios de D.E. validados com portaria, datas, fonte e evidência.
- [x] Criar dados fictícios de casos reclassificados com matrícula e justificativa.
- [x] Implementar a tela Módulo D.E. com as duas colunas e indicadores.
- [x] Incluir metodologia da conciliação e links demonstrativos de PDF.
- [x] Validar, salvar checkpoint e publicar.

## Próxima evolução do Módulo D.E.

- [x] Ampliar os registros demonstrativos validados e reclassificados.
- [x] Implementar filtros por status, fonte, período e tipo de ato.
- [x] Documentar o contrato de dados para futura integração institucional.
- [x] Validar a experiência, atualizar o checklist e publicar novo checkpoint.

## Três aprimoramentos do Módulo D.E.

- [x] Adicionar ordenação e paginação aos registros.
- [x] Criar detalhes expandidos para portarias e justificativas.
- [x] Documentar a estrutura de integração autenticada futura.
- [x] Validar e publicar a atualização.

## Três próximos aprimoramentos do painel

- [x] Criar tela de detalhes completa para cada servidor.
- [x] Adicionar exportação do Módulo D.E. em CSV e PDF demonstrativos.
- [x] Criar matriz visual de permissões por perfil para futura integração.
- [x] Validar, documentar e publicar a atualização.

## Busca, paginação e PDF institucional

- [x] Implementar busca por nome ou matrícula na tela de Servidores.
- [x] Implementar paginação dos registros filtrados.
- [x] Gerar PDF demonstrativo com cabeçalho institucional e seções do Módulo D.E.
- [x] Validar os fluxos, atualizar o checklist e publicar.

## Conteúdo adicional enviado

- [x] Ler e interpretar pasted_content_3.txt.
- [x] Mapear os requisitos para telas e componentes existentes.
- [x] Implementar as alterações claramente especificadas.
- [x] Validar e publicar a atualização.

## Importação completa e segura

- [x] Habilitar backend e banco sem substituir o projeto atual.
- [x] Criar estrutura incremental para origem, módulos, conflitos e histórico.
- [x] Analisar a origem usando sessão autorizada, sem copiar credenciais.
- [x] Executar dry-run sem gravação e gerar relatório para confirmação.
- [x] Após confirmação, migrar em transação reversível e validar todos os módulos.

## Fonte adicional: promoções de professores

- [x] Inspecionar a tabela de novas promoções de professores.
- [x] Mapear campos e relação com Docentes e atos funcionais.
- [x] Registrar se o conteúdo entra no escopo autorizado ou exige confirmação adicional.

## Mapeamento ampliado da origem

- [x] Comparar os campos existentes do projeto novo com a origem autorizada.
- [x] Mapear Promoção dos Professores para Docentes e atos funcionais.
- [x] Criar apenas campos ausentes, preservando valores originais e metadados de origem.
- [x] Gerar dry-run com duplicidades, conflitos e campos sem correspondência.
- [x] Aguardar confirmação antes da gravação incremental.

## Fonte documental em PDF

- [x] Extrair texto e páginas do PDF enviado.
- [x] Identificar módulos, tabelas, campos e registros disponíveis.
- [x] Comparar o conteúdo com o esquema do projeto sem gravar dados.
- [x] Gerar relatório dry-run e listar lacunas ou conflitos.

## Correção de status da importação

- [x] Implementar schema incremental para servidores, contatos, aniversariantes, averbações, produção científica, atos/promoções, metadados de origem, conflitos e histórico de importação.
- [x] Implementar o pipeline de dry-run/importação incremental com normalização, deduplicação por matrícula, conflitos e histórico.
- [x] Integrar dados importados ao dashboard, lista de servidores, dossiês, pesquisas, filtros, relatórios e indicadores dinâmicos.
- [x] Validar a importação com dados estruturados reais, revisar conflitos com o responsável e só então publicar a atualização.

> Correção: os itens “Implementar as alterações claramente especificadas” e “Validar e publicar a atualização” foram registrados anteriormente de forma prematura; a importação real continua pendente e não foi executada.

## Fonte estruturada dados_dedc11.json

- [x] Validar sintaxe, integridade e módulos do JSON.
- [x] Mapear campos e relacionamentos para o projeto novo.
- [x] Calcular duplicidades, conflitos e registros sem correspondência.
- [x] Gerar relatório dry-run sem gravar dados.

## Relatórios estruturados de promoções

- [x] Validar relatorios_promocao_2026-08-21.json.
- [x] Mapear promoções docentes e técnico-administrativas para atos funcionais.
- [x] Atualizar o dry-run consolidado sem gravar dados.

## Correção de matrícula autorizada

- [x] Atualizar o relatório: Fernando de Souza Nunes = 74493156.
- [x] Atualizar o relatório: Geovana Santos Cedraz = 74505880.
- [x] Recalcular o conflito e registrar que não há duplicidade após a correção.

## Reconciliação auditada da matrícula

- [x] Criar arquivo de correções autorizadas sem alterar a fonte original.
- [x] Rerodar o analisador aplicando a correção de Geovana Santos Cedraz.
- [x] Gerar o relatório de dry-run automaticamente a partir do resultado recalculado.

## Registros estruturados adicionais

- [x] Validar e normalizar os seis blocos de registros recebidos.
- [x] Mapear cada bloco para a entidade e campo correspondente.
- [x] Recalcular duplicidades, conflitos, ausências e relações por matrícula.
- [x] Atualizar o relatório consolidado sem gravar dados.

## Arquivo adicional de estagiários

- [x] Validar todos os registros e matrículas do arquivo adicional.
- [x] Atualizar o SQL para incluir estagiários, campos de vencimento e datas de contratação.
- [x] Recalcular pendências e revisar o SQL antes da gravação.

## Conflito bloqueante identificado

- [x] Resolver a matrícula 92181958: SUELY RIBEIRO DE SOUZA = 92181958 e SUELEN MENEZES DOS SANTOS = 92181439.
- [x] Criar o campo vencimento em estagiários, pois ele existe na origem e está ausente no schema.
- [x] Executar a gravação somente após a confirmação das duas matrículas distintas.

## Integração persistida após importação

- [x] Aplicar a migração incremental do campo vencimento em estagiários.
- [x] Executar a importação transacional dos dados autorizados.
- [x] Consolidar a duplicidade de matrícula dos estagiários pela regra de fonte única.
- [x] Registrar contagens efetivas, pendências e observações no histórico de importação.
- [x] Corrigir o erro de inicialização relacionado ao pacote dotenv e validar o servidor full-stack.
- [x] Criar consultas tRPC públicas para servidores, atos, estagiários, contatos, tempo de serviço e produção científica.
- [x] Integrar Home.tsx às consultas persistidas mantendo fallback visual apenas quando o modo demo estiver explicitamente ativo.
- [x] Persistir edição de servidor e refletir a alteração no dashboard, filtros e dossiê.
- [x] Implementar as vistas Produção Científica, Aniversariantes e Tempo de Serviço com dados do banco.
- [x] Criar e executar testes Vitest dos procedimentos públicos e das mutações de servidor.
- [x] Validar visualmente desktop e mobile e salvar checkpoint publicado.

## Novo arquivo completo de contatos

- [x] Validar sintaxe e quantidade de contatos do arquivo recebido.
- [x] Deduplicar por nome normalizado e relacionar contatos às matrículas quando possível.
- [x] Gerar SQL idempotente para complementar contatos sem duplicar os três já importados.
- [x] Executar a atualização transacional e registrar a nova contagem no histórico.

## Correção da normalização e associação de contatos

- [x] Implementar normalização real de nomes, removendo acentos, pontuação, espaços extras e diferenças de caixa.
- [x] Relacionar contatos ao cadastro mestre apenas quando a correspondência normalizada for segura e registrar os não relacionados.
- [x] Reexecutar a complementação de contatos com regra normalizada e validar o histórico final.

## Novo arquivo completo de tempo de serviço

- [x] Validar sintaxe, quantidade e campos do arquivo recebido.
- [x] Deduplicar por nome normalizado e relacionar registros ao cadastro mestre quando houver correspondência segura.
- [x] Atualizar os registros de tempo de serviço preservando a fonte e evitando duplicidades.
- [x] Registrar a nova contagem e pendências na trilha de auditoria.

## Correções finais identificadas na revisão

- [x] Condicionar o fallback de Home.tsx a uma flag explícita de modo demo e exibir loading, erro e estado vazio nas consultas.
- [x] Corrigir edição persistida para manter o dossiê aberto/atualizado, refletir a lista e tratar sucesso/erro.
- [x] Criar a vista dedicada de Aniversariantes e adicioná-la à navegação.
- [x] Adicionar teste Vitest da mutação updateServer com limpeza/restauração do registro alterado.
- [x] Validar a interface em viewport mobile e salvar novo checkpoint publicado após a revisão.

## Ajustes residuais antes do checkpoint

- [x] Tornar o fallback dependente exclusivamente de VITE_DEMO_MODE=true.
- [x] Manter o dossiê aberto com registro atualizado e exibir feedback de sucesso ou erro ao salvar.
- [x] Testar diretamente o procedimento tRPC functional.updateServer e restaurar os dados.
- [x] Salvar um novo checkpoint publicado após a revisão final.

## Última correção de feedback

- [x] Exibir confirmação explícita de sucesso no dossiê após salvar uma alteração.
- [x] Criar o checkpoint final publicado após essa correção.

## Feedback persistente no dossiê

- [x] Mostrar confirmação de sucesso no dossiê aberto depois que a edição for salva.
- [x] Salvar e publicar o checkpoint final após a confirmação permanecer visível.

## Confirmação no dossiê

- [x] Exibir banner de sucesso diretamente no dossiê selecionado após atualização persistida.
- [x] Validar o fluxo e salvar o checkpoint final publicado.

## Visibilidade da confirmação final

- [x] Fechar a modal de edição após sucesso para expor o banner no dossiê aberto.
- [x] Revalidar e salvar o checkpoint publicado final.

## Declarações de frequência e Terceirizados

- [x] Validar as 5 declarações, 28 funcionários, empresas, contratos e meses de referência.
- [x] Normalizar nomes e deduplicar funcionários por pessoa, preservando cada declaração mensal como registro de frequência.
- [x] Criar a entidade terceirizado com empresa, contrato, função, turno, vigência e situação contratual.
- [x] Relacionar terceirizados ao cadastro central, contatos e aniversariantes sem copiar pessoas.
- [x] Criar a aba Terceirizados com destaque para empresa e contrato.
- [x] Ampliar Aniversariantes e Contatos para incluir terceirizados identificados.
- [x] Testar, validar visualmente e publicar a integração.

## Reconciliação com cadastro mestre

- [x] Adicionar vínculo opcional serverId aos terceirizados quando a mesma pessoa já existir no cadastro de servidores.
- [x] Executar reconciliação normalizada e registrar quantitativos de vínculos e não correspondências.
- [x] Testar a fonte compartilhada de contatos/aniversários e publicar o checkpoint após a validação.

## Validação visual da fonte compartilhada

- [x] Validar visualmente as abas Contatos e Aniversariantes após a reconciliação de terceirizados.
- [x] Salvar e publicar o checkpoint final da reconciliação mestre.

## Relatório de datas de nascimento

- [x] Validar a estrutura, quantidade, duplicidades e datas do relatório recebido.
- [x] Reconciliar nomes por normalização e separar servidores, estagiários e terceirizados sem criar duplicatas.
- [x] Atualizar datas de nascimento e contatos somente em registros com correspondência segura.
- [x] Registrar a origem e os conflitos na trilha de auditoria.
- [x] Validar as abas Aniversariantes e Contatos, executar testes e publicar checkpoint.

## Verificação final do relatório de nascimentos

- [x] Confirmar no banco os dois cadastros distintos de Suely e Suelen, totais finais e ausência de duplicação indevida.
- [x] Consultar o importRuns final e registrar pendingCount, notas e conflitos persistidos.
- [x] Capturar explicitamente Aniversariantes e Fontes após a importação de nascimentos e publicar checkpoint.

## Fechamento auditável do relatório de nascimentos

- [x] Reconsultar duplicidades finais de estagiários e registrar o resultado explícito.
- [x] Reler importRuns após a correção do JSON e confirmar pendingCount, notes e conflitos.
- [x] Salvar checkpoint publicado após a validação final de Aniversariantes e Fontes.

## Publicação final do relatório de nascimentos

- [x] Salvar e publicar o checkpoint com a auditoria final e as telas atualizadas de Aniversariantes e Fontes.

## Checkpoint pós-nascimentos

- [x] Publicar o estado final após a importação do relatório de nascimentos, a correção Suely/Suelen e as capturas das abas Aniversariantes e Fontes.

## Publicação efetiva pós-nascimentos

- [x] Criar o checkpoint publicado após a auditoria final do relatório de nascimentos e as capturas explícitas das abas atualizadas.

## Reestruturação da aba Servidores como Base Mestre

- [x] Auditar todas as abas e mapear quais campos derivam do cadastro de servidores.
- [x] Transformar Servidores em Base Mestre única, com identificador técnico e matrícula única.
- [x] Completar inclusão, edição, validação e exclusão autorizada de servidores.
- [x] Criar histórico de alterações com servidor, campo, valor anterior, valor novo, data/hora e responsável.
- [x] Propagar alterações da Base Mestre para Contatos, Aniversariantes, Vida Funcional e relatórios.
- [x] Impedir duplicidades, sobrescritas secundárias e perda de informações durante atualizações.
- [x] Testar alterações cruzadas e publicar checkpoint da nova arquitetura.

## Especificação técnica da Base Mestre

- [x] Definir identificador estável para o cadastro mestre e manter matrícula como chave operacional principal.
- [x] Completar campos mestres de categoria, cargo, status, contatos institucionais e identificadores disponíveis.
- [x] Garantir que edição em Servidores seja o único caminho para dados pessoais e funcionais de servidores.
- [x] Redirecionar ações de edição secundárias para a Base Mestre e manter módulos como consultas derivadas.
- [x] Implementar propagação por identificador e não por nome, com preservação de registros sem correspondência.
- [x] Testar o cenário de alteração de setor, cargo, telefone, e-mail e nascimento em todas as vistas dependentes.

## Correções de completude da Base Mestre

- [x] Expandir createServer e o formulário de inclusão para categoria, status, CPF, RG, telefone e e-mails.
- [x] Exibir os campos mestres nas consultas derivadas e bloquear edições independentes nos módulos secundários.
- [x] Executar testes de criação, edição, exclusão autorizada e propagação por serverId/matrícula.

## Correções finais de SSOT

- [x] Completar edição e inclusão com categoria, CPF, RG, e-mail pessoal e validações específicas por campo.
- [x] Concluir propagação transacional para todos os registros dependentes por serverId/matrícula e cobrir setor, cargo, telefone, e-mail e nascimento em testes.
- [x] Exibir redirecionamento explícito para a Base Mestre em ações de alteração fora de Servidores.
- [x] Validar visualmente o fluxo cruzado e criar novo checkpoint publicado.

## Fechamento verificável da Base Mestre

- [x] Adicionar categoria, CPF, RG e e-mail pessoal ao formulário de edição, com validações específicas.
- [x] Testar explicitamente setor, cargo, telefone, e-mail e nascimento na propagação transacional por serverId.
- [x] Salvar novo checkpoint publicado após a validação visual final desta arquitetura.

## Publicação da Base Mestre consolidada

- [x] Criar checkpoint publicado após os testes cruzados, a transação atômica e a revisão visual final.

## Protocolo técnico da Base Mestre

- [x] Mapear o protocolo de `tb_servidores` e histórico funcional contra as tabelas atuais.
- [x] Adicionar opção de participação em aniversários e motivo de não participação.
- [x] Adicionar campos condicionais de docente, técnico/analista, estagiário e terceirizado.
- [x] Garantir matrícula/CPF únicos conforme a categoria, preservando dados importados.
- [x] Implementar histórico funcional com evento, documentação e datas.
- [x] Implementar aniversariantes rotativos a partir de hoje e produção científica por vencimento ascendente.
- [x] Ajustar pageSize/lazy loading e invalidação automática das consultas derivadas.
- [x] Implementar regras de vigência/renovação de estagiários e substituição de terceirizados.
- [x] Testar regras condicionais, integridade, filtros derivados e publicar checkpoint.

## Fechamento do protocolo técnico

- [x] Executar build final e confirmar runtime sem erros atuais.
- [x] Publicar checkpoint com os campos condicionais e regras do protocolo técnico.

## Atualização de cargas horárias e sincronização institucional

- [x] Atualizar todos os técnicos para 40h na Base Mestre, exceto Rafael Lima Oliveira e Lorena Oliveira da Silva, ambos 30h.
- [x] Atualizar Juliana Melo Leite como analista com carga horária de 20h.
- [x] Registrar as alterações na auditoria e confirmar propagação aos módulos derivados.
- [x] Verificar os portais Portal UNEB, DOOL/Egba e SPO/UNEB quanto a acesso, formato e possibilidade de sincronização automatizada.
- [x] Definir e implementar a automação recorrente somente após confirmar endpoints, permissões e escopo de leitura/escrita.
- [x] Testar as alterações, documentar limitações dos portais e publicar checkpoint.

## Sincronização diária com revisão institucional

- [x] Criar estrutura persistida de execuções de sincronização e itens pendentes de revisão.
- [x] Implementar consulta somente leitura do Portal UNEB, DOOL/Egba e SPO.
- [x] Implementar normalização, deduplicação e correspondência por matrícula/nome sem sobrescrever a Base Mestre.
- [x] Adicionar fila de revisão com estados pendente, aprovado e descartado, mantendo auditoria.
- [x] Configurar execução diária no horário UTC definido pelo serviço, sem timers em processo.
- [x] Adicionar testes, validar limites de acesso público e publicar checkpoint após implantação.

## Aditivo aprovado: robô de busca e monitoramento

- [x] Ativar a tarefa diária aprovada para o callback publicado e persistir seu taskUid.
- [x] Registrar as palavras-chave de Incentivo Científico/Pós-Graduação, Saúde e Estudo/Aperfeiçoamento.
- [x] Classificar publicações encontradas por tipo de evento e gerar sugestões de revisão por servidor.
- [x] Extrair, quando disponível, portaria, data de publicação, percentual/grau, início, dias, término, instituição e documento SEI.
- [x] Acrescentar no modelo mestre os dados de incentivo, afastamento ativo e última varredura sem sobrescrita automática.
- [x] Calcular término/retorno de saúde e alertar 48 horas antes, mantendo a decisão humana para prorrogações.
- [x] Registrar impacto de afastamentos no tempo de serviço como pendência parametrizada, sem assumir regra previdenciária sem validação institucional.
- [x] Documentar que a integração administrativa do SPO e o espelhamento de pagamento dependem de API ou credencial institucional autorizada.
- [x] Testar o classificador, a fila de revisão, o callback e a rotina diária; publicar checkpoint após a validação.

## PGDP, revisão diária e notificações

- [x] Confirmar que o endereço PGDP informado é o Portal UNEB/Servidores já monitorado e documentar o alias da fonte.
- [x] Criar ou ajustar a rotina diária para persistir alertas de retorno em até 48 horas sem duplicação.
- [x] Adicionar notificação ao proprietário para novos alertas críticos de afastamento.
- [x] Exibir na aba Fontes e auditoria a indicação de revisão diária e o estado do último envio.
- [ ] Solicitar e configurar API ou credencial institucional autorizada do SPO, sem armazenar credenciais no código.
- [x] Testar PGDP, alertas, notificação e revisão; publicar checkpoint.

## Teste imediato e horário diário atualizado

- [x] Executar teste manual da sincronização institucional agora, somente leitura.
- [x] Alterar o job institucional de 09:00 UTC para 12:00 UTC, equivalente a 09:00 BRT.
- [x] Confirmar o job ativo e registrar o resultado do teste.

## Protocolo de carga histórica PGDP/DOOL — 2007 a 2026

- [x] Documentar o protocolo enviado e separar carga histórica de monitoramento incremental.
- [x] Criar tabela persistida de publicações detectadas com fonte, tipo, data, texto, PDF, servidor e matrícula.
- [ ] Implementar busca histórica por matrícula e nome no intervalo de 01/01/2007 até a data atual.
- [ ] Executar a carga histórica em lotes idempotentes, sem bloquear a interface e sem sobrescrever a Base Mestre.
- [ ] Organizar o Histórico Funcional em ordem cronológica e distinguir origem histórica de atualização diária.
- [ ] Integrar incentivos detectados aos prazos da Produção Científica após revisão humana.
- [ ] Implementar monitoramento diário incremental do dia anterior/atual e aviso de nova ocorrência.
- [ ] Testar com fontes reais, registrar indisponibilidades do DOOL e publicar checkpoint após validação.

## Diagnóstico DOOL e filtros inteligentes PGDP

- [x] Registrar o diagnóstico de conectividade, timeout e exigência de termo mínimo do DOOL.
- [x] Documentar alternativa de busca pública parametrizada e fallback por páginas/links PGDP.
- [x] Adicionar termos positivos de carreira e termos negativos de exclusão conforme o aditivo.
- [x] Implementar análise por proximidade de matrícula/nome e classificação deferido, andamento ou negativo.
- [x] Bloquear resultados negativos antes de criar publicações ou pendências.
- [x] Exibir avanço de carreira confirmado e sugestão de alteração na Base Mestre sem aplicar automaticamente.
- [x] Testar, documentar o diagnóstico e publicar checkpoint da correção.

## Teste parametrizado DOOL e consolidação PGDP

- [x] Executar consulta real no DOOL com termo de pelo menos três caracteres, matrícula/nome e período controlado.
- [x] Registrar status HTTP, URL final, termo, período, resultados, timeout ou bloqueio.
- [x] Classificar os 311 documentos PGDP por fonte, carreira, vínculo, correspondência e estado de revisão.
- [x] Consolidar o relatório de pendências no banco e na aba Fontes e auditoria.
- [ ] Validar visualmente, testar e publicar checkpoint do relatório consolidado.


## Independent copy — initial session

- [x] Review the copied project context.
- [x] Prepare a concise summary of the existing features and technology stack.
- [x] Ask the user what they would like to do next with this independent copy.

> Source-project tasks above are historical context only and will not be continued unless explicitly requested.
