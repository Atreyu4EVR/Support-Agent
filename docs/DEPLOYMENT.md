# 🚀 BSC Support Agent - Deployment Guide

This guide covers containerization and Azure deployment for the BSC Support Agent application.

## 📋 Prerequisites

- [Docker](https://docker.com) installed
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) installed and logged in
- Azure subscription access (IT Artificial Intelligence)
- Required API keys:
  - Azure OpenAI API Key
  - Pinecone API Key
  - Tavily API Key (for web search)

## 🐳 Local Containerized Development

### Quick Start

```bash
# Install dependencies
npm run install:all

# Build and start containers
npm run docker:build
npm run docker:up

# View logs
npm run docker:logs

# Stop containers
npm run docker:down
```

### Manual Docker Commands

```bash
# Build backend
docker build -t bsc-agent-backend ./backend

# Build frontend
docker build -t bsc-agent-frontend .

# Run with docker-compose
docker-compose up -d
```

### Environment Setup

1. Ensure `backend/.env` contains your API keys
2. Update `frontend.env` if needed for different API URL
3. The containers will automatically use these configurations

## ☁️ Azure Container Apps Deployment

### Architecture Overview

```
┌─────────────────────────────────────────────────┐
│              Azure Container Apps               │
├─────────────────────┬───────────────────────────┤
│   Frontend Container │     Backend Container     │
│   (Nginx + React)   │   (Python + FastAPI)     │
│   Port: 80          │   Port: 3001              │
│   External Access   │   Internal Only           │
└─────────────────────┴───────────────────────────┘
│                     │                           │
▼                     ▼                           ▼
Azure Container     Azure Key Vault        Azure OpenAI
Registry            (Secrets)              Pinecone
```

### Automated Deployment

```bash
# Deploy to Azure (interactive)
npm run azure:deploy

# Check deployment status
npm run azure:status
```

### Manual Deployment Steps

#### 1. Setup Azure Resources

```bash
# Login to Azure
az login
az account set --subscription "834f7da6-f117-4463-8842-c12a48a4e25d"

# Create resource group (if not exists)
az group create --name "byui-supportagent-p" --location "westus"

# Create container registry
az acr create --resource-group "byui-supportagent-p" \
              --name "bscagentregistry" \
              --sku Basic \
              --admin-enabled true

# Create Key Vault
az keyvault create --name "bsc-agent-kv" \
                   --resource-group "byui-supportagent-p" \
                   --location "westus" \
                   --enable-rbac-authorization true

# Create Container Apps Environment
az containerapp env create --name "bsc-agent-env" \
                           --resource-group "byui-supportagent-p" \
                           --location "westus"
```

#### 2. Add Secrets to Key Vault

```bash
# Add your API keys (replace with actual values)
az keyvault secret set --vault-name "bsc-agent-kv" \
                       --name "azure-openai-key" \
                       --value "YOUR_AZURE_OPENAI_KEY"

az keyvault secret set --vault-name "bsc-agent-kv" \
                       --name "pinecone-api-key" \
                       --value "YOUR_PINECONE_KEY"

az keyvault secret set --vault-name "bsc-agent-kv" \
                       --name "tavily-api-key" \
                       --value "YOUR_TAVILY_KEY"
```

#### 3. Build and Push Images

```bash
# Login to ACR
az acr login --name "bscagentregistry"

# Build and push backend
docker build -t bscagentregistry.azurecr.io/bsc-agent-backend:latest ./backend
docker push bscagentregistry.azurecr.io/bsc-agent-backend:latest

# Build and push frontend
docker build -t bscagentregistry.azurecr.io/bsc-agent-frontend:latest .
docker push bscagentregistry.azurecr.io/bsc-agent-frontend:latest
```

#### 4. Deploy Container Apps

```bash
# Deploy backend (internal access only)
az containerapp create \
    --name "bsc-agent-backend" \
    --resource-group "byui-supportagent-p" \
    --environment "bsc-agent-env" \
    --image "bscagentregistry.azurecr.io/bsc-agent-backend:latest" \
    --target-port 3001 \
    --ingress internal \
    --min-replicas 1 \
    --max-replicas 3 \
    --cpu 1.0 \
    --memory 2Gi \
    --registry-server "bscagentregistry.azurecr.io"

# Deploy frontend (external access)
az containerapp create \
    --name "bsc-agent-frontend" \
    --resource-group "byui-supportagent-p" \
    --environment "bsc-agent-env" \
    --image "bscagentregistry.azurecr.io/bsc-agent-frontend:latest" \
    --target-port 80 \
    --ingress external \
    --min-replicas 1 \
    --max-replicas 3 \
    --cpu 0.5 \
    --memory 1Gi \
    --registry-server "bscagentregistry.azurecr.io"
```

## 🔧 Configuration

### Environment Variables

#### Backend Container

```bash
AZURE_OPENAI_API_KEY=<from Key Vault>
AZURE_OPENAI_ENDPOINT=https://byui-ai.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini
PINECONE_API_KEY=<from Key Vault>
PINECONE_INDEX_NAME=bsc-agent-knowledge
TAVILY_API_KEY=<from Key Vault>
```

#### Frontend Container

```bash
VITE_API_URL=<backend container internal URL>
```

## 📊 Monitoring & Maintenance

### Health Checks

- **Backend**: `GET /api/health`
- **Frontend**: `GET /` (nginx status)

### Logs

```bash
# View container logs
az containerapp logs show --name "bsc-agent-backend" --resource-group "byui-supportagent-p"
az containerapp logs show --name "bsc-agent-frontend" --resource-group "byui-supportagent-p"

# Stream logs
az containerapp logs tail --name "bsc-agent-backend" --resource-group "byui-supportagent-p"
```

### Scaling

```bash
# Scale backend
az containerapp update --name "bsc-agent-backend" \
                       --resource-group "byui-supportagent-p" \
                       --min-replicas 2 \
                       --max-replicas 5

# Scale frontend
az containerapp update --name "bsc-agent-frontend" \
                       --resource-group "byui-supportagent-p" \
                       --min-replicas 1 \
                       --max-replicas 10
```

## 🔄 CI/CD Integration

Consider setting up GitHub Actions for automated deployments:

1. Build images on code push
2. Push to Azure Container Registry
3. Update Container Apps with new images
4. Run health checks
5. Notify team of deployment status

## 🚨 Troubleshooting

### Common Issues

1. **Container won't start**

   - Check environment variables in Key Vault
   - Verify image was pushed correctly
   - Check resource limits (CPU/Memory)

2. **Frontend can't reach backend**

   - Verify internal networking configuration
   - Check backend container is running
   - Validate nginx proxy configuration

3. **SSE streaming not working**
   - Check nginx proxy settings for SSE
   - Verify timeout configurations
   - Check firewall/network policies

### Debug Commands

```bash
# Check container status
az containerapp show --name "bsc-agent-backend" --resource-group "byui-supportagent-p"

# Execute into running container
az containerapp exec --name "bsc-agent-backend" \
                     --resource-group "byui-supportagent-p" \
                     --command "/bin/bash"

# View environment variables
az containerapp env var list --name "bsc-agent-backend" \
                             --resource-group "byui-supportagent-p"
```

## 💰 Cost Optimization

1. **Use appropriate resource sizing**
2. **Set up auto-scaling rules**
3. **Monitor usage patterns**
4. **Consider spot instances for dev/test**
5. **Use Azure Cost Management alerts**

---

📧 **Need Help?** Contact the BYU-Idaho IT team or check the Azure documentation.
