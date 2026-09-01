# Dry-run de importação — dados_dedc11.json

**Status:** concluído sem gravação. O arquivo foi validado, mas nenhum dado foi inserido, atualizado ou excluído.

## Validação da fonte

O JSON é sintaticamente válido e contém as chaves `arquivo_origem`, `paginas`, `descricao` e `secoes`. Ele declara 42 páginas e três seções: `contatos`, `tempo_servico` e `datas_nascimento`.

| Módulo presente | Páginas declaradas | Campos observados | Linhas candidatas após remoção preliminar de cabeçalhos |
|---|---:|---|---:|
| Contatos | 8 | nome completo, setor, telefone, e-mail | 156 |
| Tempo de Serviço | 10 | nome completo, setor, cargo, data de averbação, data de contratação, pontos | 214 |
| Datas de Nascimento | 24 | nome completo, data de nascimento, cargo, setor, telefone, e-mail | 524 |

As linhas candidatas são uma medida preliminar do texto extraído, não uma contagem definitiva de pessoas. O arquivo armazena linhas textuais por página, e não objetos de registros com identificadores, portanto ainda podem existir quebras de linha, cabeçalhos repetidos, linhas incompletas e duplicidades.

## Mapeamento proposto

| Campo de origem | Destino no projeto | Regra |
|---|---|---|
| Nome completo | servidor.nomeOriginal e servidor.nomeNormalizado | normalizar apenas para comparação; preservar original |
| Setor | servidor.setor | preservar o texto da origem |
| Cargo | servidor.cargo | preencher somente quando a associação for segura |
| Telefone | contato.telefoneOriginal e contato.telefoneNormalizado | manter valor original e versão comparável |
| E-mail | contato.emailOriginal e contato.emailNormalizado | preservar capitalização original; comparar em minúsculas |
| Data de nascimento | servidor.dataNascimento e aniversariante | aniversariante referencia servidor, sem duplicar pessoa |
| Data de averbação | averbacao.dataRegistro | requer parser de data e revisão de formato |
| Data de contratação | servidor.dataContratacao | requer parser de data |
| Pontos | averbacao.pontos | preservar o valor textual e converter quando inequívoco |
| Origem e versão | registroOrigem | incluir módulo, página, identificador e versão |

## Lacunas do arquivo

Para a importação completa solicitada, o JSON não contém seções estruturadas de Produção Científica, Docentes, Técnicos, Estagiários, Promoção Docente, Promoção de Técnicos e Analistas ou Promoção dos Professores. Também não contém identificador de origem por linha, matrícula na maioria das linhas de contatos e aniversariantes, nem objetos estruturados para resolver relacionamentos com segurança.

O projeto novo, após a habilitação full-stack, ainda precisa materializar as entidades de domínio: servidores, contatos, aniversariantes, averbações, produção científica, atos/promoções, registros de origem, conflitos e histórico de importações. A tabela de autenticação `users` não deve ser usada como cadastro funcional e não será substituída.

## Resultado do dry-run

| Métrica | Resultado |
|---|---:|
| Arquivo válido | Sim |
| Seções presentes | 3 de 8 módulos previstos no pedido |
| Registros confirmados por identificador estruturado | 0 |
| Inserções simuladas | Não calculadas — falta identificador estruturado |
| Atualizações simuladas | Não calculadas — falta banco de domínio |
| Conflitos simulados | Não calculados por linha — falta chave segura |
| Gravações realizadas | 0 |

O próximo passo seguro é obter um JSON estruturado com cada registro como objeto, incluindo matrícula ou identificador de origem, e as seções restantes. Com isso será possível criar o schema incremental, calcular duplicidades e conflitos por matrícula e apresentar uma prévia numérica exata antes da confirmação de gravação.

Nenhum dado institucional foi alterado nesta etapa.
