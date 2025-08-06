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
  type: "chunk" | "done" | "error" | "tool";
  content: string;
  timestamp: number;
  // Optional metadata for debugging concatenation issues
  metadata?: {
    bufferLength?: number;
    chunkIndex?: number;
    hasSpacing?: boolean;
  };
}

// Smart API URL detection for different environments
const API_BASE_URL = (() => {
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  // Production Azure or Docker container (nginx proxy)
  if (hostname.includes('azurecontainerapps.io') || 
      hostname.includes('byui.edu') || 
      (hostname === 'localhost' && port === '80')) {
    return ''; // Use relative URL to go through nginx proxy
  }
  
  // Local development
  return import.meta.env.VITE_API_URL || "http://localhost:3001";
})();

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
      // Add debugging for development
      if (import.meta.env.DEV) {
        console.log('SSE Event received:', event.data);
      }
      
      const chunk: StreamChunk = JSON.parse(event.data);

      switch (chunk.type) {
        case "chunk":
          onChunk(chunk.content);
          break;
        case "tool":
          // Tool messages are informational, can be displayed or filtered
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
        default:
          console.warn('Unknown chunk type:', chunk.type);
          break;
      }
    } catch (parseError) {
      console.error('Failed to parse SSE data:', event.data, parseError);
      onError("Failed to parse response");
      eventSource.close();
    }
  };

  // Note: We rely on the generic onmessage handler above for all event types
  // since our backend sends structured data with type information

  eventSource.onerror = (error) => {
    console.error("EventSource failed:", error);
    console.error("EventSource readyState:", eventSource.readyState);
    console.error("EventSource URL:", eventSource.url);
    
    // More specific error messages
    if (eventSource.readyState === EventSource.CONNECTING) {
      onError("Connecting to server...");
    } else if (eventSource.readyState === EventSource.CLOSED) {
      onError("Connection to server was closed");
    } else {
      onError("Connection to server failed");
    }
    
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
  onError: (error: string) => void,
  sessionId?: string
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, sessionId }),
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

// Memory Management Functions

export interface MemoryStats {
  total_sessions: number;
  total_messages: number;
  average_messages_per_session: number;
  oldest_session_age_seconds: number;
  newest_session_age_seconds: number;
  max_sessions: number;
  session_timeout_hours: number;
}

export interface SessionHistory {
  session_id: string;
  summary: string;
  history: Array<{
    role: string;
    content: string;
    timestamp: number;
    metadata: Record<string, unknown>;
  }>;
  message_count: number;
}

/**
 * Get memory system statistics
 */
export async function getMemoryStats(): Promise<MemoryStats> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/memory/stats`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error getting memory stats:", error);
    throw error;
  }
}

/**
 * Get conversation history for a session
 */
export async function getSessionHistory(
  sessionId: string,
  maxMessages?: number
): Promise<SessionHistory> {
  try {
    const url = new URL(`${API_BASE_URL}/api/memory/sessions/${sessionId}`);
    if (maxMessages) {
      url.searchParams.set("max_messages", maxMessages.toString());
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error getting session history:", error);
    throw error;
  }
}

/**
 * Clear memory for a specific session
 */
export async function clearSessionMemory(sessionId: string): Promise<{
  session_id: string;
  cleared: boolean;
  message: string;
}> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/memory/sessions/${sessionId}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error clearing session memory:", error);
    throw error;
  }
}

/**
 * Manually trigger cleanup of expired sessions
 */
export async function cleanupExpiredSessions(): Promise<{
  removed_sessions: number;
  message: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/memory/cleanup`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error cleaning up sessions:", error);
    throw error;
  }
}

/**
 * Generate a persistent session ID
 */
export function generateSessionId(userId?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);

  if (userId) {
    return `user_${userId}_${timestamp}_${random}`;
  }

  return `session_${timestamp}_${random}`;
}

/**
 * Get or create a persistent session ID from localStorage
 */
export function getOrCreateSessionId(): string {
  const STORAGE_KEY = "bsc_agent_session_id";

  // Check if we have an existing session ID
  let sessionId = localStorage.getItem(STORAGE_KEY);

  if (!sessionId) {
    // Generate a new session ID
    sessionId = generateSessionId();
    localStorage.setItem(STORAGE_KEY, sessionId);
  }

  return sessionId;
}

/**
 * Clear the current session ID and create a new one
 */
export function resetSessionId(): string {
  const STORAGE_KEY = "bsc_agent_session_id";
  localStorage.removeItem(STORAGE_KEY);
  return getOrCreateSessionId();
}
