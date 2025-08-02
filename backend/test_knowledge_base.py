#!/usr/bin/env python3
"""
Test script for the BSC Support Agent knowledge base functionality.
Run this to verify your Pinecone and Azure OpenAI setup is working correctly.
"""

import asyncio
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path=".env")

async def test_knowledge_base():
    """Test the knowledge base search functionality"""
    
    print("🧪 Testing BSC Support Agent Knowledge Base Integration")
    print("=" * 60)
    
    # Check environment variables
    required_vars = [
        "AZURE_OPENAI_API_KEY",
        "AZURE_OPENAI_ENDPOINT", 
        "PINECONE_API_KEY"
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print("❌ Missing environment variables:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\nPlease check your .env file and try again.")
        return
    
    print("✅ Environment variables loaded successfully")
    
    # Import and test the knowledge base function
    try:
        # Import the search function from our agent
        import sys
        sys.path.append(os.path.dirname(__file__))
        from agents.agent import search_knowledge_base
        
        print("✅ Knowledge base function imported successfully")
        
        # Test queries
        test_queries = [
            "What are the admission requirements for BYU-Idaho?",
            "financial aid deadlines",
            "How do I register for classes?",
            "graduation requirements"
        ]
        
        for i, query in enumerate(test_queries, 1):
            print(f"\n🔍 Test {i}: Searching for '{query}'")
            print("-" * 40)
            
            try:
                results = await search_knowledge_base(query, top_k=2)
                
                if results:
                    for j, result in enumerate(results, 1):
                        print(f"Result {j}:")
                        print(f"  Score: {result.get('score', 'N/A')}")
                        print(f"  Source: {result.get('source', 'Unknown')}")
                        print(f"  Content: {result.get('content', 'No content')[:100]}...")
                        if result.get('metadata', {}).get('title'):
                            print(f"  Title: {result['metadata']['title']}")
                        print()
                else:
                    print("  No results returned")
                    
            except Exception as e:
                print(f"  ❌ Error: {e}")
    
    except ImportError as e:
        print(f"❌ Failed to import knowledge base function: {e}")
        print("Make sure you have all required dependencies installed:")
        print("pip install -r requirements.txt")
    
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
    
    print("\n" + "=" * 60)
    print("🏁 Knowledge base test completed")

if __name__ == "__main__":
    asyncio.run(test_knowledge_base())