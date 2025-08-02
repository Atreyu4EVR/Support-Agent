#!/usr/bin/env node

import dotenv from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
  ToolMessage,
  BaseMessage,
} from "@langchain/core/messages";
import {
  StateGraph,
  END,
  START,
  Annotation,
  messagesStateReducer,
} from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";

// Load environment variables from backend/.env
dotenv.config({ path: join(__dirname, "..", "..", ".env") });

// Load system message from prompt.json
function loadSystemMessage(): string {
  try {
    const promptPath = join(__dirname, "..", "..", "prompt.json");
    console.log("📁 Loading prompt from:", promptPath);
    const promptData = JSON.parse(readFileSync(promptPath, "utf-8"));
    const systemMessage =
      promptData.system_message || "You are a helpful assistant.";
    console.log(
      "📋 System message loaded successfully! Length:",
      systemMessage.length,
      "characters"
    );
    console.log("📋 First 200 chars:", systemMessage.substring(0, 200) + "...");
    return systemMessage;
  } catch (error) {
    console.error("❌ Error loading system message:", error);
    return "You are the BYU-Idaho Support Agent.";
  }
}

const SYSTEM_MESSAGE = loadSystemMessage();

// Use proper JavaScript LangGraph state with Annotation.Root
const GraphState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
    default: () => [],
  }),
});

class BSCAgentWithTools {
  private llm: ChatOpenAI;
  private embeddings: OpenAIEmbeddings;
  private pinecone?: Pinecone;
  private vectorStore?: PineconeStore;
  private app?: any; // LangGraph compiled app
  private tools: DynamicStructuredTool<any, any>[] = [];

  constructor() {
    this.validateEnvironment();
    this.initializeLLM();
    this.initializeEmbeddings();
  }

  private validateEnvironment() {
    const requiredVars = ["AZURE_OPENAI_API_KEY"];

    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        console.error(`❌ ${varName} is required in environment variables`);
        process.exit(1);
      }
    }

    // Optional environment variables with warnings
    if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX_NAME) {
      console.warn(
        "⚠️  PINECONE_API_KEY or PINECONE_INDEX_NAME not found - knowledge base functionality will be disabled"
      );
    }

    if (!process.env.TAVILY_API_KEY) {
      console.warn(
        "⚠️  TAVILY_API_KEY not found - web search functionality will be disabled"
      );
    }
  }

  private initializeLLM() {
    this.llm = new ChatOpenAI({
      azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
      azureOpenAIApiVersion: "2024-12-01-preview",
      azureOpenAIApiInstanceName: "bsc-agents",
      azureOpenAIApiDeploymentName: "gpt-4.1",
      temperature: 0.4,
      maxTokens: 1500,
      streaming: true, // Enable streaming
    });
  }

  private initializeEmbeddings() {
    this.embeddings = new OpenAIEmbeddings({
      azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
      azureOpenAIApiVersion: "2024-12-01-preview",
      azureOpenAIApiInstanceName: "bsc-agents",
      azureOpenAIApiDeploymentName: "text-embedding-3-large",
    });
  }

  async initializePinecone() {
    if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX_NAME) {
      console.warn(
        "⚠️  Pinecone not configured - skipping knowledge base initialization"
      );
      return;
    }

    try {
      // Initialize Pinecone client
      this.pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!,
      });

      // Get the index
      const indexName = process.env.PINECONE_INDEX_NAME!;
      const index = this.pinecone.index(indexName);

      // Create vector store
      this.vectorStore = await PineconeStore.fromExistingIndex(
        this.embeddings,
        {
          pineconeIndex: index as any, // Type assertion as mentioned in implementation guide
          textKey: "text",
          namespace: process.env.PINECONE_NAMESPACE || "bsc-knowledge",
        }
      );

      console.log("✅ Pinecone knowledge base initialized successfully!");
    } catch (error) {
      console.error("❌ Error initializing Pinecone:", error);
      console.warn(
        "⚠️  Continuing without Pinecone - knowledge base tool will use fallback"
      );
      this.vectorStore = undefined;
    }
  }

  createKnowledgeBaseTool() {
    return new DynamicStructuredTool({
      name: "knowledge_base_tool",
      description:
        "MANDATORY FIRST STEP: Search the BYU-Idaho knowledge base for information about policies, procedures, financial aid, admissions, and other support topics. This tool MUST be used for every single user query before providing any answer. No exceptions.",
      schema: z.object({
        query: z.string().describe("The search query for the knowledge base"),
        k: z
          .number()
          .optional()
          .default(5)
          .describe("Number of results to return (default: 5)"),
      }),
      func: async (input: { query: string; k?: number }) => {
        // Input is now always an object
        const query = input.query;
        const k = input.k || 5;
        if (!this.vectorStore) {
          // Fallback response when Pinecone is not available
          return `Knowledge base is not currently available (Pinecone not configured). 

For information about "${query}", I recommend:
1. Visiting the official BYU-Idaho website: https://byui.edu
2. Contacting the BYU-Idaho Support Center directly
3. Using the web search tool for current information

Common BYU-Idaho resources:
- Financial Aid: https://byui.edu/financial-aid
- Admissions: https://byui.edu/admissions  
- Student Records: https://byui.edu/student-records
- Academic Calendar: https://byui.edu/calendar

Please try the web search tool for more specific information.`;
        }

        try {
          console.log(`🔍 Searching knowledge base for: "${query}"`);
          const results = await this.vectorStore.similaritySearch(query, k);

          if (results.length === 0) {
            return "No relevant information found in the knowledge base for this query. Consider using the web search tool for additional information.";
          }

          console.log(`📚 Found ${results.length} results in knowledge base`);

          // Format results with source information
          const formattedResults = results
            .map((doc, index) => {
              const metadata = doc.metadata || {};
              const source = metadata.source || "Unknown source";
              const url = metadata.url || "";

              return `Result ${index + 1}:
Content: ${doc.pageContent}
Source: ${source}${url ? `\nURL: ${url}` : ""}
---`;
            })
            .join("\n\n");

          return `Found ${results.length} relevant results from the knowledge base:\n\n${formattedResults}`;
        } catch (error) {
          console.error("Error searching knowledge base:", error);
          return `Error searching knowledge base: ${
            error instanceof Error ? error.message : String(error)
          }. Please try the web search tool or contact BYU-Idaho directly.`;
        }
      },
    });
  }

  createWebSearchTool() {
    return new DynamicStructuredTool({
      name: "web_search_tool",
      description:
        "Search the web for current information when the knowledge base doesn't have sufficient information. Use this as a fallback after searching the knowledge base.",
      schema: z.object({
        query: z.string().describe("The web search query"),
        max_results: z
          .number()
          .optional()
          .default(5)
          .describe("Maximum number of results to return"),
      }),
      func: async (input: { query: string; max_results?: number }) => {
        // Input is now always an object
        const query = input.query;
        const max_results = input.max_results || 5;
        console.log(`🌐 Web search called for: "${query}"`);

        if (!process.env.TAVILY_API_KEY) {
          console.log("❌ Web search failed: No Tavily API key");
          return "Web search is not configured. TAVILY_API_KEY environment variable is required.";
        }

        try {
          const response = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              api_key: process.env.TAVILY_API_KEY,
              query: query,
              search_depth: "basic",
              include_answer: true,
              include_images: false,
              include_raw_content: false,
              max_results: Math.min(max_results, 10),
              include_domains: [
                "byui.edu",
                "lds.org",
                "churchofjesuschrist.org",
              ], // Prioritize relevant domains
            }),
          });

          if (!response.ok) {
            throw new Error(
              `Tavily API error: ${response.status} ${response.statusText}`
            );
          }

          const data = await response.json();

          if (!data.results || data.results.length === 0) {
            return `No web search results found for "${query}". The information may not be available online or may require accessing the knowledge base.`;
          }

          // Format results
          const formattedResults = data.results
            .slice(0, max_results)
            .map((result: any, index: number) => {
              return `Result ${index + 1}:
Title: ${result.title}
Content: ${result.content}
URL: ${result.url}
Score: ${result.score}
---`;
            })
            .join("\n\n");

          let output = `Found ${data.results.length} web search results for "${query}":\n\n${formattedResults}`;

          // Include the answer if Tavily provided one
          if (data.answer) {
            output = `Direct Answer: ${data.answer}\n\n${output}`;
          }

          return output;
        } catch (error) {
          console.error("Error with web search:", error);
          return `Error performing web search: ${
            error instanceof Error ? error.message : String(error)
          }. Please rely on the knowledge base or contact BYU-Idaho directly.`;
        }
      },
    });
  }

  createCalculatorTool() {
    return new DynamicStructuredTool({
      name: "calculator_tool",
      description:
        "Perform mathematical calculations. Useful for GPA calculations, financial aid amounts, credit hour calculations, etc.",
      schema: z.object({
        expression: z
          .string()
          .describe(
            "Mathematical expression to evaluate (e.g., '3.5 * 4 + 2.8 * 3')"
          ),
        description: z
          .string()
          .optional()
          .describe("Description of what this calculation represents"),
      }),
      func: async (input: { expression: string; description?: string }) => {
        // Input is now always an object
        const expression = input.expression;
        const description = input.description;
        console.log(`🧮 Calculator called for: "${expression}"`);

        try {
          // Simple safe evaluation - only allow basic math operations
          const sanitized = expression.replace(/[^0-9+\-*/.() ]/g, "");
          if (sanitized !== expression) {
            console.log(
              "❌ Calculator failed: Invalid characters in expression"
            );
            return "Error: Invalid characters in mathematical expression. Only numbers and basic operators (+, -, *, /, parentheses) are allowed.";
          }

          const result = eval(sanitized); // Note: In production, use a safer math parser
          console.log(`✅ Calculator result: ${result}`);
          const output = `Calculation: ${expression} = ${result}`;
          return description ? `${description}\n${output}` : output;
        } catch (error) {
          console.log(`❌ Calculator error: ${error}`);
          return `Error calculating expression "${expression}": ${
            error instanceof Error ? error.message : String(error)
          }`;
        }
      },
    });
  }

  // Node that forces knowledge base search first
  createFirstAgentNode() {
    return async (state: typeof GraphState.State) => {
      const messages = state.messages;
      const humanInput = messages[messages.length - 1].content as string;

      console.log(
        "🚀 First agent node: Forcing knowledge base search for:",
        humanInput
      );

      return {
        messages: [
          new AIMessage({
            content: "",
            tool_calls: [
              {
                name: "knowledge_base_tool",
                args: {
                  query: humanInput,
                  k: 5,
                },
                id: "forced_kb_search",
              },
            ],
          }),
        ],
      };
    };
  }

  // Node that calls the LLM with system prompt
  createAgentNode() {
    return async (state: typeof GraphState.State) => {
      const messages = state.messages;

      // Add system message at the beginning if not present
      const systemMessage = new SystemMessage(SYSTEM_MESSAGE);
      const messagesWithSystem = [systemMessage, ...messages];

      console.log(
        "🤖 Agent node: Processing with",
        messagesWithSystem.length,
        "messages"
      );

      const response = await this.llm.invoke(messagesWithSystem);
      return { messages: [response] };
    };
  }

  // Function to determine next step
  shouldContinue(state: typeof GraphState.State) {
    const messages = state.messages;
    const lastMessage = messages[messages.length - 1] as AIMessage;

    if (!lastMessage.tool_calls || lastMessage.tool_calls.length === 0) {
      console.log("📝 No tool calls - ending conversation");
      return "end";
    }

    console.log("🛠️ Tool calls detected - continuing to tools");
    return "continue";
  }

  async initializeAgent() {
    try {
      await this.initializePinecone();

      // Create tools
      this.tools = [
        this.createKnowledgeBaseTool(),
        this.createWebSearchTool(),
        this.createCalculatorTool(),
      ];

      // Bind tools to LLM
      this.llm = this.llm.bindTools(this.tools);

      // Create tool node for LangGraph
      const toolNode = new ToolNode(this.tools);

      // Create LangGraph workflow using MessagesAnnotation
      const workflow = new StateGraph(GraphState)
        .addNode("first_agent", this.createFirstAgentNode())
        .addNode("agent", this.createAgentNode())
        .addNode("tools", toolNode)
        .addEdge(START, "first_agent")
        .addEdge("first_agent", "tools")
        .addEdge("tools", "agent")
        .addConditionalEdges("agent", (state) => this.shouldContinue(state), {
          continue: "tools",
          end: END,
        });

      // Compile the workflow
      this.app = workflow.compile();

      console.log("✅ BSC Agent with LangGraph initialized successfully!");
      console.log(
        "🛠️  Available tools:",
        this.tools.map((t) => t.name).join(", ")
      );
      console.log("📋 Using custom system prompt from prompt.json");
      console.log(
        "🎯 Flow: User -> Force KB Search -> Tools -> Agent -> (Optional) More Tools -> End"
      );
    } catch (error) {
      console.error("❌ Error initializing agent:", error);
      throw error;
    }
  }

  async processMessage(userInput: string): Promise<string> {
    if (!this.app) {
      throw new Error("Agent not initialized. Call initializeAgent() first.");
    }

    try {
      const initialState = {
        messages: [new HumanMessage(userInput)],
      };

      const finalState = await this.app.invoke(initialState);
      const messages = finalState.messages;
      const lastMessage = messages[messages.length - 1];

      return (
        (lastMessage.content as string) ||
        "I apologize, but I was unable to generate a response."
      );
    } catch (error) {
      console.error("Error processing message:", error);
      return `I encountered an error: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  }

  async *streamMessage(
    userInput: string
  ): AsyncGenerator<string, void, unknown> {
    if (!this.app) {
      throw new Error("Agent not initialized. Call initializeAgent() first.");
    }

    try {
      const initialState = {
        messages: [new HumanMessage(userInput)],
      };

      // Use both updates and values to catch streaming tokens
      const stream = this.app.streamEvents(initialState, { version: "v1" });

      for await (const event of stream) {
        // Handle tool execution events
        if (event.event === "on_tool_end") {
          const toolName = event.name;
          if (toolName === "knowledge_base_tool") {
            yield `📚 Found information in knowledge base...\n\n`;
          } else if (toolName === "web_search_tool") {
            yield `🌐 Searched the web for current information...\n\n`;
          } else if (toolName === "calculator_tool") {
            yield `🧮 Calculated: ${event.data.output}\n\n`;
          }
        }
        
        // Handle streaming tokens from the LLM
        if (event.event === "on_chat_model_stream") {
          const chunk = event.data?.chunk;
          if (chunk?.content) {
            yield chunk.content;
          }
        }

        // Handle final message from agent node
        if (event.event === "on_chain_end" && event.name === "agent") {
          const output = event.data?.output;
          if (output?.messages?.[0]?.content && !event.data?.streamed) {
            yield output.messages[0].content;
          }
        }
      }
    } catch (error) {
      console.error("Error streaming message:", error);
      // Fallback to non-streaming
      try {
        const result = await this.processMessage(userInput);
        yield result;
      } catch {
        yield `Error: ${
          error instanceof Error ? error.message : String(error)
        }`;
      }
    }
  }

  async *streamMessageForAPI(userInput: string): AsyncGenerator<
    {
      type: "chunk" | "done" | "error";
      content: string;
      timestamp: number;
      toolCalls?: Array<{ tool: string; input: any; output: any }>;
    },
    void,
    unknown
  > {
    try {
      const toolCalls: Array<{ tool: string; input: any; output: any }> = [];

      if (!this.app) {
        throw new Error("Agent not initialized. Call initializeAgent() first.");
      }

      const initialState = {
        messages: [new HumanMessage(userInput)],
      };

      console.log("🚀 Starting LangGraph stream for:", userInput);

      // Track which tools have been called
      let knowledgeBaseUsed = false;
      let currentResponse = "";

      // Use streamEvents for better streaming control
      const stream = this.app.streamEvents(initialState, { version: "v1" });

      for await (const event of stream) {
        console.log("📨 Event:", event.event, "Name:", event.name);

        // Handle tool start events
        if (event.event === "on_tool_start") {
          const toolName = event.name;
          toolCalls.push({
            tool: toolName,
            input: event.data?.input || {},
            output: "In progress...",
          });

          yield {
            type: "chunk",
            content: `🛠️ Using ${toolName}...\n\n`,
            timestamp: Date.now(),
            toolCalls: [...toolCalls],
          };

          if (toolName === "knowledge_base_tool") {
            knowledgeBaseUsed = true;
          }
        }

        // Handle tool completion events
        if (event.event === "on_tool_end") {
          const toolName = event.name;
          const output = event.data?.output;

          // Update the tool call with output
          const toolCallIndex = toolCalls.findIndex(
            (tc) => tc.tool === toolName && tc.output === "In progress..."
          );
          if (toolCallIndex >= 0) {
            toolCalls[toolCallIndex].output = output;
          }

          if (toolName === "knowledge_base_tool") {
            yield {
              type: "chunk",
              content: `📚 Found information in knowledge base...\n\n`,
              timestamp: Date.now(),
              toolCalls: [...toolCalls],
            };
          } else if (toolName === "web_search_tool") {
            yield {
              type: "chunk",
              content: `🌐 Searched the web for current information...\n\n`,
              timestamp: Date.now(),
              toolCalls: [...toolCalls],
            };
          } else if (toolName === "calculator_tool") {
            yield {
              type: "chunk",
              content: `🧮 Calculated: ${output}\n\n`,
              timestamp: Date.now(),
              toolCalls: [...toolCalls],
            };
          }
        }

        // Handle streaming tokens from the LLM
        if (event.event === "on_chat_model_stream") {
          const chunk = event.data?.chunk;
          if (chunk?.content) {
            currentResponse += chunk.content;
            yield {
              type: "chunk",
              content: chunk.content,
              timestamp: Date.now(),
              toolCalls: toolCalls.length > 0 ? [...toolCalls] : undefined,
            };
          }
        }

        // Handle complete AI message (fallback for non-streaming)
        if (event.event === "on_chain_end" && event.name === "agent") {
          const output = event.data?.output;
          if (output?.messages?.[0]?.content && !currentResponse) {
            yield {
              type: "chunk",
              content: output.messages[0].content,
              timestamp: Date.now(),
              toolCalls: toolCalls.length > 0 ? [...toolCalls] : undefined,
            };
          }
        }
      }

      // Ensure knowledge base was used (it should always be forced)
      if (!knowledgeBaseUsed) {
        console.warn(
          "⚠️ Knowledge base was not used - this should never happen with forced flow!"
        );
        yield {
          type: "chunk",
          content: "\n\n⚠️ Warning: Knowledge base was not consulted.\n\n",
          timestamp: Date.now(),
        };
      }

      yield {
        type: "done",
        content: "",
        timestamp: Date.now(),
        toolCalls: toolCalls.length > 0 ? [...toolCalls] : undefined,
      };
    } catch (error) {
      console.error("Error in streamMessageForAPI:", error);
      yield {
        type: "error",
        content: error instanceof Error ? error.message : String(error),
        timestamp: Date.now(),
      };
    }
  }
}

// CLI interface for testing
async function main() {
  const agent = new BSCAgentWithTools();

  try {
    console.log("🚀 Initializing BSC Agent with Tools...");
    await agent.initializeAgent();

    console.log("\n🤖 BSC Support Agent - Enhanced Version with Tools");
    console.log(
      "======================================================================"
    );
    console.log("💬 Start chatting! I have access to:");
    console.log("   🔍 Knowledge Base Search (Pinecone RAG)");
    console.log("   🌐 Web Search (coming soon)");
    console.log("   🧮 Calculator");
    console.log("\n🔄 Commands:");
    console.log("   • Type 'exit', 'quit', or 'bye' to end the conversation");
    console.log(
      "======================================================================\n"
    );

    const readline = await import("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: "👤 You: ",
    });

    rl.prompt();

    rl.on("line", async (input: string) => {
      const trimmed = input.trim();

      if (["exit", "quit", "bye"].includes(trimmed.toLowerCase())) {
        console.log("👋 Goodbye! Thanks for chatting!");
        rl.close();
        process.exit(0);
      }

      try {
        console.log("🤖 BSC Support Agent: ");
        const response = await agent.processMessage(trimmed);
        console.log(response);
        console.log("");
      } catch (error) {
        console.error("❌ Error:", error);
      }

      rl.prompt();
    });
  } catch (error) {
    console.error("❌ Failed to initialize agent:", error);
    console.error(
      "💡 Make sure your environment variables are set correctly in backend/.env"
    );
    process.exit(1);
  }
}

// Run CLI if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

// Export for use in other modules (API, tests, etc.)
export { BSCAgentWithTools, main };
