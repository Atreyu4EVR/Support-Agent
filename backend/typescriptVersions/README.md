# BSC Support Agent - TypeScript Version

A TypeScript refactor of the Python BSC Support Agent using LangChain.js.

## Status

This is a simplified version that demonstrates the core functionality. The full-featured version with Pinecone RAG, web search, and advanced tools encountered TypeScript compilation issues due to complex type inference in the latest LangChain.js versions.

## Current Features

- 🤖 **Azure OpenAI Integration** - Direct chat with GPT-4
- 💬 **Interactive Chat** - Command-line interface
- 🛡️ **Error Handling** - Comprehensive error handling
- 🔧 **TypeScript** - Type safety with simplified approach

## Future Enhancements

The following features from the Python version can be added incrementally:

- 🔍 **Pinecone RAG** - Knowledge base search
- 🌐 **Web Search** - Real-time information lookup
- 🧮 **Calculator** - Mathematical operations
- 📊 **Text Analysis** - Text metrics and readability
- 🤖 **LangGraph.js** - Advanced agent workflows

## Setup

### 1. Environment Configuration

Create a `.env` file:

```bash
# Required
AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
AZURE_OPENAI_ENDPOINT=https://bsc-agents.openai.azure.com/
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build

```bash
npm run build
```

### 4. Run

```bash
# Production
npm start

# Development
npm run dev
```

## Usage

### Interactive Commands

- **exit/quit/bye** - End the conversation
- **help** - Show help menu

### Example Session

```
🤖 BSC Support Agent - TypeScript Version (Simple)
======================================================================
💬 Start chatting! I can help with BYU-Idaho questions.

🔄 Commands:
   • Type 'exit', 'quit', or 'bye' to end the conversation
   • Type 'help' to see this menu again
======================================================================

👤 You: What are the deadlines for financial aid?
BSC Support Agent: Financial aid deadlines at BYU-Idaho typically include...

👤 You: exit
👋 Goodbye! Thanks for chatting!
```

## Architecture

### Core Components

- **SimpleBSCAgent** - Main agent class with Azure OpenAI integration
- **Environment Setup** - Configuration validation
- **Interactive Chat** - Readline-based interface

### Dependencies

- `@langchain/core` - Core abstractions
- `@langchain/openai` - Azure OpenAI integration
- `dotenv` - Environment variable management
- `uuid` - Unique identifier generation

## Comparison with Python Version

### Implemented ✅

- Azure OpenAI LLM integration
- Interactive chat interface
- Environment validation
- Error handling
- System prompt integration

### Not Yet Implemented ⏳

- Pinecone RAG tool (knowledge base search)
- Tavily web search tool
- Calculator tool
- Text analysis tool
- LangGraph.js agent framework
- Streaming responses
- Tool calling capabilities

## Development Notes

### TypeScript Compilation Issues

The original full-featured implementation encountered memory issues during TypeScript compilation due to:

1. **Deep Type Inference** - Complex generic types in LangChain.js tools
2. **Version Conflicts** - Pinecone package version mismatches
3. **Memory Exhaustion** - TypeScript compiler running out of heap space

### Solutions Applied

1. **Simplified Dependencies** - Reduced to core LangChain packages
2. **Relaxed Type Checking** - Disabled strict type checking
3. **Direct API Integration** - Bypassed complex tool abstractions

### Future Improvements

To implement the full feature set:

1. **Incremental Addition** - Add tools one at a time
2. **Version Pinning** - Use specific dependency versions
3. **Type Assertions** - Use `any` types where needed
4. **Memory Optimization** - Increase Node.js heap size if needed

## Troubleshooting

### Environment Issues

```bash
# Check if environment variables are set
echo $AZURE_OPENAI_API_KEY
```

### Build Issues

```bash
# Clean build
npm run clean
npm run build
```

### Memory Issues (if encountered)

```bash
# Increase Node.js heap size
export NODE_OPTIONS="--max-old-space-size=8192"
npm run build
```

## Contributing

When adding new features:

1. Start with simple implementations
2. Test compilation at each step
3. Use type assertions (`as any`) when needed
4. Monitor memory usage during builds

## License

MIT License - see main project for details.
