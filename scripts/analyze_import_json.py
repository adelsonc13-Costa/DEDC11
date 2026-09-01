import json
from collections import Counter
from pathlib import Path

source = Path('/home/ubuntu/upload/dados_dedc11.json')
data = json.loads(source.read_text(encoding='utf-8'))
sections = data.get('secoes', [])
print('JSON_VALIDO=sim')
print(f'SECOES={len(sections)}')
print('TIPOS=' + ','.join(str(s.get('tipo')) for s in sections))
for section in sections:
    tipo = section.get('tipo', 'sem_tipo')
    pages = section.get('paginas', [])
    texts = [line for page in section.get('texto_paginas', []) for line in page.get('texto', [])]
    headers = [line for line in texts if any(token in line.lower() for token in ('nome completo', 'matrícula', 'telefone', 'e-mail', 'portaria', 'processo', 'cargo', 'setor'))]
    records = [line for line in texts if line and not line.lower().startswith('relatório') and line not in headers]
    print(f'MODULO={tipo}|PAGINAS={len(pages)}|LINHAS_TEXTO={len(texts)}|LINHAS_CANDIDATAS={len(records)}')
    print('CABECALHOS=' + ' || '.join(headers[:3]))

print('CHAVES_TOPO=' + ','.join(sorted(data.keys())))
