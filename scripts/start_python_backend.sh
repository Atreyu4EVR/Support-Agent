#!/bin/bash

# BSC Support Agent - Python Backend Startup Script
echo "🐍 Starting BSC Support Agent Python Backend..."

# Change to project root directory (assuming script is run from root)
SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# Check if virtual environment exists
if [ ! -d "apps/backend/venv" ]; then
    echo "📦 Creating Python virtual environment..."
    cd apps/backend
    python3 -m venv venv
    cd ../..
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source apps/backend/venv/bin/activate

# Install dependencies
echo "📥 Installing Python dependencies..."
cd apps/backend
pip install -r requirements.txt

# Verify packages are installed
echo "✅ Checking package installation..."
pip list | grep -E "(agents|fastapi|uvicorn)" || echo "⚠️  Some packages may not be installed"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from template..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
    else
        echo "# BSC Support Agent Environment Variables" > .env
        echo "AZURE_OPENAI_API_KEY=" >> .env
        echo "AZURE_OPENAI_ENDPOINT=" >> .env
        echo "AZURE_OPENAI_DEPLOYMENT=" >> .env
        echo "PINECONE_API_KEY=" >> .env
    fi
    echo "📝 Please edit apps/backend/.env with your Azure OpenAI and Pinecone credentials"
    echo "   Required variables:"
    echo "   - AZURE_OPENAI_API_KEY"
    echo "   - AZURE_OPENAI_ENDPOINT" 
    echo "   - AZURE_OPENAI_DEPLOYMENT"
    echo "   - PINECONE_API_KEY (optional)"
    echo ""
    echo "❌ Cannot start server without proper configuration."
    exit 1
fi

# Start the Python API server
echo "🚀 Starting Python API server..."
echo "📍 Current directory: $(pwd)"
echo "🐍 Python version: $(python --version)"

# Run the API from the src directory
python src/run_python_api.py