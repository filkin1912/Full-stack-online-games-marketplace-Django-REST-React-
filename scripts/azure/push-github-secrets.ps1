# Uploads repository Actions secrets from a local .env-style file via GitHub CLI.
# Prerequisites: winget install GitHub.cli  then  gh auth login
#
#   Copy-Item github-secrets.local.env.example github-secrets.local.env
#   notepad github-secrets.local.env
#   .\push-github-secrets.ps1
#
# Optional: -Repo "owner/name" if not run from a cloned repo with gh integration.

param(
    [string] $EnvFile = "",
    [string] $Repo = ""
)

$ErrorActionPreference = "Stop"

if ($EnvFile -eq "") { $EnvFile = Join-Path $PSScriptRoot "github-secrets.local.env" }

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "Install GitHub CLI: winget install GitHub.cli" -ForegroundColor Yellow
    Write-Host "Then: gh auth login" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path $EnvFile)) {
    Write-Host "Missing $EnvFile" -ForegroundColor Red
    Write-Host "Copy github-secrets.local.env.example -> github-secrets.local.env and fill it in." -ForegroundColor Yellow
    exit 1
}

$allowed = @(
    "AZURE_CLIENT_ID", "AZURE_TENANT_ID", "AZURE_SUBSCRIPTION_ID",
    "AZURE_RESOURCE_GROUP", "AZURE_ACR_NAME",
    "AZURE_CONTAINER_APP_BACKEND", "AZURE_CONTAINER_APP_FRONTEND",
    "SECRET_KEY", "DB_NAME", "DB_USER", "DB_PASSWORD", "DB_HOST", "DB_PORT",
    "DB_SSLMODE", "DB_CHANNEL_BINDING", "ALLOWED_HOSTS",
    "CORS_ALLOWED_ORIGINS", "CSRF_TRUSTED_ORIGINS",
    "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET",
    "AI_API_KEY"
)
$allowedSet = [System.Collections.Generic.HashSet[string]]::new([string[]]$allowed)

function Parse-EnvLine([string] $line) {
    $line = $line.Trim()
    if ($line -eq "" -or $line.StartsWith("#")) { return $null }
    $i = $line.IndexOf("=")
    if ($i -lt 1) { return $null }
    $name = $line.Substring(0, $i).Trim()
    $value = $line.Substring($i + 1).Trim()
    if ($value.Length -ge 2 -and $value.StartsWith([char]34) -and $value.EndsWith([char]34)) {
        $value = $value.Substring(1, $value.Length - 2)
    }
    return @{ Name = $name; Value = $value }
}

$lines = Get-Content -LiteralPath $EnvFile -Encoding UTF8
$setCount = 0
foreach ($raw in $lines) {
    $parsed = Parse-EnvLine $raw
    if ($null -eq $parsed) { continue }
    $name = $parsed.Name
    $value = $parsed.Value
    if (-not $allowedSet.Contains($name)) {
        Write-Warning "Skipping unknown key (not in workflow): $name"
        continue
    }
    if ($value -eq "") {
        Write-Warning "Skipping empty value: $name"
        continue
    }

    $tmp = [System.IO.Path]::GetTempFileName()
    try {
        [System.IO.File]::WriteAllText($tmp, $value, [System.Text.UTF8Encoding]::new($false))
        $argList = @("secret", "set", $name)
        if ($Repo -ne "") { $argList += @("--repo", $Repo) }
        Get-Content -LiteralPath $tmp -Raw | & gh @argList
        if ($LASTEXITCODE -ne 0) { throw "gh secret set failed for $name (exit $LASTEXITCODE)" }
    } finally {
        Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue
    }
    Write-Host "Set $name"
    $setCount++
}

Write-Host ""
Write-Host "Uploaded $setCount secret(s). Verify: gh secret list"
