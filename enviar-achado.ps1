# ============================================================
# enviar-achado.ps1
# Envia um ou mais achados da Lala para o endpoint /api/ingest/lala
# do Painel de Vida Funcional DEDC11.
#
# COMO USAR:
#   1) Nesta janela do PowerShell, defina o token uma vez:
#        $env:LALA_API_KEY = "SEU_TOKEN_AQUI"
#      (Se quiser que fique salvo entre janelas/reinicios, use:
#        [Environment]::SetEnvironmentVariable("LALA_API_KEY","SEU_TOKEN_AQUI","User")
#      e abra um novo PowerShell depois.)
#
#   2) Edite a secao "DADOS DO ACHADO" abaixo com os dados do envio atual.
#
#   3) Rode:  .\enviar-achado.ps1
#
# O token NUNCA fica gravado neste arquivo - ele e lido da variavel de
# ambiente LALA_API_KEY, entao e seguro manter este script guardado,
# reusar e ate versionar, sem expor a credencial.
#
# IMPORTANTE: este arquivo usa so caracteres ASCII de proposito (sem
# acento, sem travessao). Se digitar acento ou travessao dentro das
# strings ao editar no Notepad, o Windows PowerShell pode quebrar o
# script ao salvar/reabrir. Escreva sempre sem acento (nao, voce,
# descricao) e use hifen simples "-" em vez de travessao.
# ============================================================

# ---------- CONFIGURACAO (normalmente nao precisa mexer) ----------
$endpoint = "https://dedc11.onrender.com/api/ingest/lala"

if (-not $env:LALA_API_KEY) {
    Write-Host "ERRO: variavel de ambiente LALA_API_KEY nao encontrada." -ForegroundColor Red
    Write-Host 'Rode antes desta janela:  $env:LALA_API_KEY = "seu-token-aqui"' -ForegroundColor Yellow
    exit 1
}

# ---------- DADOS DO ACHADO (edite aqui a cada envio) ----------

# scanMode: "historical" (carga historica em lote) | "daily" (varredura
# diaria) | "individual" (consulta individualizada / dossie sob demanda)
$scanMode = "individual"

# Rotulo curto e legivel do lote, so pra identificar no historico de runs.
$batchLabel = "Iala - dossie individual matricula 74003189"

# Um ou mais achados. Para enviar mais de um no mesmo lote, adicione outro
# bloco @{ ... } dentro do array, separado por virgula.
$achados = @(
    @{
        matricula          = "74003189"
        nomeOriginal       = "Jose Silenaldo do Nascimento"

        # categoria: ferias | afastamento | licenca-premio | pecunia |
        #            promocao | progressao | transferencia | cessao
        categoria          = "cessao"

        # fonte: dool-egba | spo-uneb | pgdp-uneb | outra
        # Se fonte = "outra", sourceLabel abaixo e obrigatorio.
        fonte              = "outra"
        sourceLabel        = "Certidao e Mapa de Tempo de Contribuicao SUREF/GGP/PGDP"

        description        = "Descreva aqui o achado (o que foi encontrado, contexto)."

        # intelligenceStatus: confirmado | pendente | divergencia | nao_pesquisado
        intelligenceStatus = "confirmado"

        # --- Campos opcionais: apague a linha (com a virgula anterior) se nao usar ---
        # actNumber        = ""     # numero do ato/portaria
        # processoSei      = ""     # numero do processo SEI
        # publicationDate  = ""     # "AAAA-MM-DD" ou "DD/MM/AAAA"
        # sourceUrl        = ""     # URL publica do documento, se existir
        # documentUrl      = ""     # URL do PDF/arquivo, se existir
        # documentText     = ""     # texto extraido do documento
        # masterValue      = ""     # obrigatorio se intelligenceStatus = "divergencia"
        # foundValue       = ""     # obrigatorio se intelligenceStatus = "divergencia"
    }
)

# ---------- ENVIO (normalmente nao precisa mexer) ----------
$body = @{
    scanMode   = $scanMode
    batchLabel = $batchLabel
    achados    = $achados
} | ConvertTo-Json -Depth 10

$headers = @{
    Authorization  = "Bearer $env:LALA_API_KEY"
    "Content-Type" = "application/json"
}

Write-Host "Enviando $($achados.Count) achado(s) para $endpoint ..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri $endpoint -Method Post -Headers $headers -Body $body
    Write-Host "OK - resposta do servidor:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "ERRO na chamada:" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message
    } else {
        Write-Host $_.Exception.Message
    }
}
