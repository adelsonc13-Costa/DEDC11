# Relatório de prévia — importação DEDC XI

**Status:** prévia sem gravação. Nenhuma linha foi inserida, atualizada ou excluída no projeto principal.

## Fonte analisada

Foi analisado o arquivo `ilovepdf_merged(9).pdf`, fornecido pelo responsável, com 42 páginas em formato A4. A extração textual preservou separadores de página e permitiu identificar os blocos abaixo. A quantidade indicada em “blocos/páginas” é a ocorrência do cabeçalho no PDF, não uma contagem final de pessoas, porque algumas linhas são quebradas entre páginas e o documento não contém um identificador estruturado por linha.

| Módulo identificado | Blocos/páginas com cabeçalho | Campos observados | Destino proposto |
|---|---:|---|---|
| Contatos | 8 | nome completo, setor, telefone, e-mail | servidor + contatos |
| Tempo de Serviço | 10 | nome, setor, cargo, data de nascimento, averbação, data de contratação, pontos | servidor + averbações |
| Datas de Nascimento | 11 | nome, setor, cargo, data de nascimento | servidor + aniversariantes |
| Promoção — Técnicos e Analistas | 2 | identificação funcional, setor, titulação/nível, carga horária, portaria e processo | servidor + atos |
| Estagiários | 5 | nome, matrícula/identificador, curso/setor, supervisor, datas e situação | estagiários |
| Promoção Docente | 3 | nome, matrícula, setor, carga horária, portaria e processo SEI | servidor + atos |
| Incentivo à Produção Científica | 3 | nome, matrícula, portaria, colegiado, datas de início/fim e situação | produção/atos |

## Mapeamento de dados

A identificação principal deverá usar matrícula normalizada. Nome, acentos, espaços, capitalização e telefones serão normalizados para comparação, mas o valor original será preservado. O vínculo entre módulos será feito pela matrícula; quando o documento não apresentar matrícula, o registro ficará pendente de revisão e não será associado automaticamente apenas pelo nome.

| Origem | Campo existente ou novo | Regra de importação |
|---|---|---|
| Nome completo | servidor.nomeOriginal / servidor.nomeNormalizado | preservar original e comparar normalizado |
| Matrícula | servidor.matricula | chave preferencial, sem duplicar por formatação |
| Setor, colegiado ou lotação | servidor.setorOriginal / servidor.lotacao | preservar texto original; mapear vocabulário depois |
| Cargo, vínculo, nível e regime | servidor.cargo, vinculo, nivel, regime | preencher quando houver correspondência segura |
| C.H. | servidor.cargaHoraria | converter D.E. em regime, sem perder o valor textual |
| Telefone e e-mail | contato | manter valor original e versão normalizada |
| Data de nascimento | servidor.dataNascimento / aniversariante | aniversariante referencia o servidor, sem cadastro duplicado |
| Portaria e Processo SEI | atoFuncional | registrar tipo, número, data e origem |
| Averbação e pontos | tempoAverbacao | manter período, pontos, documento e situação |
| Produção/Incentivo | producaoCientifica | relacionar por matrícula; pendências vão para conflito |
| Metadados | registroOrigem | módulo, identificador original, data de importação e versão |

## Lacunas e conflitos preliminares

O projeto principal, após a habilitação full-stack, possui apenas a tabela-base de usuários de autenticação; os cadastros funcionais ainda não estão materializados no banco. Portanto, os campos de domínio listados acima serão novos, não substituições de registros existentes. A interface demonstrativa contém registros estáticos e não deve ser tratada como fonte de verdade nem ser sobrescrita automaticamente.

O PDF não fornece uma chave de origem explícita para todas as linhas, não apresenta uma exportação tabular única e pode quebrar registros em páginas. Por esse motivo, a contagem definitiva de inserções, atualizações, duplicidades, conflitos e erros não deve ser inventada a partir do texto visual. Ela precisa ser calculada a partir de CSV/XLSX/JSON do sistema-fonte ou de uma leitura autenticada estruturada dos módulos.

Também foram identificados dados pessoais e funcionais no documento. O processamento deve permanecer restrito ao projeto autorizado; nenhum dado deve ser exposto em código, logs públicos ou modo demonstração.

## Decisão necessária antes da gravação

Esta prévia confirma o modelo de dados e a necessidade de criação incremental de campos e entidades. Ela **não autoriza ainda a gravação**. Para executar a migração completa com números auditáveis, é necessário fornecer os módulos em formato estruturado ou autorizar a coleta estruturada de cada módulo autenticado. Após isso será produzido um segundo dry-run com totais exatos, duplicidades por matrícula, conflitos campo a campo, registros sem correspondência e plano de reversão.

Nenhum banco foi alterado nesta etapa.

## Referência

[1]: https://dedc11-uneb.web.app/ — sistema-fonte indicado pelo responsável.
