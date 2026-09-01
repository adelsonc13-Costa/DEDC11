import json
import re
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path

path = Path('/home/ubuntu/dedc11-vida-funcional-permanente-v3/docs/registros-estruturados-adicionais.json')
data = json.loads(path.read_text(encoding='utf-8'))
print('JSON_VALIDO=sim')
print('BLOCOS=' + str(len(data)))
all_names = defaultdict(list)
all_mats = defaultdict(list)
for module, rows in data.items():
    print(f'MODULO={module}|REGISTROS={len(rows)}')
    for row in rows:
        name = row.get('nome', '').strip()
        if name:
            all_names[name.casefold()].append(module)
        mat = str(row.get('matricula', '')).strip()
        if mat:
            all_mats[mat].append((module, name))
        for key in ('data_nascimento', 'data_contratacao_uneb', 'data_contratacao'):
            if row.get(key):
                try:
                    datetime.strptime(row[key], '%d/%m/%Y')
                except ValueError:
                    print(f'DATA_INVALIDA={module}|campo={key}|valor={row[key]}')
print('TOTAL_REGISTROS=' + str(sum(len(rows) for rows in data.values())))
print('NOMES_REPETIDOS_ENTRE_BLOCOS=' + str(sum(1 for modules in all_names.values() if len(set(modules)) > 1)))
for mat, entries in sorted(all_mats.items()):
    if len(entries) > 1:
        print('MATRICULA_REPETIDA=' + mat + '|' + ';'.join(f'{m}:{n}' for m, n in entries))
print('MATRICULAS_VALIDAS=' + str(sum(bool(re.fullmatch(r'\d+', mat)) for mat in all_mats)))
print('MATRICULAS_INVALIDAS=' + str(sum(not re.fullmatch(r'\d+', mat) for mat in all_mats)))
