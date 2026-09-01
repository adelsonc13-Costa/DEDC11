# Contrato futuro de integração — Módulo D.E.

> Este documento descreve uma estrutura futura de integração. A publicação atual continua estática, sem banco institucional e com dados fictícios.

## Entidade `dedication_exclusive_records`

| Campo | Tipo sugerido | Obrigatório | Finalidade |
|---|---|---:|---|
| `id` | string/UUID | Sim | Identificador interno do registro. |
| `server_id` | string/UUID | Sim | Vínculo com o cadastro mestre do servidor. |
| `status` | enum | Sim | `validated`, `reclassified` ou `pending_review`. |
| `person_name` | string | Sim | Nome exibido após autorização. |
| `registration` | string | Sim | Matrícula funcional. |
| `act_number` | string | Não | Número da portaria ou ato consultado. |
| `act_type` | string | Sim | Natureza identificada do ato. |
| `source_system` | enum | Sim | `DOE_BA`, `SPO_UNEB` ou outra fonte autorizada. |
| `source_reference` | string | Não | Edição, página, data ou URL da evidência. |
| `start_date` | date | Não | Início da vigência. |
| `end_date` | date | Não | Fim da vigência, quando existente. |
| `reason` | text | Não | Justificativa da validação ou reclassificação. |
| `reviewed_by` | string/UUID | Não | Responsável pela revisão humana. |
| `reviewed_at` | datetime | Não | Data e hora da decisão. |
| `evidence_url` | string | Não | Link autorizado para reprodução documental. |

## Consultas previstas

A interface deve consumir uma consulta autenticada e paginada, por exemplo `GET /api/dedication-exclusive-records`, com parâmetros `status`, `source_system`, `act_type`, `year`, `search`, `page` e `page_size`. A resposta deve trazer `items`, `total`, `page`, `page_size` e `available_filters`.

A alteração de status deve exigir permissão administrativa, justificativa e registro de auditoria. Links de evidência devem ser validados pelo servidor e não devem permitir que o cliente informe URLs arbitrárias.

## Requisitos de segurança

A integração futura deverá manter autenticação institucional, autorização por função, proteção de dados pessoais, trilha de auditoria e separação entre dados de demonstração e dados oficiais. Nenhum dado real deve ser inserido no modo demonstração; a troca de fonte deve ocorrer por configuração de ambiente e não por edição direta do componente visual.
