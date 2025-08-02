#!/usr/bin/env python3
"""
Test script for BSC Agent conversation memory functionality
Demonstrates session-based persistent memory across multiple messages.
"""

import asyncio
import sys
import os

# Add current directory to path to import our local modules
current_dir = os.path.dirname(__file__)
sys.path.insert(0, current_dir)

from bsc_agents.memory import get_memory_manager, ConversationMemoryManager
from bsc_agents.agent import stream_message_for_api


async def test_memory_functionality():
    """Test the conversation memory functionality"""
    print("🧪 Testing BSC Agent Conversation Memory")
    print("=" * 50)

    # Get memory manager
    memory_manager = get_memory_manager()

    # Test session 1
    session_id_1 = "test_session_001"
    print(f"\n📋 Testing Session: {session_id_1}")

    # Simulate conversation
    messages = [
        "Hi, I'm John and I need help with financial aid.",
        "What documents do I need for FAFSA?",
        "When is the deadline for next year?",
    ]

    print("\n🤖 Simulating conversation with memory...")
    for i, message in enumerate(messages, 1):
        print(f"\n💬 Message {i}: {message}")
        print("🤖 Agent Response: ", end="", flush=True)

        response_chunks = []
        async for chunk in stream_message_for_api(message, session_id_1):
            if chunk["type"] == "chunk":
                print(chunk["content"], end="", flush=True)
                response_chunks.append(chunk["content"])

        print()  # New line after response

        # Show memory context after each message
        history = memory_manager.get_conversation_context(session_id_1)
        print(f"📚 Memory: {len(history)} messages in conversation")

    # Show full conversation history
    print(f"\n📖 Full Conversation History for {session_id_1}:")
    history = memory_manager.get_conversation_context(session_id_1)
    for i, msg in enumerate(history, 1):
        role = msg["role"].title()
        content = (
            msg["content"][:100] + "..."
            if len(msg["content"]) > 100
            else msg["content"]
        )
        print(f"  {i}. {role}: {content}")

    # Test session statistics
    print(f"\n📊 Memory Statistics:")
    stats = memory_manager.get_session_stats()
    for key, value in stats.items():
        print(f"  {key}: {value}")

    # Test second session to show isolation
    print(f"\n📋 Testing Second Session (isolation test):")
    session_id_2 = "test_session_002"

    print(f"💬 New session message: 'Hello, I'm a different student'")
    print("🤖 Agent Response: ", end="", flush=True)

    async for chunk in stream_message_for_api(
        "Hello, I'm a different student", session_id_2
    ):
        if chunk["type"] == "chunk":
            print(chunk["content"], end="", flush=True)

    print()

    # Show both sessions exist separately
    history_1 = memory_manager.get_conversation_context(session_id_1)
    history_2 = memory_manager.get_conversation_context(session_id_2)
    print(f"\n🔍 Session Isolation Test:")
    print(f"  Session 1 messages: {len(history_1)}")
    print(f"  Session 2 messages: {len(history_2)}")

    # Test memory cleanup
    print(f"\n🧹 Testing Memory Cleanup:")
    active_sessions = memory_manager.get_active_sessions_count()
    print(f"  Active sessions before cleanup: {active_sessions}")

    cleaned = memory_manager.cleanup_expired_sessions()
    print(f"  Expired sessions cleaned: {cleaned}")

    active_sessions = memory_manager.get_active_sessions_count()
    print(f"  Active sessions after cleanup: {active_sessions}")

    # Test session clearing
    print(f"\n🗑️  Testing Session Clearing:")
    cleared = memory_manager.clear_session(session_id_2)
    print(f"  Session {session_id_2} cleared: {cleared}")

    active_sessions = memory_manager.get_active_sessions_count()
    print(f"  Active sessions after clearing: {active_sessions}")

    print(f"\n✅ Memory functionality test complete!")


async def test_memory_without_agent():
    """Test memory manager functionality without the agent"""
    print("\n🧪 Testing Memory Manager (Unit Test)")
    print("=" * 50)

    # Create a separate memory manager for testing
    test_memory = ConversationMemoryManager(max_sessions=5, session_timeout_hours=0.1)

    # Test basic operations
    session_id = "unit_test_session"

    # Add messages
    session = test_memory.add_user_message(session_id, "Hello, how are you?")
    test_memory.add_assistant_message(
        session_id, "Hi there! I'm doing well, thanks for asking."
    )
    test_memory.add_user_message(session_id, "Can you help me with something?")
    test_memory.add_assistant_message(
        session_id, "Of course! What do you need help with?"
    )

    # Test conversation history
    history = test_memory.get_conversation_context(session_id)
    print(f"📚 Conversation history: {len(history)} messages")

    for msg in history:
        role = msg["role"].title()
        content = msg["content"]
        print(f"  {role}: {content}")

    # Test session summary
    summary = test_memory.get_session_summary(session_id)
    print(f"\n📋 Session summary: {summary}")

    # Test statistics
    stats = test_memory.get_session_stats()
    print(f"\n📊 Memory statistics:")
    for key, value in stats.items():
        print(f"  {key}: {value}")

    print(f"\n✅ Memory manager unit test complete!")


if __name__ == "__main__":
    print("🚀 BSC Agent Memory Test Suite")
    print("Demonstrates conversation memory and context preservation")
    print("=" * 60)

    try:
        # Test memory manager without agent first
        asyncio.run(test_memory_without_agent())

        # Test full integration with agent
        asyncio.run(test_memory_functionality())

    except KeyboardInterrupt:
        print("\n\n👋 Test interrupted by user")
    except Exception as e:
        print(f"\n❌ Test error: {e}")
        import traceback

        traceback.print_exc()
