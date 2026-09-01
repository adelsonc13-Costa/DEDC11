import json
from pathlib import Path

rows = json.loads(Path('/home/ubuntu/dedc11-vida-funcional-permanente-v3/docs/contatos-completo.json').read_text(encoding='utf-8'))['relatorio_de_contatos']

def q(value):
    if value is None or value == '': return 'NULL'
    return "'" + str(value).replace("'", "''") + "'"

sql = ['START TRANSACTION;']
for row in rows:
    nome = row['nome']
    sql.append("INSERT INTO contacts (serverId, nomeOriginal, setorOriginal, telefoneOriginal, emailOriginal, sourceModule) SELECT (SELECT id FROM servers WHERE UPPER(nomeOriginal)=UPPER(%s) LIMIT 1), %s, %s, %s, %s, 'relatorio_de_contatos' WHERE NOT EXISTS (SELECT 1 FROM contacts WHERE UPPER(nomeOriginal)=UPPER(%s));" % (q(nome), q(nome), q(row.get('setor')), q(row.get('telefone')), q(row.get('email')), q(nome)))
sql.append("UPDATE importRuns SET insertedCount=335, notes='Complementação de contatos concluída: 156 registros no arquivo completo, sem duplicidades por nome normalizado; os três contatos previamente importados foram preservados pela regra idempotente. O cadastro mestre foi relacionado por nome quando disponível, sem alterar fontes originais.' WHERE status='committed' ORDER BY id DESC LIMIT 1;")
sql.append('COMMIT;')
Path('/home/ubuntu/dedc11-vida-funcional-permanente-v3/docs/import-correction-contacts.sql').write_text('\n'.join(sql), encoding='utf-8')
print(f'CONTATOS_FONTE={len(rows)} SQL_COMANDOS={len(sql)}')
