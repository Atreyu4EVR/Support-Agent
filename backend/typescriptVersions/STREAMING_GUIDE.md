# BSC Agent - Streaming Implementation Guide

## 🎯 Overview

The BSC Support Agent now supports **real-time streaming responses** for better user experience. This allows your frontend to display AI responses as they're being generated, character by character.

## 🔧 Implementation Details

### 1. **Console Streaming (Current)**

```typescript
// Streams to console in real-time
for await (const chunk of this.streamMessage(userInput)) {
  process.stdout.write(chunk);
}
```

### 2. **API-Ready Streaming**

```typescript
// Returns structured chunks for frontend consumption
async *streamMessageForAPI(userInput: string): AsyncGenerator<{
  type: 'chunk' | 'done' | 'error';
  content: string;
  timestamp: number;
}, void, unknown>
```

## 🌐 Frontend Integration Options

### Option 1: Server-Sent Events (SSE) - **Recommended**

**Benefits:**

- ✅ Real-time streaming
- ✅ Automatic reconnection
- ✅ Browser-native support
- ✅ Simple error handling

**Backend (Express.js):**

```typescript
app.get("/api/chat/stream", async (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  for await (const chunk of agent.streamMessageForAPI(message)) {
    res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    if (chunk.type === "done") break;
  }
  res.end();
});
```

**Frontend (JavaScript):**

```javascript
const eventSource = new EventSource(
  "/api/chat/stream?message=" + encodeURIComponent(message)
);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === "chunk") {
    displayText += data.content;
    updateUI(displayText);
  }
};
```

### Option 2: Chunked HTTP Response

**Benefits:**

- ✅ Works with POST requests
- ✅ Can send additional data
- ⚠️ Slightly more complex parsing

**Backend:**

```typescript
app.post("/api/chat/stream", async (req, res) => {
  res.setHeader("Transfer-Encoding", "chunked");

  for await (const chunk of agent.streamMessageForAPI(message)) {
    res.write(JSON.stringify(chunk) + "\n");
    if (chunk.type === "done") break;
  }
  res.end();
});
```

**Frontend:**

```javascript
const response = await fetch("/api/chat/stream", {
  method: "POST",
  body: JSON.stringify({ message }),
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  // Parse and display chunk
}
```

### Option 3: Traditional (Non-Streaming)

**Benefits:**

- ✅ Simple implementation
- ✅ Better for caching
- ❌ No real-time feedback

```typescript
app.post("/api/chat", async (req, res) => {
  const response = await agent.processMessage(message);
  res.json({ response });
});
```

## 📊 Chunk Format

All streaming methods return structured chunks:

```typescript
{
  type: "chunk" | "done" | "error";
  content: string;
  timestamp: number;
}
```

**Example Sequence:**

```json
{"type":"chunk","content":"Hello","timestamp":1234567890}
{"type":"chunk","content":" there!","timestamp":1234567891}
{"type":"chunk","content":" How","timestamp":1234567892}
{"type":"done","content":"","timestamp":1234567893}
```

## 🚀 Quick Start

### 1. **Install Additional Dependencies**

```bash
npm install express cors
npm install --save-dev @types/express @types/cors
```

### 2. **Run the API Example**

```bash
# Copy the API example (apiExample.ts)
# Build and run
npm run build
node dist/apiExample.js
```

### 3. **Test with Frontend**

```bash
# Open frontendExample.html in browser
# Point to http://localhost:3001
```

## 🎨 Frontend Examples

### React Integration

```jsx
function ChatComponent() {
  const [messages, setMessages] = useState([]);
  const [currentResponse, setCurrentResponse] = useState("");

  const sendMessage = async (message) => {
    const eventSource = new EventSource(
      `/api/chat/stream?message=${encodeURIComponent(message)}`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "chunk") {
        setCurrentResponse((prev) => prev + data.content);
      } else if (data.type === "done") {
        setMessages((prev) => [...prev, currentResponse]);
        setCurrentResponse("");
        eventSource.close();
      }
    };
  };

  return (
    <div>
      {/* Display messages */}
      <div>{currentResponse}</div>
    </div>
  );
}
```

### Vue.js Integration

```vue
<template>
  <div>
    <div v-for="message in messages" :key="message.id">
      {{ message.content }}
    </div>
    <div>{{ currentResponse }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      messages: [],
      currentResponse: "",
    };
  },
  methods: {
    async sendMessage(message) {
      const eventSource = new EventSource(
        `/api/chat/stream?message=${encodeURIComponent(message)}`
      );

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "chunk") {
          this.currentResponse += data.content;
        }
      };
    },
  },
};
</script>
```

## 🛠️ Performance Considerations

### 1. **Connection Management**

- Close EventSource connections when components unmount
- Implement connection timeouts
- Handle network errors gracefully

### 2. **UI Optimization**

- Use `requestAnimationFrame` for smooth text updates
- Debounce rapid chunk updates if needed
- Show typing indicators during streaming

### 3. **Error Handling**

```javascript
eventSource.onerror = (error) => {
  console.error("Streaming error:", error);
  setError("Connection lost. Please try again.");
  eventSource.close();
};
```

## 🔧 Testing

### Test Streaming Response

```bash
# Test SSE endpoint
curl -N "http://localhost:3001/api/chat/stream?message=hello"

# Test chunked endpoint
curl -X POST "http://localhost:3001/api/chat/stream" \
  -H "Content-Type: application/json" \
  -d '{"message":"hello"}'
```

## 📈 Benefits Achieved

1. **✅ Real-time Experience**: Users see responses as they're generated
2. **✅ Better Perceived Performance**: No waiting for complete response
3. **✅ Interactive Feel**: More natural conversation flow
4. **✅ Error Visibility**: Immediate feedback if something goes wrong
5. **✅ Scalable**: Works with any frontend framework

## 🔄 Migration from Non-Streaming

**Before:**

```javascript
const response = await fetch("/api/chat", {
  method: "POST",
  body: JSON.stringify({ message }),
});
const data = await response.json();
displayMessage(data.response);
```

**After (SSE):**

```javascript
const eventSource = new EventSource("/api/chat/stream?message=" + message);
let content = "";

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === "chunk") {
    content += data.content;
    displayMessage(content);
  } else if (data.type === "done") {
    eventSource.close();
  }
};
```

The streaming implementation provides a much more engaging user experience while maintaining full compatibility with existing non-streaming approaches.
