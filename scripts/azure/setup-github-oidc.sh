#!/bin/bash
# Run in Azure Cloud Shell: https://shell.azure.com
# curl -sL https://raw.githubusercontent.com/filkin1912/Full-stack-online-games-marketplace-Django-REST-React-/ci-test/scripts/azure/setup-github-oidc.sh | bash
# Or clone repo and: bash scripts/azure/setup-github-oidc.sh

set -euo pipefail

REPO_OWNER="filkin1912"
REPO_NAME="Full-stack-online-games-marketplace-Django-REST-React-"
APP_NAME="github-gamesplay-deploy"
RESOURCE_GROUP="${AZURE_RESOURCE_GROUP:-deployment_via_github}"
ENV_NAME="gamesplay-env"
BACKEND_APP="gamesplay-backend"
FRONTEND_APP="gamesplay-frontend"
ACR_NAME="gamesplayacr$(shuf -i 1000-9999 -n 1)"

SUBSCRIPTION_ID=$(az account show --query id -o tsv)
TENANT_ID=$(az account show --query tenantId -o tsv)

echo "Subscription: $SUBSCRIPTION_ID"
echo "Using resource group: $RESOURCE_GROUP"
LOCATION=$(az group show --name "$RESOURCE_GROUP" --query location -o tsv 2>/dev/null) || true
if [ -z "$LOCATION" ]; then
  echo "Resource group '$RESOURCE_GROUP' not found."
  echo "Copy the exact name from Azure Portal (e.g. geployment_via_github if typo) then:"
  echo "  AZURE_RESOURCE_GROUP='your-rg-name' bash scripts/azure/setup-github-oidc.sh"
  exit 1
fi
echo "Location (from existing group): $LOCATION"

echo "Creating ACR $ACR_NAME..."
az acr create --resource-group "$RESOURCE_GROUP" --name "$ACR_NAME" --sku Basic --admin-enabled false --output none
ACR_ID=$(az acr show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" --query id -o tsv)

az extension add --name containerapp --upgrade
az provider register --namespace Microsoft.App --wait
az provider register --namespace Microsoft.OperationalInsights --wait

az containerapp env create --name "$ENV_NAME" --resource-group "$RESOURCE_GROUP" --location "$LOCATION" --output none

PLACEHOLDER="mcr.microsoft.com/k8se/quickstart:latest"

az containerapp create --name "$BACKEND_APP" --resource-group "$RESOURCE_GROUP" --environment "$ENV_NAME" \
  --image "$PLACEHOLDER" --target-port 8000 --ingress external --min-replicas 1 --max-replicas 2 --system-assigned --output none
BACKEND_PRINCIPAL=$(az containerapp show --name "$BACKEND_APP" --resource-group "$RESOURCE_GROUP" --query identity.principalId -o tsv)
az role assignment create --assignee "$BACKEND_PRINCIPAL" --role AcrPull --scope "$ACR_ID" --output none
az containerapp registry set --name "$BACKEND_APP" --resource-group "$RESOURCE_GROUP" --server "${ACR_NAME}.azurecr.io" --identity system --output none

az containerapp create --name "$FRONTEND_APP" --resource-group "$RESOURCE_GROUP" --environment "$ENV_NAME" \
  --image "$PLACEHOLDER" --target-port 3000 --ingress external --min-replicas 1 --max-replicas 2 --system-assigned --output none
FRONTEND_PRINCIPAL=$(az containerapp show --name "$FRONTEND_APP" --resource-group "$RESOURCE_GROUP" --query identity.principalId -o tsv)
az role assignment create --assignee "$FRONTEND_PRINCIPAL" --role AcrPull --scope "$ACR_ID" --output none
az containerapp registry set --name "$FRONTEND_APP" --resource-group "$RESOURCE_GROUP" --server "${ACR_NAME}.azurecr.io" --identity system --output none

APP_ID=$(az ad app create --display-name "$APP_NAME" --query appId -o tsv)
az ad sp create --id "$APP_ID" --output none

for BRANCH in main ci-test; do
  az ad app federated-credential create --id "$APP_ID" --parameters "{
    \"name\": \"github-${BRANCH}\",
    \"issuer\": \"https://token.actions.githubusercontent.com\",
    \"subject\": \"repo:${REPO_OWNER}/${REPO_NAME}:ref:refs/heads/${BRANCH}\",
    \"audiences\": [\"api://AzureADTokenExchange\"]
  }" --output none
done

RG_SCOPE=$(az group show --name "$RESOURCE_GROUP" --query id -o tsv)
az role assignment create --assignee "$APP_ID" --role Contributor --scope "$RG_SCOPE" --output none
az role assignment create --assignee "$APP_ID" --role AcrPush --scope "$ACR_ID" --output none

BACKEND_FQDN=$(az containerapp show --name "$BACKEND_APP" --resource-group "$RESOURCE_GROUP" --query properties.configuration.ingress.fqdn -o tsv)
FRONTEND_FQDN=$(az containerapp show --name "$FRONTEND_APP" --resource-group "$RESOURCE_GROUP" --query properties.configuration.ingress.fqdn -o tsv)

echo ""
echo "========== ADD THESE GITHUB SECRETS =========="
echo "AZURE_CLIENT_ID=$APP_ID"
echo "AZURE_TENANT_ID=$TENANT_ID"
echo "AZURE_SUBSCRIPTION_ID=$SUBSCRIPTION_ID"
echo "AZURE_RESOURCE_GROUP=$RESOURCE_GROUP"
echo "AZURE_ACR_NAME=$ACR_NAME"
echo "AZURE_CONTAINER_APP_BACKEND=$BACKEND_APP"
echo "AZURE_CONTAINER_APP_FRONTEND=$FRONTEND_APP"
echo "ALLOWED_HOSTS=$BACKEND_FQDN"
echo "CORS_ALLOWED_ORIGINS=https://$FRONTEND_FQDN"
echo "CSRF_TRUSTED_ORIGINS=https://$BACKEND_FQDN,https://$FRONTEND_FQDN"
echo "=============================================="
