#!/bin/bash

# BSC Support Agent - Rollback Script
# Rollback to a previous revision if deployment fails
# Usage: ./scripts/rollback.sh [backend|frontend] [revision-name]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

RESOURCE_GROUP="byui-bscsupportagent-p"

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Parse arguments
if [ $# -eq 0 ]; then
    echo "Usage: $0 [backend|frontend] [revision-name]"
    echo ""
    echo "If revision-name is not provided, will show available revisions"
    exit 1
fi

SERVICE=$1
REVISION_NAME=$2

# Set app name based on service
case $SERVICE in
    backend)
        APP_NAME="bsc-backend"
        ;;
    frontend)
        APP_NAME="bsc-frontend"
        ;;
    *)
        print_error "Invalid service. Use 'backend' or 'frontend'"
        exit 1
        ;;
esac

# If no revision specified, show available revisions
if [ -z "$REVISION_NAME" ]; then
    print_info "Available revisions for $SERVICE:"
    echo ""
    az containerapp revision list \
        --name "$APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --query "[].{Name:name,Status:properties.runningStatus,CreatedTime:properties.createdTime,TrafficWeight:properties.trafficWeight}" \
        --output table
    echo ""
    echo "Usage: $0 $SERVICE <revision-name>"
    exit 0
fi

# Confirm rollback
print_warning "You are about to rollback $SERVICE to revision: $REVISION_NAME"
read -p "Are you sure? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "Rollback cancelled"
    exit 0
fi

print_info "Rolling back $SERVICE to revision $REVISION_NAME..."

# Set traffic to the specified revision
az containerapp revision set-mode \
    --name "$APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --mode single \
    --revision "$REVISION_NAME"

if [ $? -eq 0 ]; then
    print_success "Successfully rolled back $SERVICE to $REVISION_NAME"
    
    # Show current status
    print_info "Current status:"
    az containerapp show \
        --name "$APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --query "{Name:name,Status:properties.runningStatus,ActiveRevision:properties.latestRevisionName}" \
        --output table
else
    print_error "Rollback failed!"
    exit 1
fi