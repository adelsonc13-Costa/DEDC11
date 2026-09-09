# Dinâmica da planilha do RH — para replicar no Painel de Vida Funcional

Levantado a partir da planilha "Pesquisa de confirmação do participante.xlsx" (SharePoint do RH). Objetivo: entender a lógica de uso por trás das abas, não copiar a planilha — usar isso pra decidir quais visões/módulos o Painel precisa ter pra substituir de verdade essa ferramenta no dia a dia do RH.

## Princípio geral

A planilha não é uma lista solta — é **uma fonte de dado bruto alimentando várias views calculadas**, cada uma recortando a mesma pessoa sob um ângulo de uso diferente. A pessoa é cadastrada **uma vez** e passa a aparecer automaticamente em 7-8 lugares, sem redigitação. Essa já é a mesma filosofia do Cadastro Mestre do Painel ("Fonte Única de Verdade... inclusões e edições propagam para os módulos dependentes") — o que muda é que a planilha faz isso por fórmula, e o Painel deveria fazer isso por relação de banco de dados.

## pADMISSÕES — a fonte primária (foco principal)

Essa é a aba raiz de onde tudo deriva. Estrutura:

| Coluna | Conteúdo |
|---|---|
| Nome | Nome completo da pessoa |
| Admissão | Data de admissão (entrada manual, única vez) |
| dias trabalhados | **Calculado automaticamente**, formato "12a 11m 16d" (anos, meses, dias desde a admissão até hoje) |

Duas coisas importantes sobre essa aba:

1. **É só entrada manual de Nome + Admissão** — todo o resto do sistema (ordenação por antiguidade, cálculo de tempo de casa) deriva só dessas duas colunas. No Painel, isso já existe conceitualmente na aba "Tempo de serviço", mas vale confirmar se ela calcula "tempo de casa" no mesmo formato (anos/meses/dias) e se atualiza automaticamente todo dia (a planilha recalcula "dias trabalhados" toda vez que é aberta, porque usa a data de hoje como referência — o Painel precisa fazer o mesmo, não guardar um valor estático).

2. **É a chave de junção pra visão de antiguidade** (aba ADMISSÕES = pADMISSÕES ordenada por data). Se o Painel já tem "Tempo de serviço", só falta confirmar se dá pra **ordenar por antiguidade** (quem está há mais tempo primeiro) — essa é a visão que a aba ADMISSÕES resolve na planilha.

## Views derivadas — o que cada uma resolve no dia a dia, e o que já existe no Painel

| Aba da planilha | Pra que serve | Já existe no Painel? |
|---|---|---|
| ADMISSÕES | Ranking de antiguidade (ordenado por data de admissão) | Painel tem "Tempo de serviço" — confirmar se ordena por antiguidade |
| ANIVERSÁRIO | Lembrete de quem faz aniversário essa semana/mês (ordenado por "dias para o aniversário") | Painel já tem "Aniversariantes" — já vimos essa tela funcionando |
| RENOVAÇÕES | Alerta de estagiário com contrato vencendo (calcula dias até renovação, ou "contrato finalizado") | Painel tem "Estagiários" — confirmar se calcula prazo de renovação automaticamente, com alerta |
| CONTATO | Busca rápida de telefone/e-mail por nome | Não vi essa busca específica no Painel — pode já estar coberta pelo cadastro geral de Servidores |
| COLEGIADOS | Agrupamento por departamento/colegiado (Geografia, Pedagogia, Administração), com Classe Funcional de cada um | Não vi um agrupamento por colegiado no Painel — hoje é uma lista única de Servidores, sem essa visão organizacional |
| MATRÍCULAS | Filtro por Categoria (Estagiário/Docente/Técnico/terceirizado), pra auditar quem não tem matrícula cadastrada | Não vi um filtro/auditoria assim no Painel |
| CARGA HORÁRIA | Filtro por carga horária (20h/30h/40h/44h/D.E.), agrupando quem está em cada regime | Não vi esse filtro no Painel |
| ARMAZENAMENTO | Resumo consolidado (Nome + Aniversário + Admissão + Carga + E-mail) numa linha só por pessoa | Já é basicamente o dossiê individual do Painel |

## Recomendação

Não é preciso recriar a planilha inteira — o Painel já cobre Aniversariantes, Estagiários e (parcialmente) Tempo de Serviço. O que falta, na ordem que parece mais útil pro RH:

1. **Agrupamento por Colegiado/Departamento** (como a aba COLEGIADOS) — hoje a lista de Servidores é só uma tabela plana.
2. **Filtro por Carga Horária** — simples de fazer, é só um filtro sobre o campo que já existe no cadastro.
3. **Auditoria de matrícula ausente** (como a aba MATRÍCULAS) — útil pra achar buracos de cadastro, como os 3 técnicos sem matrícula que já achamos.
4. Confirmar que "Tempo de serviço" recalcula automaticamente (não é um valor fixo digitado) e permite ordenar por antiguidade, replicando o papel central de pADMISSÕES.
