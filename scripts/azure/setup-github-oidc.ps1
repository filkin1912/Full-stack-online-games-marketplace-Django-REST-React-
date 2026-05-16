# One-time Azure + GitHub OIDC setup for gamesplay deployment.
# Run in PowerShell after: az login
# If SSL errors: .\scripts\azure\fix-azure-ssl.ps1  (Avast HTTPS scanning must be off)
# Alternative: run setup-github-oidc.sh in https://shell.azure.com
#
# Default resource group: deployment_via_github (North Europe in portal). Override if the portal name differs:
#   .\setup-github-oidc.ps1 -ResourceGroup 'geployment_via_github'

param(
  [Parameter(Mandatory = $false)]
  [string] $ResourceGroup = "deployment_via_github"
)

$ErrorActionPreference = "Stop"

$FixScript = Join-Path $PSScriptRoot "fix-azure-ssl.ps1"
if (Test-Path $FixScript) {
    & $FixScript
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

$RepoOwner = "filkin1912"
$RepoName = "Full-stack-online-games-marketplace-Django-REST-React-"
$AppName = "github-gamesplay-deploy"
$EnvName = "gamesplay-env"
$BackendApp = "gamesplay-backend"
$FrontendApp = "gamesplay-frontend"
$AcrName = "gamesplayacr$((Get-Random -Maximum 9999))".ToLower()

$SubscriptionId = (az account show --query id -o tsv)
$TenantId = (az account show --query tenantId -o tsv)

Write-Host "Subscription: $SubscriptionId"
Write-Host "Using resource group: $ResourceGroup"
$Location = (az group show --name $ResourceGroup --query location -o tsv 2>$null)
if (-not $Location) {
    Write-Host ""
    Write-Host "Resource group '$ResourceGroup' was not found." -ForegroundColor Red
    Write-Host "Open Azure Portal -> Resource groups and copy the exact name (e.g. geployment_via_github if it was created with a typo)." -ForegroundColor Yellow
    Write-Host "Then run: .\setup-github-oidc.ps1 -ResourceGroup 'EXACT_NAME_FROM_PORTAL'"
    exit 1
}
Write-Host "Location (from existing group): $Location"

Write-Host "Creating ACR $AcrName..."
az acr create `
  --resource-group $ResourceGroup `
  --name $AcrName `
  --sku Basic `
  --admin-enabled false | Out-Null

$AcrId = (az acr show --name $AcrName --resource-group $ResourceGroup --query id -o tsv)

Write-Host "Creating Container Apps environment..."
az extension add --name containerapp --upgrade
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install containerapp extension. Check network/SSL (run fix-azure-ssl.ps1)."
}
az provider register --namespace Microsoft.App --wait
az provider register --namespace Microsoft.OperationalInsights --wait

az containerapp env create `
  --name $EnvName `
  --resource-group $ResourceGroup `
  --location $Location | Out-Null

$PlaceholderImage = "mcr.microsoft.com/k8se/quickstart:latest"

Write-Host "Creating backend container app..."
az containerapp create `
  --name $BackendApp `
  --resource-group $ResourceGroup `
  --environment $EnvName `
  --image $PlaceholderImage `
  --target-port 8000 `
  --ingress external `
  --min-replicas 1 `
  --max-replicas 2 `
  --system-assigned | Out-Null

$BackendPrincipal = (az containerapp show --name $BackendApp --resource-group $ResourceGroup --query identity.principalId -o tsv)
az role assignment create --assignee $BackendPrincipal --role "AcrPull" --scope $AcrId | Out-Null

az containerapp registry set `
  --name $BackendApp `
  --resource-group $ResourceGroup `
  --server "$AcrName.azurecr.io" `
  --identity system | Out-Null

Write-Host "Creating frontend container app..."
az containerapp create `
  --name $FrontendApp `
  --resource-group $ResourceGroup `
  --environment $EnvName `
  --image $PlaceholderImage `
  --target-port 3000 `
  --ingress external `
  --min-replicas 1 `
  --max-replicas 2 `
  --system-assigned | Out-Null

$FrontendPrincipal = (az containerapp show --name $FrontendApp --resource-group $ResourceGroup --query identity.principalId -o tsv)
az role assignment create --assignee $FrontendPrincipal --role "AcrPull" --scope $AcrId | Out-Null

az containerapp registry set `
  --name $FrontendApp `
  --resource-group $ResourceGroup `
  --server "$AcrName.azurecr.io" `
  --identity system | Out-Null

Write-Host "Creating Entra app registration for GitHub Actions OIDC..."
$AppId = (az ad app create --display-name $AppName --query appId -o tsv)
$SpObjectId = (az ad sp create --id $AppId --query id -o tsv)

foreach ($Branch in @("main", "ci-test")) {
  $credFile = Join-Path ([System.IO.Path]::GetTempPath()) ("github-oidc-$Branch-" + [Guid]::NewGuid().ToString() + ".json")
  $subject = "repo:$RepoOwner/$RepoName" + ":ref:refs/heads/$Branch"
  $credBody = @{
    name      = "github-$Branch"
    issuer    = "https://token.actions.githubusercontent.com"
    subject   = $subject
    audiences = @("api://AzureADTokenExchange")
  } | ConvertTo-Json -Compress -Depth 5
  [System.IO.File]::WriteAllText($credFile, $credBody, [System.Text.UTF8Encoding]::new($false))
  try {
    az ad app federated-credential create --id $AppId --parameters $credFile
    if ($LASTEXITCODE -ne 0) { throw "federated-credential create failed for $Branch" }
  } finally {
    Remove-Item -Path $credFile -Force -ErrorAction SilentlyContinue
  }
}

$RgScope = (az group show --name $ResourceGroup --query id -o tsv)
az role assignment create --assignee $AppId --role "Contributor" --scope $RgScope | Out-Null
az role assignment create --assignee $AppId --role "AcrPush" --scope $AcrId | Out-Null

$BackendFqdn = (az containerapp show --name $BackendApp --resource-group $ResourceGroup --query "properties.configuration.ingress.fqdn" -o tsv)
$FrontendFqdn = (az containerapp show --name $FrontendApp --resource-group $ResourceGroup --query "properties.configuration.ingress.fqdn" -o tsv)

Write-Host ""
Write-Host "========== ADD THESE GITHUB SECRETS =========="
Write-Host "Repo: https://github.com/${RepoOwner}/${RepoName}/settings/secrets/actions"
Write-Host ""
Write-Host "AZURE_CLIENT_ID          = $AppId"
Write-Host "AZURE_TENANT_ID          = $TenantId"
Write-Host "AZURE_SUBSCRIPTION_ID    = $SubscriptionId"
Write-Host "AZURE_RESOURCE_GROUP     = $ResourceGroup"
Write-Host "AZURE_ACR_NAME           = $AcrName"
Write-Host "AZURE_CONTAINER_APP_BACKEND  = $BackendApp"
Write-Host "AZURE_CONTAINER_APP_FRONTEND = $FrontendApp"
Write-Host ""
Write-Host "SECRET_KEY               = (strong random string)"
Write-Host "DB_NAME                  = examdb"
Write-Host "DB_USER                  = examuser"
Write-Host "DB_PASSWORD              = exampass"
Write-Host "DB_HOST                  = db"
Write-Host "DB_PORT                  = 5432"
Write-Host "DB_SSLMODE               = (blank for local Docker DB, require for Neon)"
Write-Host "DB_CHANNEL_BINDING       = (blank for local Docker DB, require for Neon)"
Write-Host "ALLOWED_HOSTS            = $BackendFqdn"
Write-Host "CORS_ALLOWED_ORIGINS     = https://$FrontendFqdn"
Write-Host "CSRF_TRUSTED_ORIGINS     = https://$BackendFqdn,https://$FrontendFqdn"
Write-Host "CLOUDINARY_CLOUD_NAME    = ..."
Write-Host "CLOUDINARY_API_KEY       = ..."
Write-Host "CLOUDINARY_API_SECRET    = ..."
Write-Host "AI_API_KEY               = ..."
Write-Host ""
Write-Host "Backend URL (preview):  https://$BackendFqdn"
Write-Host "Frontend URL (preview): https://$FrontendFqdn"
Write-Host "=============================================="
