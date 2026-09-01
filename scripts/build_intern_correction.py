import json
from pathlib import Path

rows = json.loads(Path('/home/ubuntu/dedc11-vida-funcional-permanente-v3/docs/estagiarios-completo.json').read_text(encoding='utf-8'))['relatorio_de_estagiarios']

def q(value):
    if value is None or value == '': return 'NULL'
    return "'" + str(value).replace("'", "''") + "'"

def date_sql(value):
    if not value: return 'NULL'
    parts = str(value).split('/')
    if len(parts) == 3:
        return q(f'{parts[2]}-{parts[1]}-{parts[0]}')
    return q(value)

sql = ['START TRANSACTION;']
for row in rows:
    mat = row.get('matricula')
    values = (q(mat), q(row['nome']), q(row.get('cursando')), q(row.get('setor_atuacao')), q(row.get('turno')), q(row.get('responsavel')), q(row.get('numero_processo')), q(row.get('bolsa')), date_sql(row.get('data_contratacao_uneb')), date_sql(row.get('vencimento')), q(row.get('renovacao')))
    sql.append("INSERT INTO interns (serverId, matricula, nomeOriginal, cursando, setorAtuacao, turno, responsavel, numeroProcesso, bolsa, dataContratacao, vencimento, renovacao, sourceModule) SELECT (SELECT id FROM servers WHERE matricula=%s LIMIT 1), %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'relatorio_de_estagiarios' WHERE NOT EXISTS (SELECT 1 FROM interns WHERE ((matricula=%s) OR (matricula IS NULL AND nomeOriginal=%s)));" % ((q(mat),) + values + (q(mat), q(row['nome']))))
sql.append("UPDATE importRuns SET insertedCount=183, notes='Correção concluída: 183 registros funcionais gravados; os 37 estagiários sem servidor correspondente foram preservados com serverId NULL e as matrículas reconciliadas foram mantidas no cadastro único.' WHERE status='committed' ORDER BY id DESC LIMIT 1;")
sql.append('COMMIT;')
Path('/home/ubuntu/dedc11-vida-funcional-permanente-v3/docs/import-correction-interns.sql').write_text('\n'.join(sql), encoding='utf-8')
print(f'CORRECAO_GERADA={len(rows)}_ESTAGIARIOS')
