#!/usr/bin/env python3
"""
Startup script for the Python BSC Support Agent API
This script ensures proper environment loading and starts the FastAPI server
"""

import os
import sys
from pathlib import Path

# Add current directory to Python path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

# Load environment variables
from dotenv import load_dotenv

# Look for .env in the parent directory (backend/)
backend_dir = current_dir.parent
env_path = backend_dir / ".env"
load_dotenv(dotenv_path=env_path)


def check_environment():
    """Check if required environment variables are set"""
    required_vars = [
        "AZURE_OPENAI_API_KEY",
        "AZURE_OPENAI_ENDPOINT",
        "AZURE_OPENAI_DEPLOYMENT",
    ]

    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)

    if missing_vars:
        print("❌ Missing required environment variables:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\nPlease create a backend/.env file based on backend/.env.example")
        print("and fill in your Azure OpenAI credentials.")
        sys.exit(1)

    print("✅ Environment variables loaded successfully")


def main():
    """Main function to start the API server"""
    print("BSC Support Agent - Python API Server")
    print("=" * 50)
    print(f"🐍 Python version: {sys.version}")
    print(f"📂 Working directory: {os.getcwd()}")
    print(f"📍 Script location: {__file__}")

    # Check environment
    check_environment()

    # Optional Pinecone check
    if os.getenv("PINECONE_API_KEY"):
        print("✅ Pinecone API key found - Knowledge base enabled")
    else:
        print(
            "⚠️  Pinecone API key not found - Knowledge base will show fallback responses"
        )

    # Import uvicorn for running the API server
    try:
        import uvicorn
    except ImportError as e:
        print(f"❌ Failed to import uvicorn: {e}")
        print(
            "Make sure you've installed the requirements: pip install -r requirements.txt"
        )
        sys.exit(1)

    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 3001))

    uvicorn.run(
        "api:app",  # Use import string instead of app object for reload support
        host=host,
        port=port,
        reload=True,
        log_level="info",
    )


if __name__ == "__main__":
    main()
