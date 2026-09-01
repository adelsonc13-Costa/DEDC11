# Dry-run — registros estruturados adicionais

**Status:** prévia concluída sem gravação. Os dados foram validados e relacionados apenas em memória.

## Resumo

O conteúdo recebido é um JSON válido com seis blocos e **10 registros**. Não foram encontradas datas inválidas, matrículas malformadas ou nomes repetidos entre os blocos recebidos.

| Módulo | Registros | Matrículas presentes | Relacionamento preliminar |
|---|---:|---:|---|
| Contatos | 3 | 0 | pendente de matrícula; requer associação por nome e confirmação |
| Tempo de Serviço | 2 | 0 | pendente de matrícula; requer associação segura |
| Promoção de Técnicos e Analistas | 2 | 2 | associação por matrícula |
| Estagiários | 1 | 1 | associação por matrícula/identificador |
| Promoção Docente | 1 | 1 | associação por matrícula |
| Incentivo à Produção Científica | 1 | 1 | associação por matrícula |

## Sobreposição com os relatórios de promoção

As matrículas `74334171`, `92157351`, `92118841` e `92107257` já aparecem no arquivo de relatórios de promoção analisado anteriormente. Isso é uma sobreposição esperada entre módulos relacionados, não uma duplicação de pessoa: os registros devem compartilhar a entidade principal de servidor e manter seus próprios registros de ato ou produção.

A matrícula `92133135`, referente à estagiária **ANDRESSA SANTOS PINHEIRO**, não aparece nos relatórios de promoção e deverá ser criada como vínculo de estagiário, caso seja confirmada na base principal.

Os três contatos e os dois registros de tempo de serviço não possuem matrícula no conteúdo recebido. Eles não serão associados automaticamente apenas pelo nome; ficarão em estado pendente até existir uma matrícula correspondente em Docentes, Técnicos ou Estagiários, ou até confirmação explícita do responsável.

## Mapeamento proposto

| Campo recebido | Destino proposto | Observação |
|---|---|---|
| `nome` | servidor.nomeOriginal / nomeNormalizado | normalização sem perder o original |
| `setor` / `setor_atuacao` | servidor.setor / estagiario.setor | preservar texto original |
| `telefone` e `email` | contato | `email: null` permanece nulo |
| `cargo` | servidor.cargo | relação segura por matrícula quando disponível |
| `data_nascimento` | servidor.dataNascimento | formato `DD/MM/YYYY` validado |
| `averbacao_dias` | averbacao.dias | manter zero como valor informado |
| `data_contratacao_uneb` | servidor.dataContratacao | formato validado |
| `cursando`, `turno`, `responsavel`, `bolsa`, `renovacao` | estagiario | campos específicos do estágio |
| `portaria`, `processo_sei`, `numero_portaria` | atoFuncional | não sobrescrever atos existentes |
| `colegiado`, `data_inicio`, `data_termino`, `dias_faltantes` | producaoCientifica/ato | relacionar ao servidor por matrícula |

## Resultado do dry-run

| Métrica | Resultado |
|---|---:|
| Registros recebidos | 10 |
| Matrículas presentes | 5 |
| Matrículas válidas | 5 |
| Datas inválidas | 0 |
| Nomes repetidos entre os seis blocos | 0 |
| Sobreposições com promoções anteriores | 4 |
| Registros sem matrícula | 5 |
| Inserções executadas | 0 |
| Atualizações executadas | 0 |
| Gravações realizadas | 0 |

A criação do schema e a gravação incremental ainda devem aguardar a consolidação da base principal e a confirmação dos cinco registros sem matrícula. A fonte de verdade não será duplicada; os módulos relacionados apontarão para o mesmo servidor e receberão metadados de origem, versão e histórico de importação.

Nenhum dado institucional foi alterado nesta etapa.
