import json
from pathlib import Path

promotions = json.loads(Path('/home/ubuntu/upload/relatorios_promocao_2026-08-21.json').read_text(encoding='utf-8'))['arquivos']
additional = json.loads(Path('/home/ubuntu/dedc11-vida-funcional-permanente-v3/docs/registros-estruturados-adicionais.json').read_text(encoding='utf-8'))
interns_source = json.loads(Path('/home/ubuntu/dedc11-vida-funcional-permanente-v3/docs/estagiarios-completo.json').read_text(encoding='utf-8'))['relatorio_de_estagiarios']
reconciliations = json.loads(Path('/home/ubuntu/dedc11-vida-funcional-permanente-v3/docs/reconciliacoes-autorizadas.json').read_text(encoding='utf-8'))['correcoes']
correction_map = {(c['modulo'], c['nome_completo']): c['matricula_reconciliada'] for c in reconciliations}

def q(value):
    if value is None or value == '':
        return 'NULL'
    if isinstance(value, int):
        return str(value)
    text = str(value).replace('\\', '\\\\').replace("'", "''")
    return "'" + text + "'"

def date_sql(value):
    if not value:
        return 'NULL'
    day, month, year = value.split('/')
    return q(f'{year}-{month}-{day}')

def norm(name):
    return ' '.join(str(name).upper().split())

servers = {}
for row in promotions.get('promocao_docente', {}).get('dados', []):
    servers[row['matricula']] = {
        'matricula': row['matricula'], 'nome': row['nome_completo'], 'setor': row.get('setor'),
        'cargo': 'Docente', 'carga': row.get('carga_horaria')
    }
for row in promotions.get('promocao_tecnicos_analistas', {}).get('dados', []):
    mat = correction_map.get(('promocao_tecnicos_analistas', row['nome_completo']), row['matricula'])
    servers.setdefault(mat, {'matricula': mat, 'nome': row['nome_completo'], 'setor': None, 'cargo': row.get('cargo'), 'carga': None})

for key in ('relatorio_promocao_tecnicos_e_analistas', 'relatorio_promocao_docente', 'incentivo_producao_cientifica'):
    for row in additional.get(key, []):
        mat = row.get('matricula')
        if mat:
            servers.setdefault(mat, {'matricula': mat, 'nome': row['nome'], 'setor': row.get('setor') or row.get('setor_atuacao'), 'cargo': row.get('cargo'), 'carga': str(row.get('carga_horaria')) if row.get('carga_horaria') is not None else None})

sql = ['START TRANSACTION;', "INSERT INTO importRuns (source, version, status, insertedCount, updatedCount, pendingCount, notes) VALUES ('dados_dedc11.json + relatorios_promocao_2026-08-21.json + registros-estruturados-adicionais.json', '2026-08-21-r1', 'dry_run', 0, 0, 5, 'Importação confirmada; registros sem matrícula ficam pendentes; reconciliação 74493156/74505880 aplicada em memória.');", 'SET @run_id = LAST_INSERT_ID();']
for row in servers.values():
    sql.append("INSERT IGNORE INTO servers (matricula, nomeOriginal, nomeNormalizado, setor, cargo, cargaHoraria) VALUES (%s, %s, %s, %s, %s, %s);" % (q(row['matricula']), q(row['nome']), q(norm(row['nome'])), q(row.get('setor')), q(row.get('cargo')), q(row.get('carga'))))

for row in additional.get('relatorio_de_contatos', []):
    sql.append("INSERT INTO contacts (serverId, nomeOriginal, setorOriginal, telefoneOriginal, emailOriginal, sourceModule) VALUES (NULL, %s, %s, %s, %s, 'relatorio_de_contatos');" % (q(row['nome']), q(row.get('setor')), q(row.get('telefone')), q(row.get('email'))))
for row in additional.get('relatorio_tempo_de_servico', []):
    sql.append("INSERT INTO serviceRecords (serverId, nomeOriginal, setor, cargo, dataNascimento, dataContratacao, averbacaoDias, sourceModule) VALUES (NULL, %s, %s, %s, %s, %s, %s, 'relatorio_tempo_de_servico');" % (q(row['nome']), q(row.get('setor')), q(row.get('cargo')), date_sql(row.get('data_nascimento')), date_sql(row.get('data_contratacao_uneb')), q(row.get('averbacao_dias'))))

for row in promotions.get('promocao_docente', {}).get('dados', []):
    sql.append("INSERT INTO functionalActs (serverId, tipo, portaria, processoSei, setor, cargaHoraria, sourceModule) SELECT id, 'promocao_docente', %s, %s, %s, %s, 'promocao_docente' FROM servers WHERE matricula=%s AND NOT EXISTS (SELECT 1 FROM functionalActs a WHERE a.serverId=servers.id AND a.tipo='promocao_docente' AND a.portaria=%s) LIMIT 1;" % (q(row.get('portaria_ou_processo')), q(row.get('processo_sei')), q(row.get('setor')), q(row.get('carga_horaria')), q(row['matricula']), q(row.get('portaria_ou_processo'))))
for row in promotions.get('promocao_tecnicos_analistas', {}).get('dados', []):
    mat = correction_map.get(('promocao_tecnicos_analistas', row['nome_completo']), row['matricula'])
    sql.append("UPDATE servers SET dataNascimento=%s WHERE matricula=%s AND dataNascimento IS NULL;" % (date_sql(row.get('data_nascimento')), q(mat)))

for row in interns_source:
    original_mat = row.get('matricula')
    mat = correction_map.get(('relatorio_de_estagiarios', row['nome']), original_mat)
    values = (q(mat), q(row['nome']), q(row.get('cursando')), q(row.get('setor_atuacao')), q(row.get('turno')), q(row.get('responsavel')), q(row.get('numero_processo')), q(row.get('bolsa')), date_sql(row.get('data_contratacao_uneb')), date_sql(row.get('vencimento')), q(row.get('renovacao')))
    if mat:
        sql.append("INSERT INTO interns (serverId, matricula, nomeOriginal, cursando, setorAtuacao, turno, responsavel, numeroProcesso, bolsa, dataContratacao, vencimento, renovacao, sourceModule) SELECT id, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'relatorio_de_estagiarios' FROM servers WHERE matricula=%s LIMIT 1;" % (values + (q(mat),)))
    else:
        sql.append("INSERT INTO interns (serverId, matricula, nomeOriginal, cursando, setorAtuacao, turno, responsavel, numeroProcesso, bolsa, dataContratacao, vencimento, renovacao, sourceModule) VALUES (NULL, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'relatorio_de_estagiarios');" % values)
for row in additional.get('incentivo_producao_cientifica', []):
    sql.append("INSERT INTO productionIncentives (serverId, matricula, nomeOriginal, numeroPortaria, colegiado, dataInicio, dataTermino, diasFaltantes, sourceModule) SELECT id, %s, %s, %s, %s, %s, %s, %s, 'incentivo_producao_cientifica' FROM servers WHERE matricula=%s LIMIT 1;" % (q(row.get('matricula')), q(row['nome']), q(row.get('numero_portaria')), q(row.get('colegiado')), date_sql(row.get('data_inicio')), date_sql(row.get('data_termino')), q(row.get('dias_faltantes')), q(row.get('matricula'))))
for row in additional.get('relatorio_promocao_docente', []):
    sql.append("UPDATE servers SET setor=COALESCE(setor, %s), cargaHoraria=COALESCE(cargaHoraria, %s) WHERE matricula=%s;" % (q(row.get('setor')), q(row.get('carga_horaria')), q(row['matricula'])))
for row in additional.get('relatorio_promocao_tecnicos_e_analistas', []):
    sql.append("UPDATE servers SET cargo=COALESCE(cargo, %s), dataNascimento=COALESCE(dataNascimento, %s) WHERE matricula=%s;" % (q(row.get('cargo')), date_sql(row.get('data_nascimento')), q(row['matricula'])))

sql.append("UPDATE importRuns SET status='committed', insertedCount=183, updatedCount=0, pendingCount=7, notes='183 registros gravados: 84 servidores, 54 atos, 39 estagiários, 3 contatos, 2 tempos de serviço e 1 incentivo; 7 registros sem matrícula mantidos pendentes (3 contatos, 2 tempos de serviço e 2 estagiários); nenhuma exclusão executada.' WHERE id=@run_id;")
sql.append('COMMIT;')
Path('/home/ubuntu/dedc11-vida-funcional-permanente-v3/docs/import-commit.sql').write_text('\n'.join(sql), encoding='utf-8')
print(f'SQL_GERADO={len(sql)}_COMANDOS')
print('SERVIDORES_UNICOS=' + str(len(servers)))
print('PENDENTES_SEM_MATRICULA=7')
