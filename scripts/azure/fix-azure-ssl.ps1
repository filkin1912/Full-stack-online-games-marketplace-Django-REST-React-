# Fixes Azure CLI SSL errors caused by Avast (or similar) HTTPS scanning on Windows.
# Run once: .\scripts\azure\fix-azure-ssl.ps1

$ErrorActionPreference = "Stop"
$AzureNeedsLogin = $false

function Test-AzureCliSsl {
    $prev = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    $err = az group list --query "[0].name" -o tsv 2>&1 | Out-String
    $ok = ($LASTEXITCODE -eq 0)
    $ErrorActionPreference = $prev
    if (-not $ok -and $err -match "invalid_grant|InteractionRequired|az login") {
        $script:AzureNeedsLogin = $true
    }
    return $ok
}

function Test-AvastMitm {
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient("login.microsoftonline.com", 443)
        $ssl = New-Object System.Net.Security.SslStream($tcp.GetStream(), $false, ({ $true }))
        $ssl.AuthenticateAsClient("login.microsoftonline.com")
        $issuer = $ssl.RemoteCertificate.Issuer
        $ssl.Close()
        $tcp.Close()
        return ($issuer -match "Avast")
    } catch {
        return $false
    }
}

Write-Host "Resetting Azure CLI SSL overrides..."
$prevEap = $ErrorActionPreference
$ErrorActionPreference = "Continue"
az config unset core.ca_bundle_path 2>&1 | Out-Null
az config unset core.disable_connection_verification 2>&1 | Out-Null
$ErrorActionPreference = $prevEap
Remove-Item Env:REQUESTS_CA_BUNDLE -ErrorAction SilentlyContinue
Remove-Item Env:AZURE_CLI_DISABLE_CONNECTION_VERIFICATION -ErrorAction SilentlyContinue

if (Test-AzureCliSsl) {
    Write-Host "Azure CLI is OK. You can run setup-github-oidc.ps1 now."
    exit 0
}

if ($AzureNeedsLogin) {
    Write-Host ""
    Write-Host "SSL is OK. Your Azure login session expired." -ForegroundColor Green
    Write-Host ""
    Write-Host "Run these commands, then run this script again:" -ForegroundColor Cyan
    Write-Host "  az logout"
    Write-Host "  az login"
    Write-Host ""
    exit 1
}

if (Test-AvastMitm) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host " CAUSE: Avast HTTPS scanning (SSL MITM)" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "PowerShell trusts Avast, but Azure CLI (Python) does not."
    Write-Host "Disable HTTPS scanning in Avast, then re-run this script."
    Write-Host ""
    Write-Host "Steps:" -ForegroundColor Cyan
    Write-Host "  1. Open Avast -> Menu (three lines) -> Settings"
    Write-Host "  2. Scam Guardian -> Web Guard"
    Write-Host "  3. Turn OFF: 'Enable HTTPS scanning' (or 'Scan SSL connections')"
    Write-Host "  4. Confirm / restart browser if prompted"
    Write-Host "  5. Close and reopen this terminal"
    Write-Host "  6. Run: .\scripts\azure\fix-azure-ssl.ps1"
    Write-Host ""
    Write-Host "Alternative: run setup in Azure Cloud Shell (no Avast):" -ForegroundColor Cyan
    Write-Host "  https://shell.azure.com"
    Write-Host ""
    exit 1
}

Write-Host "Azure CLI still failing. Try:" -ForegroundColor Yellow
Write-Host "  - Disable other antivirus HTTPS scanning"
Write-Host "  - Run from Azure Cloud Shell: https://shell.azure.com"
Write-Host "  - Or use GitHub Actions only (secrets + push) after portal setup"
exit 1
