#!/bin/bash
echo "🚀 Setting up BSC Support Agent development environment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install root dependencies
echo "📦 Installing workspace dependencies..."
npm install

# Setup frontend
echo "🎨 Setting up frontend..."
cd apps/frontend
npm install
cd ../..

# Setup Python backend
echo "🐍 Setting up Python backend..."
cd apps/backend

# Check if Python is available
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "❌ Error: Python is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Use python3 if available, otherwise python
PYTHON_CMD="python3"
if ! command -v python3 &> /dev/null; then
    PYTHON_CMD="python"
fi

echo "   Creating Python virtual environment..."
$PYTHON_CMD -m venv venv

echo "   Activating virtual environment..."
source venv/bin/activate

echo "   Installing Python dependencies..."
pip install -r requirements.txt

cd ../..

echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "   • Copy backend/.env.example to backend/.env and configure your environment variables"
echo "   • Run 'npm run dev' to start both frontend and backend services"
echo "   • Frontend will be available at http://localhost:5173"
echo "   • Backend API will be available at http://localhost:3001"
echo ""
echo "🛠️  Available commands:"
echo "   npm run dev          - Start both services"
echo "   npm run dev:frontend - Frontend only"
echo "   npm run dev:backend  - Backend only"
echo "   npm run build        - Build for production"
echo "   npm run docker:up    - Start with Docker"