/**
 * Chat Service for BSC Support Agent
 * Handles communication with the backend API
 */

export interface ChatMessage {
  message: string;
  sessionId?: string;
}

export interface ChatResponse {
  response?: string;
  output?: string;
  success?: boolean;
  error?: string;
}

export interface StreamChunk {
  type: "chunk" | "done" | "error";
  content: string;
  timestamp: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

/**
 * Send a message to the BSC Agent API (non-streaming)
 */
export async function sendMessage(
  message: string,
  sessionId?: string
): Promise<ChatResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, sessionId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Unknown error occurred");
    }

    return { response: data.response };
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

/**
 * Send a message with Server-Sent Events streaming
 */
export function sendMessageStream(
  message: string,
  onChunk: (content: string) => void,
  onComplete: () => void,
  onError: (error: string) => void,
  sessionId?: string
): EventSource {
  const encodedMessage = encodeURIComponent(message);
  const sessionParam = sessionId
    ? `&sessionId=${encodeURIComponent(sessionId)}`
    : "";
  const eventSource = new EventSource(
    `${API_BASE_URL}/api/chat/stream?message=${encodedMessage}${sessionParam}`
  );

  eventSource.onmessage = (event) => {
    try {
      const chunk: StreamChunk = JSON.parse(event.data);

      switch (chunk.type) {
        case "chunk":
          onChunk(chunk.content);
          break;
        case "done":
          onComplete();
          eventSource.close();
          break;
        case "error":
          onError(chunk.content);
          eventSource.close();
          break;
      }
    } catch {
      onError("Failed to parse response");
      eventSource.close();
    }
  };

  eventSource.onerror = () => {
    console.error("EventSource failed");
    onError("Connection to server failed");
    eventSource.close();
  };

  return eventSource;
}

/**
 * Send a message with chunked streaming (alternative method)
 */
export async function sendMessageChunked(
  message: string,
  onChunk: (content: string) => void,
  onComplete: () => void,
  onError: (error: string) => void
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");

      // Keep the last incomplete line in buffer
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim()) {
          try {
            const chunk: StreamChunk = JSON.parse(line);

            switch (chunk.type) {
              case "chunk":
                onChunk(chunk.content);
                break;
              case "done":
                onComplete();
                return;
              case "error":
                onError(chunk.content);
                return;
            }
          } catch {
            console.warn("Failed to parse chunk:", line);
          }
        }
      }
    }

    onComplete();
  } catch (error) {
    console.error("Error in chunked streaming:", error);
    onError(error instanceof Error ? error.message : "Unknown error");
  }
}

/**
 * Check if the backend API is healthy
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    return response.ok;
  } catch (error) {
    console.error("Health check failed:", error);
    return false;
  }
}
