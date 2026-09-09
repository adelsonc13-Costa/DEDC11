# DEDC11 — Pendências para continuar (atualizado nesta sessão)

## Já feito e confirmado em produção

- HEAD do repositório bate com o commit e681635 (6 itens de feedback originais da Lala: fuso horário, grau/referência/nível técnico editáveis, linha do tempo de achados, rótulos duplicados, validação de tamanho de campo no schema).
- **Pendente 1** — cache do `index.html` no `server/_core/vite.ts` corrigido (`serveStatic` agora serve HTML sempre sem cache e assets como immutable). Commit `8d97b10`, deploy **live** no Render.
- **Pendente 2** — 6 rótulos "demonstrativo" trocados em `client/src/pages/Home.tsx` por textos reais (Dossiê do servidor, Edição de cadastro, etc.). Mesmo commit `8d97b10`, também live.
- **Pendente 3** — não era bug: só falta preencher manualmente o campo Categoria no dossiê da Idnéia (matrícula 74003213) pela própria interface. Ação do RH, não de código.

## Documentos de modelo criados (ainda não implementados em código)

1. `claude/modelo-cadastro-docente-reda.md` — modelo de cadastro para Docente Efetivo, Docente REDA (substituto, com relação N:M a efetivos, teto de 72 meses, vida funcional própria) e Técnico REDA (concurso público, cadastro de reserva — modelo diferente do Docente REDA).
2. `claude/dinamica-planilha-rh.md` — mapeamento da planilha "Pesquisa de confirmação do participante.xlsx" do RH: o que cada aba resolve (ADMISSÕES, ANIVERSÁRIO, RENOVAÇÕES, CONTATO, COLEGIADOS, MATRÍCULAS, CARGA HORÁRIA, ARMAZENAMENTO) e o que falta no Painel pra cobrir isso.
3. `claude/motor-calculo-tempo-servico-licenca-aposentadoria.md` — regras de cálculo pra licença-prêmio por quinquênio (admissão até 2015) e estimativa de aposentadoria (tempo mínimo + idade mínima, EC 26/2020). Duas pendências legais em aberto que são escopo da Lala, não do João: data de corte exata de 2015 e abrangência da EC 26/2020 por categoria.

## Fila técnica pra implementar (nenhuma ainda começada)

Da mais simples pra mais estrutural:

1. **Filtro por Carga Horária** — filtro simples sobre o campo `regime`/`workload` já existente, no padrão dos outros filtros de `Home.tsx`.
2. **Tempo de casa calculado + ordenação por antiguidade** — na aba "Tempo de Serviço" (`FunctionalModules.tsx`, `active === "alertas"`, linha 35). Hoje não calcula anos/meses/dias nem ordena por `dataContratacao`. Confirmado no código que falta.
3. **Auditoria de matrícula ausente** — view nova, filtrando por categoria (Estagiário/Docente/Técnico/Terceirizado) pra sinalizar quem está sem matrícula.
4. **Agrupamento por Colegiado/Departamento** — view nova; hoje a lista de Servidores é uma tabela plana sem esse agrupamento organizacional.
5. **Cadastro de Docente Efetivo/REDA e Técnico REDA** — implementar o modelo do documento 1: nova entidade/tabela para REDA (relação N:M), expansão de `APPLY_FIELDS` com `classe`/`nivel` em `server/lalaIngest.ts`, exclusão da categoria `ferias` para docentes na validação de achados, campo de referência rápida (somente leitura) no dossiê do efetivo.
6. **Motor de cálculo — licença-prêmio por quinquênio e estimativa de aposentadoria** — o item de maior valor pro RH e também o mais trabalhoso (documento 3). Depende de confirmação da Lala sobre os dois pontos legais antes de fixar regra definitiva; a estrutura pode ser desenhada como configurável desde já.

## Decisão em aberto

- **Item 8 (redesign visual completo do site)**: usar `mockup-dossie-idneia.html` como referência de estilo pra repaginar o site inteiro, não só o dossiê. Del ainda não decidiu se isso entra na fila agora ou fica pra depois — pendente de resposta antes de qualquer trabalho visual maior.

## Observação de processo

Sem acesso a shell/terminal no computador do RH nesta sessão — `npx tsc --noEmit`, commit, push e conferência de deploy no Render precisam ser feitos manualmente (Codex/terminal ou GitHub Desktop) depois de cada mudança de código, como já foi feito na Pendente 1/2.
