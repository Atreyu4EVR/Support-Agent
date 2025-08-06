# BSC Support Agent - Frontend-Backend Integration Guide

This guide walks you through connecting your React frontend to your Python AI agent backend with streaming support.

## 🏗️ Architecture Overview

```
React Frontend (TypeScript) ←→ Python FastAPI Backend ←→ Azure OpenAI + Pinecone
     Port 5173                      Port 3001              AI Agent + RAG
```

## 🚀 Quick Start

### 1. Backend Setup (Python AI Agent)

```bash
# Set up environment
cp backend/.env.example backend/.env

# Edit backend/.env with your credentials:
# - AZURE_OPENAI_API_KEY
# - AZURE_OPENAI_ENDPOINT
# - AZURE_OPENAI_DEPLOYMENT
# - PINECONE_API_KEY (optional)

# Start Python backend
npm run start:api
# OR
./start_python_backend.sh
```

### 2. Frontend Setup (React)

```bash
# Install dependencies
npm install

# Start frontend (in a new terminal)
npm run dev
```

### 3. Test the Connection

Visit `http://localhost:5173` and start chatting! The backend will be running on `http://localhost:3001`.

## 📡 API Endpoints

Your Python backend provides these endpoints:

- **GET** `/api/health` - Health check
- **POST** `/api/chat` - Non-streaming chat
- **GET** `/api/chat/stream?message=Hello` - Streaming chat (GET)
- **POST** `/api/chat/stream` - Streaming chat (POST)

## 🔄 Streaming Flow

1. **Frontend** sends message via EventSource to `/api/chat/stream`
2. **Backend** processes message through AI agent
3. **Agent** searches knowledge base (Pinecone) if needed
4. **Backend** streams response chunks in real-time
5. **Frontend** displays streaming response with typing animation

## 🛠️ Message Format

### Request (Frontend → Backend)

```json
{
  "message": "How do I register for classes?",
  "sessionId": "optional-session-id"
}
```

### Response (Backend → Frontend)

```json
// Streaming chunks
{"type": "chunk", "content": "To register for classes...", "timestamp": 1234567890}

// Tool activity
{"type": "chunk", "content": "🔍 Searching knowledge base...", "timestamp": 1234567890}

// Completion
{"type": "done", "content": "Stream completed", "timestamp": 1234567890}
```

## 🎯 Key Features

- ✅ **Real-time streaming** - See responses as they're generated
- ✅ **Knowledge base integration** - RAG with Pinecone vector search
- ✅ **Azure OpenAI** - Powered by GPT-4.1 and text-embedding-3-large
- ✅ **Session management** - Optional session tracking
- ✅ **Error handling** - Graceful error responses
- ✅ **CORS support** - Proper frontend-backend communication
- ✅ **TypeScript support** - Type-safe frontend and backend interfaces

## 🔧 Environment Variables

### Backend (Python) - `backend/.env`

```env
# Required
AZURE_OPENAI_API_KEY=your_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4.1

# Optional
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX_NAME=bsc-knowledge-v3
PORT=3001
```

### Frontend (React) - `.env`

```env
VITE_API_URL=http://localhost:3001
```

## 🐛 Troubleshooting

### Backend Issues

- **Import errors**: Make sure you're in the backend directory and virtual environment is activated
- **Missing dependencies**: Run `pip install -r requirements.txt`
- **Environment variables**: Check that `.env` file exists and has all required values

### Frontend Issues

- **CORS errors**: Ensure backend is running on port 3001 and CORS is configured
- **Connection refused**: Check that `VITE_API_URL` points to the correct backend URL
- **Streaming not working**: Verify EventSource support in your browser

### Common Solutions

```bash
# Restart backend
pkill -f "python.*api_example"
npm run start:api

# Check backend health
curl http://localhost:3001/api/health

# Test streaming
curl "http://localhost:3001/api/chat/stream?message=Hello"
```

## 📝 Development Scripts

```bash
# Start everything together
npm run start:concurrent

# Individual components
npm run start:api      # Python backend
npm run start:web      # React frontend

```

## 🔄 Switching Backends

To use the TypeScript backend instead:

```bash
npm run start:api:ts
```

To switch back to Python backend:

```bash
npm run start:api
```

## 🎉 Success Indicators

✅ Backend starts and shows "BSC Support Agent API" message  
✅ Frontend loads at http://localhost:5173  
✅ Health check passes: http://localhost:3001/api/health  
✅ Chat interface streams responses in real-time  
✅ Knowledge base searches work (if Pinecone configured)

---

**Need help?** Check the console logs in both frontend and backend for detailed error messages.
