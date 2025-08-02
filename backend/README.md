# BSC Support Agent Backend

This is the Python backend for the BYU-Idaho Support Agent using Azure OpenAI and Pinecone vector database.

## Features

- **Azure OpenAI Integration**: Uses GPT-4 for intelligent responses
- **Pinecone Knowledge Base**: Semantic search through BYU-Idaho knowledge base
- **Function Calling**: Automatic knowledge base search with streaming responses
- **Streaming Support**: Real-time response streaming for frontend integration

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```bash
# Azure OpenAI Configuration (Required)
AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
AZURE_OPENAI_API_VERSION=2024-08-01-preview
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini

# Pinecone Configuration (Required for Knowledge Base)
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=bsc-knowledge-v3

# Optional Configuration
PINECONE_NAMESPACE=default
```

### 3. Run the Agent

#### Interactive Chat (for testing)

```bash
cd backend/agents
python agent.py
```

#### API Integration

The agent can be imported and used in your API:

```python
from agents.agent import agent, stream_message_for_api

# For streaming responses
async for chunk in stream_message_for_api("What are the admission requirements?"):
    print(chunk)
```

## Knowledge Base Tool

The agent now includes a `search_knowledge_base` function tool that:

1. **Automatically searches** the Pinecone vector database when users ask questions
2. **Uses Azure OpenAI embeddings** (text-embedding-3-large) for semantic search
3. **Returns relevant documents** with metadata including sources and scores
4. **Provides fallback responses** when knowledge base is unavailable

### Tool Features

- **Semantic Search**: Uses embeddings to find contextually relevant information
- **Configurable Results**: Adjustable number of results (default: 5)
- **Error Handling**: Graceful fallbacks when Pinecone is unavailable
- **Rich Metadata**: Returns document sources, titles, categories, and URLs
- **Streaming Support**: Integrates with the streaming API for real-time responses

### Usage Example

The agent will automatically use the knowledge base tool when appropriate. For manual usage:

```python
results = await search_knowledge_base("financial aid deadlines", top_k=3)
for result in results:
    print(f"Score: {result['score']}")
    print(f"Content: {result['content']}")
    print(f"Source: {result['source']}")
```

## Available Pinecone Indexes

- `bsc-supportagent-v1`: General support agent index
- `bsc-knowledge-v3`: Primary knowledge base (recommended)
- `bsc-knowledge-v2`: Legacy knowledge base

## Troubleshooting

### Common Issues

1. **Missing Pinecone API Key**: The agent will work without Pinecone but won't have access to the knowledge base
2. **Azure OpenAI Rate Limits**: Implement retry logic for production use
3. **Embedding Model**: Ensure your Azure OpenAI has `text-embedding-3-large` deployed

### Error Messages

- `"Knowledge base is not currently available"`: Check PINECONE_API_KEY
- `"Error accessing knowledge base"`: Check network connectivity and Pinecone index name
- `"No relevant information found"`: Query may need rephrasing or knowledge base lacks content

## Architecture

```
User Question → Agent → search_knowledge_base() → Pinecone → Azure OpenAI Embeddings
                ↓
User ← Streaming Response ← GPT-4 ← Formatted Knowledge Base Results
```

The agent intelligently decides when to search the knowledge base and formats the results into helpful responses for BYU-Idaho students and staff.
