# Sincronização institucional — fontes e limites

## Fontes consultadas

| Fonte | URL | Observação verificada |
|---|---|---|
| Portal UNEB — Servidores | https://portal.uneb.br/servidores/ | Consulta pública respondeu HTTP 200 durante a validação. |
| DOOL — Diário Oficial Online | https://dool.egba.ba.gov.br/buscanova/ | Interface pública de busca; a busca exige pelo menos três caracteres. |
| SPO — Sistema de Publicações Oficiais | http://www.spo.uneb.br/ | O manual oficial informa consulta pública de atos, enquanto funcionalidades administrativas exigem usuários autorizados e credenciais da rede UNEB. |

## Regras de segurança

A rotina faz consulta somente leitura, calcula uma impressão da fonte e cria pendências em `importConflicts`. Ela não publica, altera ou envia atos para os portais. A Base Mestre só é alterada quando o responsável confirma uma pendência vinculada a servidor.

A integração administrativa do SPO e o espelhamento de extrato de pagamento dependem de API oficial ou credencial institucional autorizada; scraping de áreas autenticadas não será usado como substituto.

## Referências

[1]: https://manuaisdesistemas.uneb.br/pt-br/SPO "Manual público do Sistema de Publicações Oficiais — UNEB"
[2]: https://dool.egba.ba.gov.br/buscanova/ "Busca pública do DOOL/Egba"
[3]: https://dool.egba.ba.gov.br/ "Portal público do Diário Oficial Online — EGBA"
[4]: https://portal.uneb.br/servidores/ "Portal UNEB — Servidores"
