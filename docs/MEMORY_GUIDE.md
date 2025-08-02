# BSC Agent Conversation Memory Guide

This guide explains the conversation memory system added to the BSC Support Agent, enabling context-aware conversations across multiple messages.

## Overview

The BSC Agent now supports **session-based conversation memory**, allowing the agent to:

- Remember previous messages within a conversation session
- Provide contextual responses based on conversation history
- Maintain separate conversation contexts for different users
- Automatically manage memory lifecycle and cleanup

## Key Features

### 🧠 Session-Based Memory

- Each conversation session has a unique session ID
- Messages are stored and retrieved per session
- Sessions are automatically isolated from each other

### 🔄 Automatic Context Integration

- Previous conversation history is automatically included in agent prompts
- Agent responses reference prior questions and maintain continuity
- Context is limited to recent messages to prevent prompt overflow

### 🧹 Automatic Cleanup

- Sessions expire after 2 hours of inactivity by default
- Memory usage is managed with configurable session limits
- Background cleanup task removes expired sessions

## API Usage

### Basic Chat with Memory

**POST /api/chat**

```json
{
  "message": "Hi, I'm John and I need help with financial aid",
  "sessionId": "user_john_session_123"
}
```

**POST /api/chat/stream** (Streaming)

```json
{
  "message": "What documents do I need for FAFSA?",
  "sessionId": "user_john_session_123"
}
```

**GET /api/chat/stream** (Simple streaming)

```
GET /api/chat/stream?message=When is the deadline?&sessionId=user_john_session_123
```

### Memory Management Endpoints

**Get Session History**

```
GET /api/memory/sessions/user_john_session_123
```

**Clear Session Memory**

```
DELETE /api/memory/sessions/user_john_session_123
```

**Get Memory Statistics**

```
GET /api/memory/stats
```

**Manual Cleanup**

```
POST /api/memory/cleanup
```

## Frontend Integration

### Generating Session IDs

```javascript
// Generate a unique session ID for each user/conversation
const sessionId = `user_${userId}_${Date.now()}`;

// Or use a UUID library
import { v4 as uuidv4 } from "uuid";
const sessionId = `session_${uuidv4()}`;
```

### Streaming with Memory

```javascript
// EventSource with session support
const eventSource = new EventSource(
  `/api/chat/stream?message=${encodeURIComponent(
    message
  )}&sessionId=${sessionId}`
);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === "chunk") {
    // Display streaming response
    displayText += data.content;
  }
};
```

### Fetch API with Memory

```javascript
const response = await fetch("/api/chat/stream", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    message: userInput,
    sessionId: sessionId,
  }),
});
```

## Python Usage

### Direct Agent Usage

```python
from bsc_agents.agent import stream_message_for_api

# Stream response with session memory
session_id = "my_session_123"
async for chunk in stream_message_for_api("Hello, I need help", session_id):
    if chunk["type"] == "chunk":
        print(chunk["content"], end="", flush=True)
```

### Memory Manager Usage

```python
from bsc_agents.memory import get_memory_manager

memory_manager = get_memory_manager()

# Get conversation history
history = memory_manager.get_conversation_context(session_id, max_messages=10)

# Get session summary
summary = memory_manager.get_session_summary(session_id)

# Clear session
memory_manager.clear_session(session_id)

# Get statistics
stats = memory_manager.get_session_stats()
```

## Configuration

### Memory Manager Settings

```python
from bsc_agents.memory import ConversationMemoryManager

# Custom memory manager
memory_manager = ConversationMemoryManager(
    max_sessions=1000,          # Maximum number of sessions to keep
    session_timeout_hours=2.0   # Hours after which sessions expire
)
```

### Environment Variables

No additional environment variables are required. Memory is stored in-memory and will be reset when the server restarts.

## Testing

### Interactive Testing

```bash
# Run the agent with memory support
cd backend
python bsc_agents/agent.py

# Use special commands:
# 'memory' - Show conversation history
# 'reset' - Clear conversation memory
# 'exit' - Quit with session summary
```

### Memory Test Suite

```bash
# Run comprehensive memory tests
cd backend
python test_memory.py
```

## Best Practices

### Session ID Strategy

1. **User-based sessions**: Include user ID in session ID

   ```
   session_user_12345_20241201
   ```

2. **Conversation-based sessions**: Create new session for new topics

   ```
   conversation_financial_aid_456
   conversation_admissions_789
   ```

3. **Time-based sessions**: Include timestamp for debugging
   ```
   user_john_20241201_143022
   ```

### Memory Management

1. **Session Cleanup**: Let the system handle automatic cleanup
2. **Manual Clearing**: Provide users option to clear their conversation
3. **Privacy**: Clear sessions when users log out
4. **Performance**: Monitor memory usage in production

### Error Handling

```javascript
// Handle missing session gracefully
try {
  const response = await fetch("/api/chat", {
    method: "POST",
    body: JSON.stringify({
      message: userInput,
      sessionId: sessionId || null, // Falls back to temporary session
    }),
  });
} catch (error) {
  console.error("Chat error:", error);
}
```

## Memory Architecture

### Data Flow

1. **User Message** → API receives message with session ID
2. **Memory Lookup** → Retrieve conversation history for session
3. **Context Building** → Add history to agent prompt
4. **Agent Processing** → Generate response with full context
5. **Memory Storage** → Save user message and agent response

### Storage Structure

```
ConversationSession {
  session_id: string
  messages: [
    {
      role: "user" | "assistant"
      content: string
      timestamp: float
      metadata: object
    }
  ]
  created_at: float
  last_activity: float
}
```

## Monitoring

### Health Check with Memory Stats

```bash
curl http://localhost:3001/api/health
```

Returns:

```json
{
  "status": "ok",
  "features": ["knowledge_base", "streaming", "conversation_memory"],
  "memory": {
    "total_sessions": 5,
    "total_messages": 23,
    "average_messages_per_session": 4.6
  }
}
```

### Memory Statistics

```bash
curl http://localhost:3001/api/memory/stats
```

## Troubleshooting

### Common Issues

1. **Memory not persisting**: Check session ID consistency
2. **Context not working**: Verify agent receives conversation history
3. **Performance issues**: Monitor session count and cleanup frequency
4. **Memory leaks**: Enable automatic cleanup and set reasonable limits

### Debug Commands

```python
# Check active sessions
memory_manager = get_memory_manager()
print(f"Active sessions: {memory_manager.get_active_sessions_count()}")

# Force cleanup
removed = memory_manager.cleanup_expired_sessions()
print(f"Cleaned up {removed} sessions")

# View session details
history = memory_manager.get_conversation_context(session_id)
print(f"Session has {len(history)} messages")
```

## Future Enhancements

Planned improvements:

- Persistent storage (database integration)
- Advanced context summarization for long conversations
- User preference storage
- Conversation export functionality
- Analytics and conversation insights
