import json
import re
from collections import Counter
from datetime import datetime
from pathlib import Path

path = Path('/home/ubuntu/dedc11-vida-funcional-permanente-v3/docs/estagiarios-completo.json')
data = json.loads(path.read_text(encoding='utf-8'))
rows = data.get('relatorio_de_estagiarios', [])
matriculas = [str(r.get('matricula')).strip() for r in rows if r.get('matricula')]
print('JSON_VALIDO=sim')
print('REGISTROS=' + str(len(rows)))
print('MATRICULAS_PRESENTES=' + str(len(matriculas)))
print('MATRICULAS_INVALIDAS=' + str(sum(not re.fullmatch(r'\d+', m) for m in matriculas)))
duplicate_values = sorted(m for m, count in Counter(matriculas).items() if count > 1)
print('MATRICULAS_DUPLICADAS=' + str(len(duplicate_values)))
for value in duplicate_values:
    print('DUPLICATA=' + value + '|' + ';'.join(r.get('nome', '') for r in rows if str(r.get('matricula')).strip() == value))
for field in ('data_contratacao_uneb', 'data_contratacao', 'vencimento'):
    invalid = []
    missing = 0
    for r in rows:
        value = r.get(field)
        if not value:
            missing += 1
        else:
            try:
                datetime.strptime(value, '%d/%m/%Y')
            except ValueError:
                invalid.append(value)
    print(f'CAMPO={field}|AUSENTES={missing}|DATAS_INVALIDAS={len(invalid)}')
for field in ('cursando', 'setor_atuacao', 'turno', 'responsavel', 'numero_processo', 'bolsa', 'renovacao'):
    print(f'CAMPO={field}|AUSENTES={sum(not r.get(field) for r in rows)}')
