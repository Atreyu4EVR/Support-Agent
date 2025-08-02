#!/bin/bash

# BSC Support Agent - Status Checker
# Quick status check for your deployed apps

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

RESOURCE_GROUP="byui-bscsupportagent-p"

print_header() {
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}     BSC Support Agent - Status Check${NC}"
    echo -e "${BLUE}============================================${NC}"
}

print_header

# Container Apps Status
echo -e "${BLUE}📱 Container Apps Status:${NC}"
az containerapp list --resource-group $RESOURCE_GROUP --output table

echo ""
echo -e "${BLUE}🔗 URLs:${NC}"

# Get Frontend URL
frontend_url=$(az containerapp show \
    --name bsc-frontend \
    --resource-group $RESOURCE_GROUP \
    --query "properties.configuration.ingress.fqdn" \
    --output tsv 2>/dev/null)

if [ -n "$frontend_url" ]; then
    echo -e "${GREEN}Frontend: https://$frontend_url${NC}"
    
    # Test if frontend is responding
    if curl -s --head "https://$frontend_url" | head -n 1 | grep -q "200 OK"; then
        echo -e "${GREEN}✅ Frontend is responding${NC}"
    else
        echo -e "${YELLOW}⚠️  Frontend may not be responding${NC}"
    fi
else
    echo -e "${RED}❌ Frontend URL not found${NC}"
fi

# Get Backend URL
backend_url=$(az containerapp show \
    --name bsc-backend \
    --resource-group $RESOURCE_GROUP \
    --query "properties.configuration.ingress.fqdn" \
    --output tsv 2>/dev/null)

if [ -n "$backend_url" ]; then
    echo -e "${GREEN}Backend:  https://$backend_url${NC}"
else
    echo -e "${RED}❌ Backend URL not found${NC}"
fi

echo ""
echo -e "${BLUE}🐳 Latest Image Tags:${NC}"

# Get latest image info
backend_image=$(az containerapp show \
    --name bsc-backend \
    --resource-group $RESOURCE_GROUP \
    --query "properties.template.containers[0].image" \
    --output tsv 2>/dev/null)

frontend_image=$(az containerapp show \
    --name bsc-frontend \
    --resource-group $RESOURCE_GROUP \
    --query "properties.template.containers[0].image" \
    --output tsv 2>/dev/null)

echo "Backend:  $backend_image"
echo "Frontend: $frontend_image"

echo ""
echo -e "${BLUE}📊 Resource Usage:${NC}"

# Get revision info
echo -e "${YELLOW}Recent Revisions:${NC}"
az containerapp revision list \
    --name bsc-frontend \
    --resource-group $RESOURCE_GROUP \
    --query "[].{Name:name,Status:properties.runningStatus,CreatedTime:properties.createdTime}" \
    --output table | head -5

echo ""
echo -e "${GREEN}✅ Status check complete!${NC}"