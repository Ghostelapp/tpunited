$ErrorActionPreference = 'Stop'
function Invoke-DeployStep {
    param([string]$Program, [string[]]$Arguments)
    & $Program @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Niepowodzenie: $Program $($Arguments -join ' '). Wdrozenie zatrzymane."
    }
}
Push-Location (Join-Path $PSScriptRoot '..')
try {
    Invoke-DeployStep 'npm' @('ci')
    Invoke-DeployStep 'npm' @('run', 'typecheck')
    Invoke-DeployStep 'npm' @('run', 'game:test')
    Invoke-DeployStep 'npm' @('run', 'build')
    if (-not (Test-Path 'dist/client/assets/forest/props-v2.webp')) {
        throw 'Brak atlasu lasu w buildzie. Wdrozenie zatrzymane.'
    }
    Invoke-DeployStep 'node' @('scripts/prepare-cloudflare-testnet.mjs')
    Invoke-DeployStep 'npx' @('--no-install', 'wrangler', 'd1', 'migrations', 'apply', 'DB', '--remote', '--config', 'wrangler.realtime.json')
    Invoke-DeployStep 'npx' @('--no-install', 'wrangler', 'deploy', '--config', 'wrangler.realtime.json')
    Invoke-DeployStep 'npx' @('--no-install', 'wrangler', 'deploy', '--config', 'dist/server/wrangler.production.json')
    Write-Host 'Wdrozenie zakonczone pomyslnie.' -ForegroundColor Green
} finally {
    Pop-Location
}
