import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, RotateCcw, Trash2, MoreVertical } from "lucide-react";
import {
  getOrCreateSessionId,
  resetSessionId,
  clearSessionMemory,
  getSessionHistory,
  type SessionHistory,
} from "../services/chatService";

interface MemoryDropdownProps {
  onSessionChange?: () => void;
  onMemoryCleared?: () => void;
}

export const MemoryDropdown: React.FC<MemoryDropdownProps> = ({
  onSessionChange,
  onMemoryCleared,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<SessionHistory | null>(
    null
  );
  const [sessionId, setSessionId] = useState(() => getOrCreateSessionId());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load session history when needed
  useEffect(() => {
    const loadSessionHistory = async () => {
      try {
        const history = await getSessionHistory(sessionId, 20);
        setSessionHistory(history);
      } catch (error) {
        console.error("Failed to load session history:", error);
      }
    };

    if (showHistoryModal) {
      loadSessionHistory();
    }
  }, [sessionId, showHistoryModal]);

  const handleClearConversation = async () => {
    if (
      window.confirm(
        "Are you sure you want to clear this conversation? This action cannot be undone."
      )
    ) {
      try {
        await clearSessionMemory(sessionId);
        setSessionHistory(null);
        setIsOpen(false);
        onMemoryCleared?.();
      } catch (error) {
        console.error("Failed to clear conversation memory:", error);
      }
    }
  };

  const handleNewConversation = () => {
    if (
      window.confirm(
        "Start a new conversation? Current conversation will be saved but you'll get a fresh session."
      )
    ) {
      const newSessionId = resetSessionId();
      setSessionId(newSessionId);
      setSessionHistory(null);
      setIsOpen(false);
      onSessionChange?.();
    }
  };

  const handleToggleHistory = async () => {
    if (!showHistoryModal) {
      try {
        const history = await getSessionHistory(sessionId, 20);
        setSessionHistory(history);
      } catch (error) {
        console.error("Failed to load session history:", error);
      }
    }
    setShowHistoryModal(!showHistoryModal);
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Three-dot Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors duration-200"
          aria-label="Memory options"
          title="Memory options"
        >
          <MoreVertical className="w-5 h-5 text-gray-900 dark:text-white" />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-lg z-50">
            <div className="py-1">
              <button
                onClick={handleToggleHistory}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                View History
              </button>
              <button
                onClick={handleNewConversation}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                New Conversation
              </button>
              <button
                onClick={handleClearConversation}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear Memory
              </button>
            </div>
          </div>
        )}
      </div>

      {/* History Modal */}
      {showHistoryModal && sessionHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Conversation History
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700"
                aria-label="Close history modal"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {sessionHistory.summary}
              </p>
              <div className="space-y-3">
                {sessionHistory.history.slice(-10).map((msg, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 dark:border-zinc-700 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-sm font-medium ${
                          msg.role === "user"
                            ? "text-primary-600 dark:text-primary-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {msg.role === "user" ? "You" : "Agent"}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {new Date(msg.timestamp || "").toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {msg.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
