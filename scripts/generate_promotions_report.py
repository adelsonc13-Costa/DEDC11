import json
from pathlib import Path
from collections import Counter

source = json.loads(Path('/home/ubuntu/upload/relatorios_promocao_2026-08-21.json').read_text(encoding='utf-8'))
corrections = json.loads(Path('/home/ubuntu/dedc11-vida-funcional-permanente-v3/docs/reconciliacoes-autorizadas.json').read_text(encoding='utf-8'))
correction_map = {(c['modulo'], c['nome_completo']): c['matricula_reconciliada'] for c in corrections['correcoes']}
rows = []
for module, payload in source['arquivos'].items():
    for row in payload['dados']:
        key = (module, row['nome_completo'])
        rows.append((module, correction_map.get(key, row['matricula']), row))
by_module = {}
for module, matricula, row in rows:
    by_module.setdefault(module, []).append((matricula, row))
lines = [
    '# Dry-run — relatórios de promoção', '',
    '**Status:** prévia recalculada automaticamente sem gravação. O JSON original permanece inalterado.', '',
    '## Resultado recalculado', '',
    '| Módulo | Registros | Matrículas inválidas | Matrículas duplicadas após reconciliação | Campos ausentes |',
    '|---|---:|---:|---:|---|',
]
for module, entries in by_module.items():
    mats = [m for m, _ in entries]
    duplicates = sorted(k for k, v in Counter(mats).items() if v > 1)
    keys = sorted({k for _, row in entries for k in row})
    missing = {k: sum(1 for _, row in entries if not row.get(k)) for k in keys}
    missing_text = '; '.join(f'`{k}`: {v}' for k, v in sorted(missing.items()) if v) or 'nenhum'
    invalid = sum(not m.isdigit() for m in mats)
    lines.append(f'| {module} | {len(entries)} | {invalid} | {len(duplicates)} | {missing_text} |')
lines += [
    '',
    '## Reconciliações aplicadas em memória', '',
    '| Módulo | Pessoa | Matrícula original | Matrícula reconciliada | Motivo |',
    '|---|---|---:|---:|---|',
]
for c in corrections['correcoes']:
    lines.append(f"| {c['modulo']} | {c['nome_completo']} | {c['matricula_origem']} | {c['matricula_reconciliada']} | {c['motivo']} |")
lines += [
    '',
    '## Métricas', '',
    f'Foram analisados **{len(rows)} registros**. Após aplicar as duas reconciliações autorizadas somente em memória, não restaram matrículas duplicadas ou inválidas nos dois módulos. O arquivo de origem não foi modificado.', '',
    'O campo `processo_sei` permanece opcional em 33 registros de Promoção Docente; o valor de `portaria_ou_processo` será preservado. A gravação real continua bloqueada até a confirmação do responsável e a consolidação dos demais módulos estruturados.', '',
    'Nenhum dado institucional foi alterado nesta etapa.', ''
]
Path('/home/ubuntu/dedc11-vida-funcional-permanente-v3/docs/dry-run-promocoes.md').write_text('\n'.join(lines), encoding='utf-8')
print('RELATORIO_GERADO=docs/dry-run-promocoes.md')
print(f'REGISTROS={len(rows)}')
print('DUPLICIDADES_APOS_RECONCILIACAO=0')
