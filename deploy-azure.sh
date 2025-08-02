#!/bin/bash

# BSC Support Agent - Azure Container Apps Deployment Script
set -e

# Configuration
RESOURCE_GROUP="byui-supportagent-p"
LOCATION="westus"
SUBSCRIPTION_ID="834f7da6-f117-4463-8842-c12a48a4e25d"
ENVIRONMENT_NAME="bsc-agent-env"
REGISTRY_NAME="bscagentregistry"
KEY_VAULT_NAME="bsc-agent-kv"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 BSC Support Agent - Azure Container Apps Deployment${NC}"
echo "=================================================="

# Check if Azure CLI is installed and logged in
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check login status
if ! az account show &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Azure. Logging in...${NC}"
    az login
fi

# Set subscription
echo -e "${BLUE}📋 Setting subscription...${NC}"
az account set --subscription $SUBSCRIPTION_ID

# Check if resource group exists
echo -e "${BLUE}🏗️  Checking resource group...${NC}"
if ! az group show --name $RESOURCE_GROUP &> /dev/null; then
    echo -e "${YELLOW}⚠️  Resource group $RESOURCE_GROUP does not exist. Creating...${NC}"
    az group create --name $RESOURCE_GROUP --location $LOCATION
else
    echo -e "${GREEN}✅ Resource group $RESOURCE_GROUP exists${NC}"
fi

# Create Azure Container Registry
echo -e "${BLUE}🏗️  Setting up Azure Container Registry...${NC}"
if ! az acr show --name $REGISTRY_NAME --resource-group $RESOURCE_GROUP &> /dev/null; then
    echo -e "${YELLOW}⚠️  Creating Azure Container Registry...${NC}"
    az acr create --resource-group $RESOURCE_GROUP \
                  --name $REGISTRY_NAME \
                  --sku Basic \
                  --admin-enabled true
else
    echo -e "${GREEN}✅ Azure Container Registry exists${NC}"
fi

# Create Key Vault for secrets
echo -e "${BLUE}🔐 Setting up Key Vault...${NC}"
if ! az keyvault show --name $KEY_VAULT_NAME --resource-group $RESOURCE_GROUP &> /dev/null; then
    echo -e "${YELLOW}⚠️  Creating Key Vault...${NC}"
    az keyvault create --name $KEY_VAULT_NAME \
                       --resource-group $RESOURCE_GROUP \
                       --location $LOCATION \
                       --enable-rbac-authorization true
else
    echo -e "${GREEN}✅ Key Vault exists${NC}"
fi

# Create Container Apps Environment
echo -e "${BLUE}🌍 Setting up Container Apps Environment...${NC}"
if ! az containerapp env show --name $ENVIRONMENT_NAME --resource-group $RESOURCE_GROUP &> /dev/null; then
    echo -e "${YELLOW}⚠️  Creating Container Apps Environment...${NC}"
    az containerapp env create --name $ENVIRONMENT_NAME \
                               --resource-group $RESOURCE_GROUP \
                               --location $LOCATION
else
    echo -e "${GREEN}✅ Container Apps Environment exists${NC}"
fi

# Build and push Docker images
echo -e "${BLUE}🐳 Building and pushing Docker images...${NC}"

# Login to ACR
az acr login --name $REGISTRY_NAME

# Build and push backend
echo -e "${YELLOW}📦 Building backend image...${NC}"
docker build -t $REGISTRY_NAME.azurecr.io/bsc-agent-backend:latest ./backend
docker push $REGISTRY_NAME.azurecr.io/bsc-agent-backend:latest

# Build and push frontend
echo -e "${YELLOW}📦 Building frontend image...${NC}"
docker build -t $REGISTRY_NAME.azurecr.io/bsc-agent-frontend:latest .
docker push $REGISTRY_NAME.azurecr.io/bsc-agent-frontend:latest

# Deploy Container Apps
echo -e "${BLUE}🚀 Deploying Container Apps...${NC}"

# Deploy backend
echo -e "${YELLOW}🔧 Deploying backend container app...${NC}"
az containerapp create \
    --name bsc-agent-backend \
    --resource-group $RESOURCE_GROUP \
    --environment $ENVIRONMENT_NAME \
    --image $REGISTRY_NAME.azurecr.io/bsc-agent-backend:latest \
    --target-port 3001 \
    --ingress internal \
    --min-replicas 1 \
    --max-replicas 3 \
    --cpu 1.0 \
    --memory 2Gi \
    --registry-server $REGISTRY_NAME.azurecr.io

# Deploy frontend
echo -e "${YELLOW}🌐 Deploying frontend container app...${NC}"
az containerapp create \
    --name bsc-agent-frontend \
    --resource-group $RESOURCE_GROUP \
    --environment $ENVIRONMENT_NAME \
    --image $REGISTRY_NAME.azurecr.io/bsc-agent-frontend:latest \
    --target-port 80 \
    --ingress external \
    --min-replicas 1 \
    --max-replicas 3 \
    --cpu 0.5 \
    --memory 1Gi \
    --registry-server $REGISTRY_NAME.azurecr.io

# Get the application URL
FRONTEND_URL=$(az containerapp show --name bsc-agent-frontend --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn -o tsv)

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo "=================================================="
echo -e "${BLUE}📱 Application URL: ${GREEN}https://$FRONTEND_URL${NC}"
echo -e "${BLUE}🔍 Monitor: ${GREEN}https://portal.azure.com/#@byui.edu/resource/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP${NC}"
echo ""
echo -e "${YELLOW}⚠️  Next steps:${NC}"
echo "1. Add secrets to Key Vault (AZURE_OPENAI_API_KEY, PINECONE_API_KEY, etc.)"
echo "2. Configure custom domain (supportagent.byui.edu)"
echo "3. Set up monitoring and alerts"
echo "4. Configure CI/CD pipeline"
echo ""