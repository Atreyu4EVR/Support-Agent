import os
import sys
import json
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv
from openai import AsyncAzureOpenAI
from agents import (
    set_default_openai_client,
    Agent,
    OpenAIChatCompletionsModel,
    set_tracing_disabled,
    function_tool,
    Runner,
)

# Add current directory to path to import prompt.py and memory
sys.path.append(os.path.dirname(__file__))
from prompt import system_message
from memory import get_memory_manager

# Disable tracing for Azure OpenAI (avoids API key conflicts)
set_tracing_disabled(True)

# Load environment variables from .env file
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

print("--BSC Support Agent initialized--")

# Create Azure OpenAI client (without default deployment to allow per-operation deployment specification)
azure_client = AsyncAzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY") or "",
    api_version=os.getenv("AZURE_OPENAI_API_VERSION") or "",
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT") or "",
)

# Set as default client for the Agents SDK
set_default_openai_client(azure_client)


# Initialize portals and resources lookup function
@function_tool
async def lookup_portals_and_resources(
    query: str = "", category: str = ""
) -> List[Dict[str, Any]]:
    """
    Look up BYU-Idaho portals, URLs, and digital resources to help students access
    university services, academic tools, and information systems.

    Args:
        query: Optional search term to filter portals by name, purpose, or keywords
        category: Optional category filter (academic, student_services, communication, 
                 directories, campus_services, religious_services, employee_services, 
                 admissions, general)

    Returns:
        List of relevant portals with their URLs, descriptions, and key features
    """
    try:
        # Load portals data from JSON file
        portals_file_path = os.path.join(
            os.path.dirname(__file__), "tools", "portals.json"
        )
        
        with open(portals_file_path, "r", encoding="utf-8") as f:
            portals_data = json.load(f)
        
        # Extract all portals from all categories
        all_portals = []
        categories = portals_data.get("portals", {}).get("categories", {})
        
        for cat_name, cat_data in categories.items():
            if category and cat_name != category:
                continue  # Skip if specific category is requested and this isn't it
                
            portals_list = cat_data.get("portals", [])
            for portal in portals_list:
                # Add category info to each portal
                portal_with_category = portal.copy()
                portal_with_category["category_name"] = cat_name
                portal_with_category["category_description"] = cat_data.get("description", "")
                all_portals.append(portal_with_category)
        
        # Filter portals based on query if provided
        if query:
            query_lower = query.lower()
            filtered_portals = []
            
            for portal in all_portals:
                # Check if query matches in various fields
                matches = (
                    query_lower in portal.get("name", "").lower() or
                    query_lower in portal.get("purpose", "").lower() or
                    any(query_lower in keyword.lower() for keyword in portal.get("keywords", [])) or
                    any(query_lower in alias.lower() for alias in portal.get("aliases", []))
                )
                if matches:
                    filtered_portals.append(portal)
            
            all_portals = filtered_portals
        
        # Format results for the agent
        formatted_results = []
        for portal in all_portals:
            result = {
                "name": portal.get("name", ""),
                "url": portal.get("url", ""),
                "purpose": portal.get("purpose", ""),
                "category": portal.get("category_name", ""),
                "users": portal.get("users", []),
                "keywords": portal.get("keywords", []),
                "aliases": portal.get("aliases", []),
                "key_features": portal.get("key_features", [])
            }
            formatted_results.append(result)
        
        # If no portals found, return helpful message
        if not formatted_results:
            return [{
                "name": "No portals found",
                "url": "https://www.byui.edu",
                "purpose": f"No portals match your search criteria. Visit the main BYU-Idaho website for general information.",
                "category": "general",
                "users": ["anyone"],
                "keywords": [],
                "aliases": [],
                "key_features": ["Access general university information", "Find department contacts"]
            }]
        
        return formatted_results

    except Exception as e:
        print(f"❌ Error loading portals data: {e}")
        return [{
            "name": "Error accessing portals",
            "url": "https://www.byui.edu/contact-us",
            "purpose": "Error loading portal information. Please contact BYU-Idaho Support Center for assistance.",
            "category": "general",
            "users": ["anyone"],
            "keywords": [],
            "aliases": [],
            "key_features": ["Contact support for assistance"]
        }]


# Initialize Pinecone knowledge base search function
@function_tool
async def search_knowledge_base(
    query: str, top_k: int = 10, namespace: str = ""
) -> List[Dict[str, Any]]:
    """
    Search the BYU-Idaho knowledge base for information about policies, procedures,
    financial aid, admissions, and other support topics.

    Args:
        query: The search query for the knowledge base
        top_k: Number of results to return (default: 10)
        namespace: Pinecone namespace to search (default: "")

    Returns:
        List of relevant documents with their content and metadata
        Schema: chunk_text, document_title, document_id, document_type, category, 
                chunk_id, total_chunks, extracted_urls, has_urls, content_length
    """
    try:
        # Check if Pinecone environment variables are available
        pinecone_api_key = os.getenv("PINECONE_API_KEY")
        pinecone_index_name = os.getenv("PINECONE_INDEX_NAME", "bsc-supportagent-v1")

        if not pinecone_api_key:
            return [
                {
                    "content": "Knowledge base is not currently available (Pinecone not configured).",
                    "source": "system",
                    "score": 0.0,
                    "metadata": {
                        "error": "Missing PINECONE_API_KEY",
                        "suggestion": "For information, visit: https://www.byui.edu or contact BYU-Idaho Support Center",
                    },
                }
            ]

        # Import Pinecone client
        from pinecone import Pinecone

        # Initialize Pinecone
        pc = Pinecone(api_key=pinecone_api_key)
        index = pc.Index(pinecone_index_name)

        # Create embedding for the query using Azure OpenAI
        embeddings_deployment = os.getenv(
            "AZURE_OPENAI_EMBEDDINGS_DEPLOYMENT", "text-embedding-3-large"
        )
        embedding_response = await azure_client.embeddings.create(
            model=embeddings_deployment,  # Your Azure embedding deployment name
            input=query,
        )

        query_embedding = embedding_response.data[0].embedding

        # Search Pinecone index
        search_results = index.query(
            vector=query_embedding,
            top_k=top_k,
            namespace=namespace,
            include_metadata=True,
        )

        # Format results
        formatted_results = []
        for match in search_results.matches:  # type: ignore
            # Get chunk content for content_length calculation
            chunk_content = match.metadata.get("chunk_text", "No content available")
            
            result = {
                "content": chunk_content,
                "source": match.metadata.get(
                    "document_title", "BYU-Idaho Knowledge Base"
                ),
                "score": float(match.score),
                "metadata": {
                    "chunk_text": chunk_content,                                    # Main text content
                    "document_title": match.metadata.get("document_title", ""),     # Document title
                    "document_type": match.metadata.get("document_type", "knowledge_article"),  # Type of document
                    "category": match.metadata.get("category", "Unknown Category"), # Document category
                    "extracted_urls": match.metadata.get("extracted_urls", []),    # URLs to show to end-user
                },
            }
            formatted_results.append(result)

        if not formatted_results:
            return [
                {
                    "content": f"No relevant information found for '{query}'. Please try rephrasing your question or contact BYU-Idaho Support Center directly.",
                    "source": "system",
                    "score": 0.0,
                    "metadata": {
                        "suggestion": "Visit https://www.byui.edu for more information"
                    },
                }
            ]

        return formatted_results

    except Exception as e:
        print(f"❌ Error searching knowledge base: {e}")
        return [
            {
                "content": f"Error accessing knowledge base. Please contact BYU-Idaho Support Center for assistance.",
                "source": "system",
                "score": 0.0,
                "metadata": {"error": str(e), "contact": "BYU-Idaho Support Center"},
            }
        ]


def build_conversation_context(conversation_history: List[Dict[str, Any]]) -> str:
    """Build conversation context string from history"""
    if not conversation_history:
        return ""

    context_lines = ["## Previous Conversation Context\n"]

    for msg in conversation_history:
        role = msg.get("role", "unknown")
        content = msg.get("content", "")
        timestamp = msg.get("timestamp", 0)

        if role == "user":
            context_lines.append(f"**Student Question:** {content}")
        elif role == "assistant":
            context_lines.append(f"**Your Previous Response:** {content}")

    context_lines.append("\n---\n")
    context_lines.append(
        "**Important:** Use this conversation history to provide contextual, personalized responses. Reference previous questions and maintain conversation continuity.\n"
    )

    return "\n".join(context_lines)


def create_agent_with_context(
    conversation_history: Optional[List[Dict[str, Any]]] = None,
) -> Agent:
    """Create agent with optional conversation context"""
    instructions = system_message

    if conversation_history:
        context = build_conversation_context(conversation_history)
        instructions = f"{system_message}\n\n{context}"

    return Agent(
        name="BSC Support Agent",
        instructions=instructions,
        model=OpenAIChatCompletionsModel(
            model=os.getenv(
                "AZURE_OPENAI_DEPLOYMENT", "gpt-4.1"
            ),  # Your Azure deployment name
            openai_client=azure_client,
        ),
        tools=[search_knowledge_base, lookup_portals_and_resources],  # Pass the decorated functions directly
    )


# Create default agent (without context)
agent = create_agent_with_context()


# Streaming function for API integration with session support
async def stream_message_for_api(message: str, session_id: Optional[str] = None):
    """Stream BSC Support Agent response for API integration with conversation memory support"""
    from openai.types.responses import ResponseTextDeltaEvent

    memory_manager = get_memory_manager()
    conversation_history = []

    # Get conversation context if session_id is provided
    if session_id:
        # Add user message to memory
        memory_manager.add_user_message(session_id, message)

        # Get conversation history (excluding the current message)
        conversation_history = memory_manager.get_conversation_context(
            session_id, max_messages=8
        )
        # Remove the last message (current user message) from context to avoid duplication
        if conversation_history and conversation_history[-1].get("content") == message:
            conversation_history = conversation_history[:-1]

    # Create agent with conversation context
    contextual_agent = create_agent_with_context(conversation_history)

    # Create a runner with the contextual agent
    result = Runner.run_streamed(contextual_agent, message)

    # Store the response for memory
    response_chunks = []

    async for event in result.stream_events():
        if event.type == "raw_response_event":
            # Real-time token streaming
            if isinstance(event.data, ResponseTextDeltaEvent) and event.data.delta:
                content = event.data.delta
                response_chunks.append(content)
                yield {"type": "chunk", "content": content}
        elif event.type == "run_item_stream_event":
            # Higher-level events (tool calls, completions)
            if event.item.type == "tool_call_item":
                tool_name = getattr(event.item, "name", "knowledge_base_search")
                if tool_name == "lookup_portals_and_resources":
                    message = "Looking up BYU-Idaho portals and resources...\n\n"
                else:
                    message = "Searching BYU-Idaho knowledge base...\n\n"
                yield {
                    "type": "tool_start",
                    "tool": tool_name,
                    "message": message,
                }
            elif event.item.type == "message_output_item":
                yield {"type": "complete", "final_output": "Response complete"}
        elif event.type == "function_call_event":
            # Function tool execution events
            function_name = getattr(event, "function_name", "search_knowledge_base")
            if function_name == "lookup_portals_and_resources":
                message = "Looking up portal information..."
            else:
                message = "Retrieving information from knowledge base..."
            yield {
                "type": "function_call",
                "function": function_name,
                "message": message,
            }

    # Save assistant response to memory
    if session_id and response_chunks:
        full_response = "".join(response_chunks)
        memory_manager.add_assistant_message(session_id, full_response)


# Legacy function for backward compatibility
async def stream_message_for_api_legacy(message: str):
    """Legacy streaming function without session support (for backward compatibility)"""
    async for chunk in stream_message_for_api(message, session_id=None):
        yield chunk


async def interactive_chat():
    """Interactive chat loop for testing the BSC Support Agent with session memory"""
    print("=" * 60)
    print("🤖 BSC Support Agent - Interactive Chat with Memory")
    print("=" * 60)

    # Create a test session ID
    import uuid

    session_id = f"test_session_{uuid.uuid4().hex[:8]}"
    print(f"📋 Session ID: {session_id}")
    print("💡 This session will remember our conversation context!")
    print("📝 Type 'memory' to see conversation history")
    print("🔄 Type 'reset' to clear conversation memory")
    print("❌ Type 'exit', 'quit', 'bye', or 'q' to quit")

    while True:
        try:
            # Get user input
            user_input = input("\nYou: ").strip()

            # Check for special commands
            if user_input.lower() in ["exit", "quit", "bye", "q"]:
                memory_manager = get_memory_manager()
                session_summary = memory_manager.get_session_summary(session_id)
                print(f"\n📊 Session Summary: {session_summary}")
                print(
                    "\n👋 Thanks for using the BYU-Idaho Support Agent! Have a great day!"
                )
                break

            if user_input.lower() == "memory":
                memory_manager = get_memory_manager()
                history = memory_manager.get_conversation_context(session_id)
                if history:
                    print(f"\n📚 Conversation History ({len(history)} messages):")
                    for i, msg in enumerate(history, 1):
                        role = msg["role"].title()
                        content = (
                            msg["content"][:100] + "..."
                            if len(msg["content"]) > 100
                            else msg["content"]
                        )
                        print(f"  {i}. {role}: {content}")
                else:
                    print("\n📚 No conversation history yet.")
                continue

            if user_input.lower() == "reset":
                memory_manager = get_memory_manager()
                cleared = memory_manager.clear_session(session_id)
                if cleared:
                    print("\n🔄 Conversation memory cleared!")
                else:
                    print("\n🔄 No memory to clear.")
                continue

            if not user_input:
                print("Please enter a question or type 'exit' to quit.")
                continue

            # Stream the response with session support
            print("\nSupport Agent: ", end="", flush=True)
            response_text = ""

            async for chunk in stream_message_for_api(user_input, session_id):
                if chunk["type"] == "chunk":
                    print(chunk["content"], end="", flush=True)
                    response_text += chunk["content"]
                elif chunk["type"] == "tool_start":
                    # Tool start event - no need to print, just continue streaming
                    pass
                elif chunk["type"] == "function_call":
                    # Function call event - no need to print, just continue streaming
                    pass
                elif chunk["type"] == "complete":
                    print()  # New line after response

            print()  # Extra line for spacing

        except KeyboardInterrupt:
            print(
                "\n\n👋 Chat interrupted. Thanks for using the BYU-Idaho Support Agent!"
            )
            break
        except Exception as e:
            print(f"\n❌ Error: {e}")
            print("Please try again or type 'exit' to quit.")


if __name__ == "__main__":
    import asyncio

    print("Initializing BSC Support Agent...")
    asyncio.run(interactive_chat())
