# Frontend-Backend Integration Guide

## Overview

Your BSC Support Agent is now fully integrated! The frontend React app communicates with your TypeScript backend through a REST API with streaming support.

## Architecture

- **Frontend**: React + TypeScript with Vite, running on port 3000 (dev)
- **Backend**: Express.js + LangChain + Azure OpenAI, running on port 3001
- **Communication**: REST API with Server-Sent Events for streaming

## Setup Instructions

### 1. Environment Variables

Create `backend/.env` with your Azure OpenAI credentials:

```env
AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
AZURE_OPENAI_ENDPOINT=https://your-instance.openai.azure.com/
PORT=3001
NODE_ENV=development
```

Create `.env` (optional, for custom API URL):

```env
VITE_API_URL=http://localhost:3001
```

### 2. Install Dependencies

```bash
npm run install:all
```

### 3. Start the Application

#### Option 1: Start Both Services Together

```bash
npm run start:concurrent
```

#### Option 2: Start Services Separately

```bash
# Terminal 1 - Backend API
npm run start:api

# Terminal 2 - Frontend
npm run start:web
```

## API Endpoints

The backend provides the following endpoints:

- `GET /api/health` - Health check
- `POST /api/chat` - Non-streaming chat (traditional)
- `GET /api/chat/stream?message=hello` - Server-Sent Events streaming
- `POST /api/chat/stream` - Chunked response streaming

## Chat Service Features

The `chatService.ts` provides:

1. **sendMessage()** - Traditional non-streaming API calls
2. **sendMessageStream()** - Server-Sent Events with real-time streaming
3. **sendMessageChunked()** - Alternative chunked streaming method
4. **checkHealth()** - Backend health monitoring
5. **sendMessageToN8n()** - Legacy compatibility function

## Frontend Integration

The Chat component automatically:

- Streams responses in real-time using SSE
- Shows typing indicators during processing
- Handles errors gracefully
- Renders markdown responses beautifully
- Maintains session context

## Troubleshooting

### Backend Issues

- Check that `backend/.env` exists with valid Azure OpenAI credentials
- Verify the backend is running on port 3001
- Check console for Azure OpenAI connection errors

### Frontend Issues

- Ensure the frontend is pointing to the correct API URL
- Check browser console for CORS or connection errors
- Verify the chat service import is working

### Common Fixes

- Make sure both services are running
- Check that ports 3000 and 3001 are available
- Verify Azure OpenAI credentials are correct
- Check network connectivity

## Testing

1. Start both services: `npm run start:concurrent`
2. Open http://localhost:3000 in your browser
3. Navigate to the Chat page
4. Send a test message like "Hello, what is BYU-Idaho?"
5. You should see a streaming response from the BSC Agent

## Next Steps

- Add authentication/session management
- Implement conversation history storage
- Add more sophisticated error handling
- Deploy to Azure using the provided Azure CLI scripts
