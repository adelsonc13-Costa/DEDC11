# Auditoria da integração de terceirizados

A fonte `declaracoes-frequencia-terceirizados.json` contém **5 declarações de frequência**, **28 funcionários**, **3 empresas** e **5 contratos**. A validação sintática foi concluída e todos os funcionários possuem nome, função, turno, empresa e contrato. A normalização por acentos, pontuação, caixa e espaços não encontrou duplicidades entre as 28 pessoas.

| Resultado | Quantidade |
|---|---:|
| Declarações processadas | 5 |
| Pessoas terceirizadas únicas | 28 |
| Frequências mensais gravadas | 28 |
| Empresas | 3 |
| Contratos | 5 |
| Pessoas relacionadas a contatos existentes | 24 |
| Contatos novos sem telefone/e-mail na fonte | 4 |

Os registros foram gravados em transação idempotente. A entidade `terceirizados` mantém a pessoa, empresa, contrato, função, lotação e situação. A entidade `frequenciasTerceirizados` mantém cada competência, página, data de emissão, turno, dias, ocorrência e substituto. Como a fonte não informa início ou fim de contrato, esses campos permanecem nulos e a situação é exibida como **Sem vigência informada**, sem estimativa ou dado inventado.

A reconciliação contra os 84 servidores do cadastro mestre encontrou **0 correspondências nominais únicas** e **28 pessoas pendentes**. Isso significa que nenhum terceirizado foi convertido ou duplicado como servidor público; o vínculo `serverId` permanece nulo até existir matrícula, CPF ou outra evidência autorizada. Os 28 registros continuam, entretanto, na base central funcional de terceirizados, e seus contatos possuem `terceirizadoId` quando associados.

A aba **Contatos** reaproveita registros existentes quando a correspondência normalizada é segura; quando não existe contato, cria apenas o vínculo nominal com telefone e e-mail nulos. A aba **Aniversariantes** consulta a mesma entidade e está preparada para exibir terceirizados quando a data de nascimento for disponibilizada em fonte autorizada. Nenhuma pessoa foi criada como servidor público e nenhuma informação existente foi substituída por vazio.
