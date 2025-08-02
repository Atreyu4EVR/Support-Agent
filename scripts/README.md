# 🚀 BSC Support Agent - Deployment Scripts

This directory contains scripts to easily deploy and manage your BSC Support Agent in Azure Container Apps.

## 📁 Scripts Overview

| Script        | Purpose                                                  | Usage                                        |
| ------------- | -------------------------------------------------------- | -------------------------------------------- |
| `deploy.sh`   | **Main deployment script** - builds and deploys your app | `./scripts/deploy.sh [target] [options]`     |
| `status.sh`   | **Status checker** - shows current app status and URLs   | `./scripts/status.sh`                        |
| `logs.sh`     | **Log viewer** - view container logs                     | `./scripts/logs.sh [service] [options]`      |
| `rollback.sh` | **Rollback utility** - revert to previous version        | `./scripts/rollback.sh [service] [revision]` |

## 🎯 Quick Start

### Deploy Everything

```bash
# Deploy both frontend and backend with latest changes
./scripts/deploy.sh

# Or use npm script (easier to remember)
npm run deploy
```

### Deploy Specific Service

```bash
# Deploy only backend
./scripts/deploy.sh backend

# Deploy only frontend
./scripts/deploy.sh frontend
```

### Check Status

```bash
# See current status and URLs
./scripts/status.sh

# Or use npm script
npm run status
```

### View Logs

```bash
# View recent logs from both services
./scripts/logs.sh

# Follow logs in real-time
./scripts/logs.sh --follow

# View only backend logs
./scripts/logs.sh backend --tail 100
```

## 📋 Main Deploy Script Options

### Basic Usage

```bash
./scripts/deploy.sh [target] [options]
```

### Targets

- `all` - Deploy both backend and frontend (default)
- `backend` - Deploy only the Python FastAPI backend
- `frontend` - Deploy only the React frontend

### Options

- `--tag version` - Use specific version tag instead of "latest"
- `--skip-build` - Skip Docker build (use existing images)
- `--skip-tests` - Skip local tests
- `--help` - Show help message

### Examples

```bash
# Standard deployment
./scripts/deploy.sh all

# Deploy with specific version
./scripts/deploy.sh all --tag v1.2.0

# Quick frontend update (skip tests)
./scripts/deploy.sh frontend --skip-tests

# Deploy backend without rebuilding
./scripts/deploy.sh backend --skip-build

# Deploy everything with custom tag
./scripts/deploy.sh --tag hotfix-2024.1
```

## 🔍 Status & Monitoring

### Check App Status

```bash
./scripts/status.sh
```

Shows:

- ✅ Container app status (Running/Stopped)
- 🌐 Live URLs for frontend and backend
- 🐳 Current Docker image versions
- 📊 Recent deployment revisions

### View Logs

```bash
# Recent logs from both services
./scripts/logs.sh

# Follow logs in real-time
./scripts/logs.sh --follow

# Specific service logs
./scripts/logs.sh backend
./scripts/logs.sh frontend

# More log lines
./scripts/logs.sh --tail 200
```

## 🔄 Rollback & Recovery

### List Available Revisions

```bash
# See available backend revisions
./scripts/rollback.sh backend

# See available frontend revisions
./scripts/rollback.sh frontend
```

### Rollback to Previous Version

```bash
# Rollback backend to specific revision
./scripts/rollback.sh backend bsc-backend--0000001

# Rollback frontend
./scripts/rollback.sh frontend bsc-frontend--0000002
```

## 🛠️ Troubleshooting

### Common Issues

**Docker Build Fails:**

```bash
# Make sure Docker is running
docker info

# Login to Azure Container Registry
az acr login --name byuibscsupportagent
```

**Deployment Fails:**

```bash
# Check Azure login
az account show

# View detailed logs
./scripts/logs.sh --tail 100

# Check container status
./scripts/status.sh
```

**App Not Responding:**

```bash
# Check if services are running
./scripts/status.sh

# View real-time logs for errors
./scripts/logs.sh --follow

# Try rolling back to previous working version
./scripts/rollback.sh frontend
```

### Manual Commands

If scripts fail, you can run commands manually:

```bash
# Build and push manually
docker build --platform linux/amd64 -t byuibscsupportagent.azurecr.io/bsc-backend:latest ./apps/backend
docker push byuibscsupportagent.azurecr.io/bsc-backend:latest

# Deploy manually
az containerapp update \
  --name bsc-backend \
  --resource-group byui-bscsupportagent-p \
  --image byuibscsupportagent.azurecr.io/bsc-backend:latest
```

## 🎨 NPM Script Shortcuts

Add these to your workflow:

```bash
npm run deploy        # Deploy everything
npm run deploy:backend # Deploy backend only
npm run deploy:frontend # Deploy frontend only
npm run status        # Check app status
npm run logs          # View recent logs
```

## 🔒 Security Notes

- Scripts automatically login to Azure Container Registry
- All secrets are stored securely in Azure Container App environment variables
- Images are built with AMD64 architecture for Azure compatibility
- Only the frontend is publicly accessible; backend is internal-only

## 📞 Quick Reference

| Need to...                  | Run this...                               |
| --------------------------- | ----------------------------------------- |
| **Deploy latest changes**   | `./scripts/deploy.sh` or `npm run deploy` |
| **Check if app is working** | `./scripts/status.sh` or `npm run status` |
| **See what went wrong**     | `./scripts/logs.sh` or `npm run logs`     |
| **Undo last deployment**    | `./scripts/rollback.sh [service]`         |
| **Deploy just frontend**    | `./scripts/deploy.sh frontend`            |
| **Deploy just backend**     | `./scripts/deploy.sh backend`             |
| **Deploy with version tag** | `./scripts/deploy.sh --tag v1.0.0`        |

---

**Happy Deploying! 🚀**

Your BSC Support Agent is ready to help BYU-Idaho students!
