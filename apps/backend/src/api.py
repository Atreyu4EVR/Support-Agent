#!/usr/bin/env python3
"""
BSC Support Agent API - FastAPI backend with streaming support
Connects React frontend to Python AI agent with real-time streaming responses.
"""

import asyncio
import os
import sys
from typing import AsyncGenerator, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json

# Add current directory to Python path to import our local agents module
current_dir = os.path.dirname(__file__)
sys.path.insert(0, current_dir)

# Import our local BSC agent and memory manager
from bsc_agents.agent import stream_message_for_api
from bsc_agents.memory import get_memory_manager

app = FastAPI(title="BSC Support Agent API", version="1.0.0")

# CORS configuration for frontend integration
cors_origins = os.getenv(
    "CORS_ORIGINS", 
    "http://localhost:5173,http://localhost:3000,https://bsc-frontend.victoriousfield-9e7b4bb6.westus.azurecontainerapps.io"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


class ChatMessage(BaseModel):
    message: str
    sessionId: Optional[str] = None


class ChatResponse(BaseModel):
    success: bool = True
    response: str
    sources: list = []
    timestamp: Optional[int] = None

    def __init__(self, **data):
        if "timestamp" not in data or data["timestamp"] is None:
            data["timestamp"] = int(asyncio.get_event_loop().time() * 1000)
        super().__init__(**data)


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    memory_manager = get_memory_manager()
    memory_stats = memory_manager.get_session_stats()

    return {
        "status": "ok",
        "service": "BSC Support Agent API",
        "agent": "BSC Support Agent",
        "features": [
            "knowledge_base",
            "streaming",
            "pinecone_rag",
            "conversation_memory",
        ],
        "memory": memory_stats,
        "timestamp": int(asyncio.get_event_loop().time() * 1000),
    }


@app.get("/api/memory/stats")
async def get_memory_stats():
    """Get memory system statistics"""
    memory_manager = get_memory_manager()
    return memory_manager.get_session_stats()


@app.get("/api/memory/sessions/{session_id}")
async def get_session_history(session_id: str, max_messages: Optional[int] = 20):
    """Get conversation history for a specific session"""
    memory_manager = get_memory_manager()
    history = memory_manager.get_conversation_context(session_id, max_messages)
    summary = memory_manager.get_session_summary(session_id)

    return {
        "session_id": session_id,
        "summary": summary,
        "history": history,
        "message_count": len(history),
    }


@app.delete("/api/memory/sessions/{session_id}")
async def clear_session_memory(session_id: str):
    """Clear memory for a specific session"""
    memory_manager = get_memory_manager()
    cleared = memory_manager.clear_session(session_id)

    return {
        "session_id": session_id,
        "cleared": cleared,
        "message": "Session memory cleared" if cleared else "No session found",
    }


@app.post("/api/memory/cleanup")
async def cleanup_expired_sessions():
    """Manually trigger cleanup of expired sessions"""
    memory_manager = get_memory_manager()
    removed_count = memory_manager.cleanup_expired_sessions()

    return {
        "removed_sessions": removed_count,
        "message": f"Cleaned up {removed_count} expired sessions",
    }


@app.post("/api/chat")
async def chat(chat_message: ChatMessage) -> ChatResponse:
    """
    Non-streaming chat endpoint with conversation memory support.
    Returns complete response with sources.
    """
    try:
        response_chunks = []
        sources = []

        # Use session ID if provided, otherwise create a temporary one
        session_id = chat_message.sessionId
        if not session_id:
            import uuid

            session_id = f"temp_{uuid.uuid4().hex[:8]}"

        async for chunk in stream_message_for_api(chat_message.message, session_id):
            if chunk["type"] == "chunk":
                response_chunks.append(chunk["content"])
            elif chunk["type"] == "tool_start":
                # Could collect source information here
                sources.append(chunk.get("tool", "knowledge_base"))

        response_text = "".join(response_chunks)

        return ChatResponse(success=True, response=response_text, sources=sources)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"success": False, "error": f"Error processing message: {str(e)}"},
        )


@app.post("/api/chat/stream")
async def chat_stream_post(chat_message: ChatMessage):
    """
    POST version of streaming chat endpoint using Server-Sent Events with conversation memory.
    Returns real-time streaming response.
    """

    async def event_stream() -> AsyncGenerator[str, None]:
        try:
            # Use session ID if provided, otherwise create a temporary one
            session_id = chat_message.sessionId
            if not session_id:
                import uuid

                session_id = f"temp_{uuid.uuid4().hex[:8]}"

            async for chunk in stream_message_for_api(chat_message.message, session_id):
                # Convert to frontend-expected format
                if chunk["type"] == "chunk":
                    event_data = json.dumps(
                        {
                            "type": "chunk",
                            "content": chunk["content"],
                            "timestamp": int(asyncio.get_event_loop().time() * 1000),
                        }
                    )
                elif chunk["type"] == "tool_start":
                    event_data = json.dumps(
                        {
                            "type": "chunk",
                            "content": f"🔍 {chunk.get('message', 'Searching knowledge base...')}",
                            "timestamp": int(asyncio.get_event_loop().time() * 1000),
                        }
                    )
                elif chunk["type"] == "complete":
                    event_data = json.dumps(
                        {
                            "type": "done",
                            "content": "Response complete",
                            "timestamp": int(asyncio.get_event_loop().time() * 1000),
                        }
                    )
                    yield f"data: {event_data}\n\n"
                    break
                else:
                    continue

                yield f"data: {event_data}\n\n"

            # Send final completion event if not already sent
            completion_event = json.dumps(
                {
                    "type": "done",
                    "content": "Stream completed",
                    "timestamp": int(asyncio.get_event_loop().time() * 1000),
                }
            )
            yield f"data: {completion_event}\n\n"

        except Exception as e:
            error_event = json.dumps(
                {
                    "type": "error",
                    "content": str(e),
                    "timestamp": int(asyncio.get_event_loop().time() * 1000),
                }
            )
            yield f"data: {error_event}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
        },
    )


@app.get("/api/chat/stream")
async def chat_stream_get(
    message: str = Query(..., description="The chat message to process"),
    sessionId: Optional[str] = Query(
        None, description="Optional session ID for conversation memory"
    ),
):
    """
    GET version of streaming endpoint for simple frontend integration with conversation memory.
    Usage: /api/chat/stream?message=Hello&sessionId=123
    """

    async def event_stream() -> AsyncGenerator[str, None]:
        try:
            # Use session ID if provided, otherwise create a temporary one
            session_id = sessionId
            if not session_id:
                import uuid

                session_id = f"temp_{uuid.uuid4().hex[:8]}"

            async for chunk in stream_message_for_api(message, session_id):
                # Convert to frontend-expected format
                if chunk["type"] == "chunk":
                    event_data = json.dumps(
                        {
                            "type": "chunk",
                            "content": chunk["content"],
                            "timestamp": int(asyncio.get_event_loop().time() * 1000),
                        }
                    )
                elif chunk["type"] == "tool_start":
                    event_data = json.dumps(
                        {
                            "type": "chunk",
                            "content": f"🔍 {chunk.get('message', 'Searching knowledge base...')}",
                            "timestamp": int(asyncio.get_event_loop().time() * 1000),
                        }
                    )
                elif chunk["type"] == "complete":
                    event_data = json.dumps(
                        {
                            "type": "done",
                            "content": "Response complete",
                            "timestamp": int(asyncio.get_event_loop().time() * 1000),
                        }
                    )
                    yield f"data: {event_data}\n\n"
                    break
                else:
                    continue

                yield f"data: {event_data}\n\n"

            # Send final completion event if not already sent
            completion_event = json.dumps(
                {
                    "type": "done",
                    "content": "Stream completed",
                    "timestamp": int(asyncio.get_event_loop().time() * 1000),
                }
            )
            yield f"data: {completion_event}\n\n"

        except Exception as e:
            error_event = json.dumps(
                {
                    "type": "error",
                    "content": str(e),
                    "timestamp": int(asyncio.get_event_loop().time() * 1000),
                }
            )
            yield f"data: {error_event}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
        },
    )


if __name__ == "__main__":
    import uvicorn

    # Get configuration from environment
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 3001))

    print("🚀 Starting BSC Support Agent API")
    print("📚 Knowledge base tool enabled (Pinecone)")
    print("🤖 AI Agent powered by Azure OpenAI")
    print("⚡ Real-time streaming responses")
    print("🌐 CORS enabled for frontend integration")
    print(f"\nServer Configuration:")
    print(f"  - Host: {host}")
    print(f"  - Port: {port}")
    print(f"  - CORS Origins: {cors_origins}")
    print(f"\nAPI Endpoints:")
    print(f"  - GET  /api/health              - Health check")
    print(f"  - POST /api/chat                - Non-streaming chat")
    print(f"  - POST /api/chat/stream         - POST streaming chat")
    print(f"  - GET  /api/chat/stream         - GET streaming chat")
    print(f"\nFrontend Integration:")
    print(f"  - Set VITE_API_URL=http://localhost:{port}")
    print(f"  - Frontend should be running on {cors_origins[0]}")
    print("\nStarting server...")

    uvicorn.run("api_example:app", host=host, port=port, reload=True, log_level="info")
