#!/usr/bin/env node

/**
 * Express.js API Example for Frontend Integration
 * This shows how to use the streaming BSC Agent in a web API
 */

import express from "express";
import cors from "cors";
import { BSCAgentWithTools } from "./agentWithTools.js";

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize the agent (do this once at startup)
let agent: BSCAgentWithTools;

async function initializeAgent() {
  try {
    agent = new BSCAgentWithTools();
    await agent.initializeAgent(); // Initialize with tools
    console.log("✅ BSC Agent API with Tools initialized");
  } catch (error) {
    console.error("❌ Failed to initialize agent:", error);
    process.exit(1);
  }
}

// Route 1: Server-Sent Events (SSE) streaming
app.get("/api/chat/stream", async (req, res) => {
  const message = req.query.message as string;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  // Set up SSE headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Cache-Control",
  });

  try {
    // Stream the response
    for await (const chunk of agent.streamMessageForAPI(message)) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);

      if (chunk.type === "done" || chunk.type === "error") {
        break;
      }
    }
  } catch (error) {
    res.write(
      `data: ${JSON.stringify({
        type: "error",
        content: "Streaming error occurred",
        timestamp: Date.now(),
      })}\n\n`
    );
  }

  res.end();
});

// Route 2: WebSocket-style chunked response
app.post("/api/chat/stream", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  // Set up chunked response
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Transfer-Encoding", "chunked");

  try {
    for await (const chunk of agent.streamMessageForAPI(message)) {
      res.write(JSON.stringify(chunk) + "\n");

      if (chunk.type === "done" || chunk.type === "error") {
        break;
      }
    }
  } catch (error) {
    res.write(
      JSON.stringify({
        type: "error",
        content: "Streaming error occurred",
        timestamp: Date.now(),
      }) + "\n"
    );
  }

  res.end();
});

// Route 3: Traditional non-streaming endpoint
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const response = await agent.processMessage(message);
    res.json({
      success: true,
      response,
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "BSC Support Agent API",
    timestamp: Date.now(),
  });
});

// Start server
async function startServer() {
  await initializeAgent();

  app.listen(port, () => {
    console.log(
      `🚀 BSC Agent API Server with Tools running on http://localhost:${port}`
    );
    console.log(
      `🛠️  Available tools: Knowledge Base (Pinecone RAG), Web Search, Calculator`
    );
    console.log(`📊 Available endpoints:`);
    console.log(`   • GET  /api/health           - Health check`);
    console.log(`   • POST /api/chat             - Non-streaming chat`);
    console.log(`   • POST /api/chat/stream      - Chunked streaming`);
    console.log(`   • GET  /api/chat/stream      - Server-Sent Events`);
  });
}

// Error handling
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

if (require.main === module) {
  startServer();
}

export { app, BSCAgentWithTools };
