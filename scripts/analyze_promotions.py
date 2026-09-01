import json
import re
from collections import Counter
from pathlib import Path

source_path = Path('/home/ubuntu/upload/relatorios_promocao_2026-08-21.json')
correction_path = Path('/home/ubuntu/dedc11-vida-funcional-permanente-v3/docs/reconciliacoes-autorizadas.json')
data = json.loads(source_path.read_text(encoding='utf-8'))
corrections = json.loads(correction_path.read_text(encoding='utf-8'))['correcoes']
correction_map = {(c['modulo'], c['nome_completo']): c['matricula_reconciliada'] for c in corrections}
print('JSON_VALIDO=sim')
print('FONTE_ORIGINAL_INALTERADA=sim')
print('CORRECOES_APLICADAS_EM_MEMORIA=' + str(len(corrections)))
for module, payload in data.get('arquivos', {}).items():
    rows = payload.get('dados', [])
    normalized_mats = []
    for row in rows:
        key = (module, row.get('nome_completo', ''))
        normalized_mats.append(correction_map.get(key, str(row.get('matricula', '')).strip()))
    invalid = [m for m in normalized_mats if not re.fullmatch(r'\d+', m)]
    duplicates = sorted(k for k, v in Counter(normalized_mats).items() if v > 1)
    keys = sorted({k for row in rows for k in row.keys()})
    missing = {k: sum(1 for row in rows if not row.get(k)) for k in keys}
    print(f'MODULO={module}|REGISTROS={len(rows)}|MATRICULAS_INVALIDAS={len(invalid)}|DUPLICADAS={len(duplicates)}')
    print('DUPLICATAS_LISTA=' + ';'.join(duplicates))
    print('AUSENTES=' + ';'.join(f'{k}:{v}' for k, v in sorted(missing.items())))
