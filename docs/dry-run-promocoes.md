# Dry-run — relatórios de promoção

**Status:** prévia recalculada automaticamente sem gravação. O JSON original permanece inalterado.

## Resultado recalculado

| Módulo | Registros | Matrículas inválidas | Matrículas duplicadas após reconciliação | Campos ausentes |
|---|---:|---:|---:|---|
| promocao_docente | 54 | 0 | 0 | `processo_sei`: 33 |
| promocao_tecnicos_analistas | 30 | 0 | 0 | nenhum |

## Reconciliações aplicadas em memória

| Módulo | Pessoa | Matrícula original | Matrícula reconciliada | Motivo |
|---|---|---:|---:|---|
| promocao_tecnicos_analistas | FERNANDO DE SOUZA NUNES | 74493156 | 74493156 | matrícula confirmada pelo responsável |
| promocao_tecnicos_analistas | GEOVANA SANTOS CEDRAZ | 74493156 | 74505880 | matrícula corrigida e confirmada pelo responsável |

## Métricas

Foram analisados **84 registros**. Após aplicar as duas reconciliações autorizadas somente em memória, não restaram matrículas duplicadas ou inválidas nos dois módulos. O arquivo de origem não foi modificado.

O campo `processo_sei` permanece opcional em 33 registros de Promoção Docente; o valor de `portaria_ou_processo` será preservado. A gravação real continua bloqueada até a confirmação do responsável e a consolidação dos demais módulos estruturados.

Nenhum dado institucional foi alterado nesta etapa.
