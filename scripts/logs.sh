#!/bin/bash

# BSC Support Agent - Log Viewer
# View logs from your deployed containers
# Usage: ./scripts/logs.sh [backend|frontend|both] [--follow] [--tail N]

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m'

RESOURCE_GROUP="byui-bscsupportagent-p"
SERVICE="both"
FOLLOW_LOGS=false
TAIL_LINES=50

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        backend|frontend|both)
            SERVICE="$1"
            shift
            ;;
        --follow|-f)
            FOLLOW_LOGS=true
            shift
            ;;
        --tail|-t)
            TAIL_LINES="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 [backend|frontend|both] [--follow] [--tail N]"
            echo ""
            echo "Arguments:"
            echo "  backend     Show backend logs only"
            echo "  frontend    Show frontend logs only"
            echo "  both        Show logs from both services (default)"
            echo ""
            echo "Options:"
            echo "  --follow    Follow logs in real-time"
            echo "  --tail N    Show last N lines (default: 50)"
            echo "  --help      Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

show_logs() {
    local service=$1
    local app_name=$2
    
    echo -e "${BLUE}==================== $service Logs ====================${NC}"
    
    if [ "$FOLLOW_LOGS" = true ]; then
        echo -e "${GREEN}Following $service logs (Ctrl+C to stop)...${NC}"
        az containerapp logs show \
            --name "$app_name" \
            --resource-group "$RESOURCE_GROUP" \
            --follow
    else
        echo -e "${GREEN}Last $TAIL_LINES lines from $service:${NC}"
        az containerapp logs show \
            --name "$app_name" \
            --resource-group "$RESOURCE_GROUP" \
            --tail "$TAIL_LINES"
    fi
    echo ""
}

# Show logs based on service selection
if [[ "$SERVICE" == "both" || "$SERVICE" == "backend" ]]; then
    show_logs "Backend" "bsc-backend"
fi

if [[ "$SERVICE" == "both" || "$SERVICE" == "frontend" ]]; then
    show_logs "Frontend" "bsc-frontend"
fi