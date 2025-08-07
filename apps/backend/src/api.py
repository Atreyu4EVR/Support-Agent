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
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from pydantic import BaseModel
import json

# Add current directory to Python path to import our local agents module
current_dir = os.path.dirname(__file__)
sys.path.insert(0, current_dir)

# Import our local BSC agent and memory manager
from bsc_agents.agent import stream_message_for_api
from bsc_agents.memory import get_memory_manager


def get_flush_content_and_remainder(buffer: str, new_content: str) -> tuple[str, str]:
    """
    Intelligent buffering that returns what to flush and what to keep.
    Prevents word splitting while ensuring smooth streaming.
    
    Returns:
        tuple: (content_to_flush, content_to_keep_in_buffer)
    """
    combined = buffer + new_content
    
    # If content is very short, keep buffering
    if len(combined) < 10:
        return "", combined
    
    # Priority 1: Always flush on sentence endings
    sentence_endings = ['. ', '! ', '? ', '.\n', '!\n', '?\n', '.\"', '!\"', '?\"']
    for ending in sentence_endings:
        if ending in combined:
            idx = combined.rfind(ending)
            if idx > 0:
                return combined[:idx + len(ending)], combined[idx + len(ending):]
    
    # Priority 2: Flush at paragraph breaks
    if '\n\n' in combined:
        idx = combined.rfind('\n\n')
        return combined[:idx + 2], combined[idx + 2:]
    
    # Priority 3: Flush at punctuation that typically ends phrases
    phrase_endings = [', ', ': ', '; ', ' - ', ' — ']
    if len(combined) >= 30:
        for ending in phrase_endings:
            if ending in combined:
                idx = combined.rfind(ending)
                if idx > 15:  # Ensure we have substantial content before
                    return combined[:idx + len(ending)], combined[idx + len(ending):]
    
    # Priority 4: Flush at line breaks with substantial content
    if '\n' in combined and len(combined) > 25:
        idx = combined.rfind('\n')
        if idx > 15:
            return combined[:idx + 1], combined[idx + 1:]
    
    # Priority 5: Smart word boundary detection when buffer gets long
    if len(combined) >= 50:
        # Look for the last complete word boundary
        # A word boundary is a space that's not inside a hyphenated word or number
        for i in range(len(combined) - 1, 20, -1):
            if combined[i] == ' ':
                # Check if this is a good place to break
                # Don't break if we're in the middle of:
                # - A number (e.g., "1 000" or "3.14 159")
                # - A hyphenated word (e.g., "BYU-Idaho")
                # - An apostrophe word (e.g., "Idaho's")
                
                # Look ahead and behind to ensure we're at a real word boundary
                before_space = combined[:i]
                after_space = combined[i+1:] if i+1 < len(combined) else ""
                
                # Don't split if the character before space is a digit and after is a digit
                if (before_space and before_space[-1].isdigit() and 
                    after_space and after_space[0].isdigit()):
                    continue
                
                # Don't split if we're right after a hyphen or apostrophe
                if before_space and before_space[-1] in "-'":
                    continue
                
                # Don't split if we're right before a hyphen or apostrophe
                if after_space and len(after_space) > 1 and after_space[0] in "-'":
                    continue
                
                # This looks like a good word boundary
                return combined[:i + 1], combined[i + 1:]
    
    # Priority 6: For very long content, find any reasonable break point
    if len(combined) >= 100:
        # Try to find any space that's not breaking a word
        last_good_space = -1
        for i in range(len(combined) - 1, 30, -1):
            if combined[i] == ' ':
                # Basic check: not breaking a number or hyphenated word
                if i > 0 and combined[i-1] not in "-'0123456789":
                    last_good_space = i
                    break
        
        if last_good_space > 0:
            return combined[:last_good_space + 1], combined[last_good_space + 1:]
    
    # Priority 7: Emergency flush - buffer is too large
    if len(combined) >= 150:
        # As a last resort, find ANY space
        last_space = combined.rfind(' ')
        if last_space > 50:
            return combined[:last_space + 1], combined[last_space + 1:]
        else:
            # No good break point found, flush most of it but keep some context
            # Try to at least not break in the middle of a word
            flush_point = 140
            while flush_point < len(combined) and combined[flush_point].isalnum():
                flush_point += 1
            return combined[:flush_point], combined[flush_point:]
    
    # Default: keep buffering
    return "", combined


def should_flush_buffer(buffer: str, new_content: str) -> bool:
    """
    Legacy function for compatibility. Uses new smart flushing logic.
    """
    flush_content, _ = get_flush_content_and_remainder(buffer, new_content)
    return len(flush_content) > 0


app = FastAPI(title="BSC Support Agent API", version="1.0.0")


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Middleware to add security headers to all responses"""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Add security headers
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        # Content Security Policy for API responses
        csp_policy = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; "
            "img-src 'self' data: https:; "
            "font-src 'self' https:; "
            "connect-src 'self' https://bsc-frontend.victoriousfield-9e7b4bb6.westus.azurecontainerapps.io https://bsc-backend.victoriousfield-9e7b4bb6.westus.azurecontainerapps.io wss://bsc-backend.victoriousfield-9e7b4bb6.westus.azurecontainerapps.io; "
            "object-src 'none'; "
            "base-uri 'self'; "
            "form-action 'self'; "
            "frame-ancestors 'none'; "
            "upgrade-insecure-requests"
        )
        response.headers["Content-Security-Policy"] = csp_policy
        
        # Additional security headers
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        
        return response


# Add security middleware
app.add_middleware(SecurityHeadersMiddleware)

# CORS configuration for frontend integration
cors_origins = os.getenv(
    "CORS_ORIGINS", 
    "http://localhost:5173,http://localhost:3000,http://localhost:80,https://bsc-frontend.victoriousfield-9e7b4bb6.westus.azurecontainerapps.io"
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

            event_counter = 0
            text_buffer = ""
            
            async for chunk in stream_message_for_api(chat_message.message, session_id):
                event_counter += 1
                
                # Convert to frontend-expected format
                if chunk["type"] == "chunk":
                    # Smart buffering to prevent word splitting
                    content = chunk["content"]
                    
                    # Get what to flush and what to keep in buffer
                    flush_content, text_buffer = get_flush_content_and_remainder(text_buffer, content)
                    
                    # Send the content that's ready to be flushed
                    if flush_content:
                        event_data = json.dumps(
                            {
                                "type": "chunk",
                                "content": flush_content,
                                "timestamp": int(asyncio.get_event_loop().time() * 1000),
                            }
                        )
                        # Proper SSE format with event ID and type
                        yield f"id: {event_counter}\ndata: {event_data}\n\n"
                        
                elif chunk["type"] == "tool_start":
                    # Flush any remaining buffer before tool message
                    if text_buffer.strip():
                        event_counter += 1
                        event_data = json.dumps(
                            {
                                "type": "chunk", 
                                "content": text_buffer,
                                "timestamp": int(asyncio.get_event_loop().time() * 1000),
                            }
                        )
                        yield f"id: {event_counter}\ndata: {event_data}\n\n"
                        text_buffer = ""
                    
                    event_counter += 1
                    event_data = json.dumps(
                        {
                            "type": "tool",
                            "content": f"🔍 {chunk.get('message', 'Searching knowledge base...')}",
                            "timestamp": int(asyncio.get_event_loop().time() * 1000),
                        }
                    )
                    yield f"id: {event_counter}\ndata: {event_data}\n\n"
                    
                elif chunk["type"] == "complete":
                    # Flush any remaining buffer
                    if text_buffer.strip():
                        event_counter += 1
                        event_data = json.dumps(
                            {
                                "type": "chunk",
                                "content": text_buffer,
                                "timestamp": int(asyncio.get_event_loop().time() * 1000),
                            }
                        )
                        yield f"id: {event_counter}\ndata: {event_data}\n\n"
                    
                    event_counter += 1
                    event_data = json.dumps(
                        {
                            "type": "done",
                            "content": "Response complete",
                            "timestamp": int(asyncio.get_event_loop().time() * 1000),
                        }
                    )
                    yield f"id: {event_counter}\ndata: {event_data}\n\n"
                    break

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

            event_counter = 0
            text_buffer = ""
            
            async for chunk in stream_message_for_api(message, session_id):
                event_counter += 1
                
                # Convert to frontend-expected format
                if chunk["type"] == "chunk":
                    # Smart buffering to prevent word splitting
                    content = chunk["content"]
                    
                    # Get what to flush and what to keep in buffer
                    flush_content, text_buffer = get_flush_content_and_remainder(text_buffer, content)
                    
                    # Send the content that's ready to be flushed
                    if flush_content:
                        event_data = json.dumps(
                            {
                                "type": "chunk",
                                "content": flush_content,
                                "timestamp": int(asyncio.get_event_loop().time() * 1000),
                            }
                        )
                        # Proper SSE format with event ID and type
                        yield f"id: {event_counter}\ndata: {event_data}\n\n"
                        
                elif chunk["type"] == "tool_start":
                    # Flush any remaining buffer before tool message
                    if text_buffer.strip():
                        event_counter += 1
                        event_data = json.dumps(
                            {
                                "type": "chunk", 
                                "content": text_buffer,
                                "timestamp": int(asyncio.get_event_loop().time() * 1000),
                            }
                        )
                        yield f"id: {event_counter}\ndata: {event_data}\n\n"
                        text_buffer = ""
                    
                    event_counter += 1
                    event_data = json.dumps(
                        {
                            "type": "tool",
                            "content": f"🔍 {chunk.get('message', 'Searching knowledge base...')}",
                            "timestamp": int(asyncio.get_event_loop().time() * 1000),
                        }
                    )
                    yield f"id: {event_counter}\ndata: {event_data}\n\n"
                    
                elif chunk["type"] == "complete":
                    # Flush any remaining buffer
                    if text_buffer.strip():
                        event_counter += 1
                        event_data = json.dumps(
                            {
                                "type": "chunk",
                                "content": text_buffer,
                                "timestamp": int(asyncio.get_event_loop().time() * 1000),
                            }
                        )
                        yield f"id: {event_counter}\ndata: {event_data}\n\n"
                    
                    event_counter += 1
                    event_data = json.dumps(
                        {
                            "type": "done",
                            "content": "Response complete",
                            "timestamp": int(asyncio.get_event_loop().time() * 1000),
                        }
                    )
                    yield f"id: {event_counter}\ndata: {event_data}\n\n"
                    break

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

    uvicorn.run("api:app", host=host, port=port, reload=True, log_level="info")
