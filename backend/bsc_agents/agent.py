import os
import sys
import json
from typing import Dict, List, Any
from dotenv import load_dotenv
from openai import AsyncAzureOpenAI
from agents import (
    set_default_openai_client,
    Agent,
    OpenAIChatCompletionsModel,
    set_tracing_disabled,
    function_tool,
)

# Add current directory to path to import prompt.py
sys.path.append(os.path.dirname(__file__))
from prompt import system_message

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
        Schema: pageContent, title, chunk_index, source, timestamp
    """
    try:
        # Check if Pinecone environment variables are available
        pinecone_api_key = os.getenv("PINECONE_API_KEY")
        pinecone_index_name = os.getenv("PINECONE_INDEX_NAME", "bsc-knowledge-v3")

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
            result = {
                "content": match.metadata.get("pageContent", "No content available"),
                "source": match.metadata.get("title", "BYU-Idaho Knowledge Base"),
                "score": float(match.score),
                "metadata": {
                    "id": match.id,
                    "title": match.metadata.get("title", ""),
                    "chunk_index": match.metadata.get("chunk_index", ""),
                    "source_id": match.metadata.get("source", ""),
                    "timestamp": match.metadata.get("timestamp", ""),
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
                        "suggestion": "Visit https://byui.edu for more information"
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


# Create agent using Azure OpenAI with tools
agent = Agent(
    name="BSC Support Agent",
    instructions=system_message,
    model=OpenAIChatCompletionsModel(
        model=os.getenv(
            "AZURE_OPENAI_DEPLOYMENT", "gpt-4.1"
        ),  # Your Azure deployment name
        openai_client=azure_client,
    ),
    tools=[search_knowledge_base],  # Pass the decorated function directly
)


# Streaming function for API integration
async def stream_message_for_api(message: str):
    """Stream BSC Support Agent response for API integration with knowledge base tool support"""
    from agents import Runner
    from openai.types.responses import ResponseTextDeltaEvent

    # Create a runner with the agent
    result = Runner.run_streamed(agent, message)

    async for event in result.stream_events():
        if event.type == "raw_response_event":
            # Real-time token streaming
            if isinstance(event.data, ResponseTextDeltaEvent) and event.data.delta:
                yield {"type": "chunk", "content": event.data.delta}
        elif event.type == "run_item_stream_event":
            # Higher-level events (tool calls, completions)
            if event.item.type == "tool_call_item":
                tool_name = getattr(event.item, "name", "knowledge_base_search")
                yield {
                    "type": "tool_start",
                    "tool": tool_name,
                    "message": f"Searching BYU-Idaho knowledge base...\n\n",
                }
            elif event.item.type == "message_output_item":
                yield {"type": "complete", "final_output": "Response complete"}
        elif event.type == "function_call_event":
            # Function tool execution events
            yield {
                "type": "function_call",
                "function": "search_knowledge_base",
                "message": "📚 Retrieving information from knowledge base...",
            }


async def interactive_chat():
    """Interactive chat loop for testing the BSC Support Agent"""
    print("=" * 60)

    while True:
        try:
            # Get user input
            user_input = input("\nYou: ").strip()

            # Check for exit commands
            if user_input.lower() in ["exit", "quit", "bye", "q"]:
                print(
                    "\n👋 Thanks for using the BYU-Idaho Support Agent! Have a great day!"
                )
                break

            if not user_input:
                print("Please enter a question or type 'exit' to quit.")
                continue

            # Stream the response
            print("\nSupport Agent: ", end="", flush=True)
            response_text = ""

            async for chunk in stream_message_for_api(user_input):
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
