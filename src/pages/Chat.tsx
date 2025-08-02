import React, { useState, useRef, useEffect } from "react";
import { Bot, User, Trash2, RotateCcw, MessageSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { 
  sendMessageStream, 
  getOrCreateSessionId, 
  resetSessionId, 
  clearSessionMemory,
  getSessionHistory,
  type SessionHistory 
} from "../services/chatService";

interface Message {
  id: number;
  sender: "user" | "bot";
  text: string;
  isStreaming?: boolean;
}

const initialMessages: Message[] = [
  {
    id: 1,
    sender: "bot",
    text: "Hi! I'm the BYUI Support Agent. How can I help you today?",
  },
];

// Helper function to process markdown text from n8n
const processMarkdownText = (text: string): string => {
  return text
    .replace(/\\n/g, "\n") // Convert literal \n to actual newlines
    .replace(/\\t/g, "\t") // Convert literal \t to actual tabs
    .trim(); // Remove any leading/trailing whitespace
};

// Custom markdown components for better chat formatting
const chatMarkdownComponents = {
  // Custom paragraph styling
  p: ({ children }: React.ComponentPropsWithoutRef<"p">) => (
    <p className="mb-2 last:mb-0">{children}</p>
  ),

  // Custom heading styling
  h1: ({ children }: React.ComponentPropsWithoutRef<"h1">) => (
    <h1 className="text-sm font-bold text-primary-600 dark:text-primary-400 mb-2 mt-3 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }: React.ComponentPropsWithoutRef<"h2">) => (
    <h2 className="text-sm font-bold text-primary-600 dark:text-primary-400 mb-2 mt-3 first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }: React.ComponentPropsWithoutRef<"h3">) => (
    <h3 className="text-sm font-bold text-primary-600 dark:text-primary-400 mb-2 mt-3 first:mt-0">
      {children}
    </h3>
  ),

  // Custom strong/bold styling
  strong: ({ children }: React.ComponentPropsWithoutRef<"strong">) => (
    <span className="font-semibold text-gray-800 dark:text-gray-200">
      {children}
    </span>
  ),

  // Custom list styling
  ul: ({ children }: React.ComponentPropsWithoutRef<"ul">) => (
    <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>
  ),
  ol: ({ children }: React.ComponentPropsWithoutRef<"ol">) => (
    <ol className="list-decimal ml-4 mb-2 space-y-1">{children}</ol>
  ),
  li: ({ children }: React.ComponentPropsWithoutRef<"li">) => (
    <li className="text-sm">{children}</li>
  ),

  // Custom link styling
  a: ({ href, children, ...props }: React.ComponentPropsWithoutRef<"a">) => (
    <a
      href={href}
      className="text-primary-500 hover:text-primary-600 underline"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),

  // Custom code styling
  code: ({ children }: React.ComponentPropsWithoutRef<"code">) => (
    <code className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-1 py-0.5 rounded text-sm font-mono">
      {children}
    </code>
  ),

  // Custom blockquote styling
  blockquote: ({ children }: React.ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote className="border-l-2 border-primary-300 dark:border-primary-600 pl-3 py-1 italic text-gray-600 dark:text-gray-400">
      {children}
    </blockquote>
  ),
};

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState(() => getOrCreateSessionId());
  const [showMemoryStatus, setShowMemoryStatus] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<SessionHistory | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Scroll to bottom on new message
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Cleanup EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Load session history on mount
  useEffect(() => {
    const loadSessionHistory = async () => {
      try {
        const history = await getSessionHistory(sessionId, 20);
        setSessionHistory(history);
      } catch (error) {
        console.error("Failed to load session history:", error);
      }
    };
    
    loadSessionHistory();
  }, [sessionId]);

  // Memory management functions
  const handleClearConversation = async () => {
    if (window.confirm("Are you sure you want to clear this conversation? This action cannot be undone.")) {
      try {
        await clearSessionMemory(sessionId);
        setMessages(initialMessages);
        setSessionHistory(null);
        setError(null);
      } catch (error) {
        setError("Failed to clear conversation memory");
      }
    }
  };

  const handleNewConversation = () => {
    if (window.confirm("Start a new conversation? Current conversation will be saved but you'll get a fresh session.")) {
      const newSessionId = resetSessionId();
      setSessionId(newSessionId);
      setMessages(initialMessages);
      setSessionHistory(null);
      setError(null);
    }
  };

  const handleToggleMemoryStatus = async () => {
    if (!showMemoryStatus) {
      try {
        const history = await getSessionHistory(sessionId, 20);
        setSessionHistory(history);
      } catch (error) {
        console.error("Failed to load session history:", error);
      }
    }
    setShowMemoryStatus(!showMemoryStatus);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // Close any existing EventSource
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const userMsg: Message = {
      id: Date.now(),
      sender: "user",
      text: input,
    };

    // Create initial bot message for streaming
    const botMsgId = Date.now() + 1;
    const initialBotMsg: Message = {
      id: botMsgId,
      sender: "bot",
      text: "",
      isStreaming: true,
    };

    setMessages((msgs) => [...msgs, userMsg, initialBotMsg]);
    setInput("");
    setLoading(true);
    setError(null);

    // Start streaming
    eventSourceRef.current = sendMessageStream(
      userMsg.text,
      // onChunk - append content to the streaming message
      (content: string) => {
        // Filter out tool activity messages
        const isToolActivity =
          content.includes("🛠️ Using") ||
          content.includes("📚 Found information in") ||
          content.includes("🌐 Searched the web") ||
          content.includes("🧮 Calculated:") ||
          content.includes("🔍 Searching") ||
          content.includes("⚠️ Note: No tools were used");

        // Only add content that is NOT tool activity
        if (!isToolActivity && content.trim()) {
          setMessages((msgs) =>
            msgs.map((msg) =>
              msg.id === botMsgId ? { ...msg, text: msg.text + content } : msg
            )
          );
        }
      },
      // onComplete - mark message as complete
      () => {
        setMessages((msgs) =>
          msgs.map((msg) =>
            msg.id === botMsgId
              ? {
                  ...msg,
                  isStreaming: false,
                  text: processMarkdownText(msg.text),
                }
              : msg
          )
        );
        setLoading(false);
        eventSourceRef.current = null;
      },
      // onError - handle errors
      (error: string) => {
        setError(error);
        setLoading(false);
        // Remove the streaming message on error
        setMessages((msgs) => msgs.filter((msg) => msg.id !== botMsgId));
        eventSourceRef.current = null;
      },
      sessionId
    );
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-900">
      {/* Memory Status Header */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Memory Active
              </span>
            </div>
            {sessionHistory && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {sessionHistory.message_count} messages remembered
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleMemoryStatus}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
              title="View conversation history"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <button
              onClick={handleNewConversation}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
              title="Start new conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleClearConversation}
              className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Clear conversation memory"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Memory Status Panel */}
        {showMemoryStatus && sessionHistory && (
          <div className="border-t border-gray-200 dark:border-zinc-700 p-4 bg-gray-50 dark:bg-zinc-900">
            <div className="max-w-2xl">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Conversation History
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                {sessionHistory.summary}
              </p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {sessionHistory.history.slice(-5).map((msg, index) => (
                  <div key={index} className="text-xs">
                    <span className={`font-medium ${
                      msg.role === 'user' 
                        ? 'text-primary-600 dark:text-primary-400' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {msg.role === 'user' ? 'You' : 'Agent'}:
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 ml-2">
                      {msg.content.length > 100 ? `${msg.content.slice(0, 100)}...` : msg.content}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Messages Area - Takes up remaining space and scrolls */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-8 space-y-4 bg-gray-50 dark:bg-zinc-900"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.sender === "bot" && (
              <div className="flex items-end gap-2">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900">
                  <Bot
                    className={`w-5 h-5 text-primary-500 ${
                      msg.isStreaming ? "animate-pulse" : ""
                    }`}
                  />
                </span>
                <div className="bg-primary-100 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-bl-none px-4 py-2 max-w-[40vw] shadow">
                  <div className="chat-message break-words">
                    <ReactMarkdown components={chatMarkdownComponents}>
                      {msg.text}
                    </ReactMarkdown>
                    {msg.isStreaming && (
                      <span className="inline-block w-2 h-4 bg-primary-500 animate-pulse ml-1"></span>
                    )}
                  </div>
                </div>
              </div>
            )}
            {msg.sender === "user" && (
              <div className="flex items-end gap-2 flex-row-reverse">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-700">
                  <User className="w-5 h-5 text-gray-600 dark:text-gray-200" />
                </span>
                <div className="bg-primary-500 text-white rounded-2xl rounded-br-none px-4 py-2 max-w-[40vw] shadow leading-relaxed">
                  {msg.text}
                </div>
              </div>
            )}
          </div>
        ))}

        {error && (
          <div className="text-center text-red-500 dark:text-red-400 mt-2">
            {error}
          </div>
        )}
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="flex-shrink-0 border-t border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 px-6 py-4"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-colors duration-200"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
        <div className="px-6 pb-4 text-xs text-primary-400 bg-yellow-50 dark:bg-zinc-800 rounded text-center mx-auto max-w-md">
          <span className="font-semibold">
            The BYUI Support Agent can make mistakes. Verify information.
          </span>
          <br />
          <span className="text-gray-500 dark:text-gray-400">
            💭 This conversation has memory - the agent remembers our chat history.
          </span>
        </div>
      </div>
    </div>
  );
};

export default Chat;
