"""
Session-based memory management for BSC Support Agent
Provides conversation context and short-term memory for multi-turn conversations.
"""

import asyncio
import time
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from datetime import datetime, timedelta


@dataclass
class ConversationMessage:
    """Represents a single message in a conversation"""

    role: str  # 'user' or 'assistant'
    content: str
    timestamp: float = field(default_factory=time.time)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for agent consumption"""
        return {
            "role": self.role,
            "content": self.content,
            "timestamp": self.timestamp,
            "metadata": self.metadata,
        }


@dataclass
class ConversationSession:
    """Represents a conversation session with memory"""

    session_id: str
    messages: List[ConversationMessage] = field(default_factory=list)
    created_at: float = field(default_factory=time.time)
    last_activity: float = field(default_factory=time.time)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def add_message(
        self, role: str, content: str, metadata: Optional[Dict[str, Any]] = None
    ) -> None:
        """Add a message to the conversation"""
        message = ConversationMessage(
            role=role, content=content, metadata=metadata or {}
        )
        self.messages.append(message)
        self.last_activity = time.time()

    def get_conversation_history(
        self, max_messages: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Get conversation history in agent-friendly format"""
        messages = self.messages
        if max_messages:
            messages = messages[-max_messages:]

        return [msg.to_dict() for msg in messages]

    def get_context_summary(self) -> str:
        """Get a summary of the conversation context"""
        if not self.messages:
            return "No previous conversation history."

        total_messages = len(self.messages)
        user_messages = [msg for msg in self.messages if msg.role == "user"]
        assistant_messages = [msg for msg in self.messages if msg.role == "assistant"]

        duration = time.time() - self.created_at
        duration_str = (
            f"{int(duration // 60)}m {int(duration % 60)}s"
            if duration > 60
            else f"{int(duration)}s"
        )

        return f"Conversation context: {total_messages} total messages ({len(user_messages)} from user, {len(assistant_messages)} responses), session duration: {duration_str}"

    def is_expired(self, max_age_hours: float = 2.0) -> bool:
        """Check if session has expired based on last activity"""
        max_age_seconds = max_age_hours * 3600
        return (time.time() - self.last_activity) > max_age_seconds


class ConversationMemoryManager:
    """
    Manages conversation sessions and provides memory functionality for the BSC Support Agent
    """

    def __init__(self, max_sessions: int = 1000, session_timeout_hours: float = 2.0):
        """
        Initialize the memory manager

        Args:
            max_sessions: Maximum number of sessions to keep in memory
            session_timeout_hours: Hours after which inactive sessions expire
        """
        self.sessions: Dict[str, ConversationSession] = {}
        self.max_sessions = max_sessions
        self.session_timeout_hours = session_timeout_hours
        self._cleanup_task: Optional[asyncio.Task] = None

        # Start cleanup task
        self._start_cleanup_task()

    def _start_cleanup_task(self) -> None:
        """Start the periodic cleanup task"""

        async def cleanup_loop():
            while True:
                await asyncio.sleep(300)  # Cleanup every 5 minutes
                self.cleanup_expired_sessions()

        try:
            loop = asyncio.get_event_loop()
            self._cleanup_task = loop.create_task(cleanup_loop())
        except RuntimeError:
            # No event loop running yet, cleanup will be manual
            pass

    def get_or_create_session(self, session_id: str) -> ConversationSession:
        """Get existing session or create a new one"""
        if session_id not in self.sessions:
            self.sessions[session_id] = ConversationSession(session_id=session_id)

            # Cleanup if we have too many sessions
            if len(self.sessions) > self.max_sessions:
                self.cleanup_expired_sessions()

                # If still too many, remove oldest sessions
                if len(self.sessions) > self.max_sessions:
                    oldest_sessions = sorted(
                        self.sessions.items(), key=lambda x: x[1].last_activity
                    )
                    sessions_to_remove = oldest_sessions[
                        : len(self.sessions) - self.max_sessions + 1
                    ]
                    for session_id_to_remove, _ in sessions_to_remove:
                        del self.sessions[session_id_to_remove]

        return self.sessions[session_id]

    def add_user_message(self, session_id: str, message: str) -> ConversationSession:
        """Add a user message to the conversation"""
        session = self.get_or_create_session(session_id)
        session.add_message("user", message)
        return session

    def add_assistant_message(
        self, session_id: str, message: str, metadata: Optional[Dict[str, Any]] = None
    ) -> ConversationSession:
        """Add an assistant message to the conversation"""
        session = self.get_or_create_session(session_id)
        session.add_message("assistant", message, metadata)
        return session

    def get_conversation_context(
        self, session_id: str, max_messages: Optional[int] = 10
    ) -> List[Dict[str, Any]]:
        """Get conversation context for the agent"""
        if session_id not in self.sessions:
            return []

        session = self.sessions[session_id]
        return session.get_conversation_history(max_messages)

    def get_session_summary(self, session_id: str) -> str:
        """Get a summary of the session"""
        if session_id not in self.sessions:
            return "No conversation history found."

        return self.sessions[session_id].get_context_summary()

    def clear_session(self, session_id: str) -> bool:
        """Clear a specific session"""
        if session_id in self.sessions:
            del self.sessions[session_id]
            return True
        return False

    def cleanup_expired_sessions(self) -> int:
        """Remove expired sessions and return count of removed sessions"""
        expired_sessions = [
            session_id
            for session_id, session in self.sessions.items()
            if session.is_expired(self.session_timeout_hours)
        ]

        for session_id in expired_sessions:
            del self.sessions[session_id]

        return len(expired_sessions)

    def get_active_sessions_count(self) -> int:
        """Get count of active sessions"""
        return len(self.sessions)

    def get_session_stats(self) -> Dict[str, Any]:
        """Get statistics about memory usage"""
        total_sessions = len(self.sessions)
        total_messages = sum(
            len(session.messages) for session in self.sessions.values()
        )

        if self.sessions:
            avg_messages = total_messages / total_sessions
            oldest_session = min(self.sessions.values(), key=lambda s: s.created_at)
            newest_session = max(self.sessions.values(), key=lambda s: s.created_at)
            oldest_age = time.time() - oldest_session.created_at
            newest_age = time.time() - newest_session.created_at
        else:
            avg_messages = 0
            oldest_age = 0
            newest_age = 0

        return {
            "total_sessions": total_sessions,
            "total_messages": total_messages,
            "average_messages_per_session": round(avg_messages, 1),
            "oldest_session_age_seconds": round(oldest_age, 1),
            "newest_session_age_seconds": round(newest_age, 1),
            "max_sessions": self.max_sessions,
            "session_timeout_hours": self.session_timeout_hours,
        }


# Global memory manager instance
memory_manager = ConversationMemoryManager()


def get_memory_manager() -> ConversationMemoryManager:
    """Get the global memory manager instance"""
    return memory_manager
