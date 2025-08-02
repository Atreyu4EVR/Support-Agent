#!/bin/bash

# BSC Support Agent - Python Backend Startup Script
echo "🐍 Starting BSC Support Agent Python Backend..."

# Check if virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo "📦 Creating Python virtual environment..."
    cd backend
    python3 -m venv venv
    cd ..
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source backend/venv/bin/activate

# Install dependencies
echo "📥 Installing Python dependencies..."
cd backend
pip install -r requirements.txt

# Verify packages are installed
echo "✅ Checking package installation..."
pip list | grep -E "(agents|fastapi|uvicorn)" || echo "⚠️  Some packages may not be installed"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp .env.example .env
    echo "📝 Please edit backend/.env with your Azure OpenAI and Pinecone credentials"
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

# Change to backend directory to ensure proper module imports
cd "$(dirname "$0")/backend"
echo "📂 Working directory: $(pwd)"

python run_python_api.py