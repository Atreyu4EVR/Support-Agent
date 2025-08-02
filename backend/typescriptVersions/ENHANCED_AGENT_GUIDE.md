# BSC Support Agent - Default Version with Tools (Enhanced)

This is now the **default BSC Support Agent** with full tool integration including Pinecone RAG, Tavily web search, and calculator capabilities.

> 🎯 **This has replaced the simple agent as the primary implementation**

## 🛠️ Available Tools

### 1. Knowledge Base Tool (Pinecone RAG)

- **Purpose**: Search the BYU-Idaho knowledge base for policies, procedures, and information
- **Technology**: Pinecone vector database with Azure OpenAI embeddings
- **Usage**: Automatically used first for all queries (as required by system prompt)

### 2. Web Search Tool (Tavily)

- **Purpose**: Search the web for current information when knowledge base is insufficient
- **Technology**: Tavily API with domain prioritization for BYU-Idaho related sites
- **Usage**: Fallback when knowledge base doesn't have sufficient information

### 3. Calculator Tool

- **Purpose**: Mathematical calculations for GPA, financial aid, credit hours, etc.
- **Technology**: Safe expression evaluation with input sanitization
- **Usage**: Activated when mathematical computations are needed

## 🔧 Environment Setup

### Required Environment Variables

Create `backend/.env` with:

```bash
# Azure OpenAI Configuration (Required)
AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
AZURE_OPENAI_ENDPOINT=https://bsc-agents.openai.azure.com/

# Pinecone Configuration (Required)
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=bsc-knowledge-base
PINECONE_NAMESPACE=bsc-knowledge

# Tavily Configuration (Optional - web search will be disabled if missing)
TAVILY_API_KEY=your_tavily_api_key_here

# API Configuration
PORT=3001
NODE_ENV=development
```

### Service Setup Requirements

#### Pinecone Setup

1. Create account at [Pinecone](https://www.pinecone.io/)
2. Create a new index with:
   - **Dimensions**: 3072 (for text-embedding-3-large)
   - **Metric**: cosine
   - **Index Name**: `bsc-knowledge-base`
3. Upload your BYU-Idaho knowledge base documents
4. Set namespace to `bsc-knowledge` (or update env var)

#### Tavily Setup (Optional)

1. Create account at [Tavily](https://tavily.com/)
2. Get API key from dashboard
3. Set `TAVILY_API_KEY` in environment

## 🚀 Usage

### CLI Interface (Now Default!)

```bash
# Development mode with hot reload (enhanced agent)
npm run dev

# Production build and run (enhanced agent)
npm run build
npm run start

# Legacy simple agent (if needed)
npm run dev:simple
npm run start:simple
```

### API Server

```bash
# Start API server with tools
npm run dev:api
```

The API server will be available at `http://localhost:3001` with these endpoints:

- `GET /api/health` - Health check
- `POST /api/chat` - Non-streaming chat
- `POST /api/chat/stream` - Chunked streaming
- `GET /api/chat/stream?message=hello` - Server-Sent Events

## 🧪 Testing the Implementation

### Test Knowledge Base Tool

```
User: "What are the financial aid deadlines at BYU-Idaho?"
Expected: Agent searches Pinecone knowledge base first, returns specific deadlines with sources
```

### Test Web Search Tool

```
User: "What's the latest news about BYU-Idaho campus construction?"
Expected: Agent tries knowledge base first, then uses Tavily web search for current information
```

### Test Calculator Tool

```
User: "If I have a 3.7 GPA for 15 credits and a 3.2 GPA for 12 credits, what's my cumulative GPA?"
Expected: Agent uses calculator tool to compute weighted average: (3.7×15 + 3.2×12)/(15+12) = 3.47
```

### Test Tool Orchestration

```
User: "I need information about scholarship requirements and help calculating if my 3.8 GPA for 30 credits meets the minimum."
Expected: Agent uses knowledge base for requirements, then calculator for GPA verification
```

## 🔄 Tool Workflow

The agent follows this workflow (as specified in the system prompt):

1. **Knowledge Base First**: Always searches Pinecone knowledge base for any query
2. **Web Search Fallback**: If knowledge base returns insufficient results, uses Tavily web search
3. **Calculator When Needed**: Automatically detects mathematical operations and uses calculator
4. **Source Attribution**: Always provides source information and clickable links

## 🎯 Integration with Frontend

The enhanced agent maintains the same API interface as the simple version, so your React frontend will work without changes. The agent will now:

- Provide more accurate, sourced responses
- Handle complex queries requiring multiple tools
- Show tool usage in streaming responses (future enhancement)
- Follow the system prompt requirements exactly

## 🚨 Troubleshooting

### Common Issues

1. **Pinecone Connection Errors**

   - Verify API key and index name
   - Check index dimensions match embedding model (3072)
   - Ensure namespace exists

2. **Web Search Disabled**

   - Check TAVILY_API_KEY environment variable
   - Verify Tavily account has API access

3. **Memory/Performance Issues**
   - Increase Node.js heap size: `export NODE_OPTIONS="--max-old-space-size=8192"`
   - Monitor token usage in Azure OpenAI

### Debug Mode

Enable debug logging:

```bash
DEBUG=langchain* npm run dev:enhanced
```

## 🔄 Fallback Behavior

If tools are unavailable:

- **Knowledge Base Down**: Agent gracefully falls back to web search or general knowledge
- **Web Search Down**: Agent relies on knowledge base and acknowledges limitations
- **Calculator Issues**: Agent asks user to perform calculations manually

This ensures the agent remains functional even with partial tool availability.
