# Auditoria do relatório de datas de nascimento

O relatório recebido contém **156 linhas**, com datas válidas no formato `DD/MM/AAAA`. A normalização encontrou uma duplicidade nominal: `SUELEN MENEZES DOS SANTOS` aparece duas vezes, mas o cadastro autorizado determina a separação entre **SUELY RIBEIRO DE SOUZA — matrícula 92181958** e **SUELEN MENEZES DOS SANTOS — matrícula 92181439**.

| Categoria na fonte | Registros |
|---|---:|
| Docentes | 54 |
| Estagiários | 39 |
| Terceirizados | 33 |
| Técnicos Universitários | 23 |
| Analistas Universitários | 7 |
| Total | 156 |

Foram atualizados **84 servidores**, **37 estagiários existentes**, **24 terceirizados correspondentes** e **156 registros de tempo de serviço**. O segundo cadastro de Suelen foi criado com a matrícula 92181439 e a data `30/10/2002`; o registro 92181958 foi renomeado para Suely, sem atribuir automaticamente a data de Suelen. A divergência foi registrada em `importRuns` como correção autorizada.

O relatório contém **20 telefones ausentes** e **17 e-mails ausentes**. Esses valores permaneceram nulos quando ausentes; valores presentes atualizaram os contatos correspondentes sem apagar informações preexistentes. Os terceirizados sem cadastro mestre correspondente foram mantidos como pendências, sem serem transformados em servidores.

A interface de **Aniversariantes** agora reúne servidores, estagiários e terceirizados que possuem nascimento persistido, exibindo o vínculo e o cargo, curso ou empresa. A tela **Fontes e auditoria** utiliza os contatos atualizados pela mesma reconciliação normalizada.
