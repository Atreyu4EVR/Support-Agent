<div align="center">
  <h1 style="font-size: 4em; font-weight: bold; margin: 20px 0;">
    The BYUI Support Agent
  </h1>
  <!-- Enhanced badges with better spacing -->
  <p>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" /></a>
    <a href="https://www.python.org/"><img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" /></a>
    <a href="https://azure.microsoft.com/"><img src="https://img.shields.io/badge/Microsoft_Azure-0089D0?style=for-the-badge&logo=microsoft-azure&logoColor=white" alt="Azure" /></a>
    <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" /></a>
  </p>
  <!-- <p>
    <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=20&duration=3000&pause=1000&color=2563EB&center=true&vCenter=true&multiline=true&width=900&height=80&lines=Hi%21+I%27m+the+BYUI+Support+Agent.+How+can+I+help+you+today%3F" alt="Typing SVG" />
  </p> -->
  
</div>

## Overview

The Support Agent is an AI-powered assistant designed by BYU-Idaho's AI Engineering team. It is designed to help BYU-Idaho students, faculty, and staff find answers to common questions and navigate university resources. Such as:

- Financial aid and scholarship information
- Course registration
- Student housing and campus life
- Parking and transportation
- Campus resources and services

### Key Objectives

- **Improve Consistency**: AI-powered responses aligned with BYU-Idaho's values
- **Scale Effortlessly**: Handle peak periods (semester start, financial aid deadlines)
- **Enhance Efficiency**: Reduce response time and improve support quality

## Architecture

This application combines a Python AI backend with a React TypeScript frontend to provide fast, consistent, and values-aligned responses to student inquiries. This project is organized as a clean monorepo with clear separation of concerns:

```
BSC-Support-Agent/
├── apps/
│   ├── backend/           # Python API & AI agents
│   └── frontend/          # React TypeScript UI
├── configs/
│   ├── docker/           # Docker configurations
│   └── azure/            # Azure deployment configs
├── docs/                 # Project documentation
├── scripts/              # Build and deployment scripts
└── documents/            # Project assets
```

### Backend (`apps/backend/`)

- **Language**: Python
- **Framework**: FastAPI with OpenAI Agents SDK
- **AI Services**: Azure OpenAI (GPT-4.1), Pinecone (vector search)
- **Features**: Agentic orchestration, streaming responses, memory management

### Frontend (`apps/frontend/`)

- **Language**: TypeScript
- **Framework**: React with Tailwind CSS
- **Features**: Real-time chat, streaming responses, responsive design

## Features

### AI-Powered Interactions

- **Chat Interface**: Real-time AI assistance with Server-Sent Events streaming
- **Context-Aware Responses**: Grounded in BYU-Idaho's policies and knowledge base
- **Memory Management**: Persistent conversation history and context

### Modern User Experience

- Clean, responsive design with Tailwind CSS
- Dark/light theme support
- Icon-only sidebar navigation with Lucide React icons
- Mobile-friendly responsive layout

### Developer Experience

- TypeScript for type safety
- Hot reload development server
- Automated deployment scripts
- Docker containerization
- Comprehensive error handling

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Docker (optional)

### Usage

```bash
# Setup (first time)
./scripts/setup-dev.sh

# Development
npm run dev              # Start both services
npm run dev:frontend     # Frontend only
npm run dev:backend      # Backend only

# Docker
npm run docker:up        # Start with Docker
npm run docker:build     # Build containers

# Deployment
npm run azure:deploy     # Deploy to Azure
```

## Documentation

- [Deployment Guide](docs/DEPLOYMENT.md)
- [Project Overview](docs/OVERVIEW.md)
- [Integration Guide](docs/README_INTEGRATION.md)
- [Memory Management](docs/MEMORY_GUIDE.md)
- [Docker Workflow](docs/docker-dev-workflow.md)

## About BYU-Idaho

Brigham Young University-Idaho is a private university owned and affiliated with The Church of Jesus Christ of Latter-day Saints.

### Mission Statement

Brigham Young University-Idaho was founded and is supported and guided by The Church of Jesus Christ of Latter-day Saints. Its mission is to develop disciples of Jesus Christ who are leaders in their homes, the Church, and their communities.

The university does this by:

- Building testimonies of the restored gospel of Jesus Christ and fostering its principles in a wholesome academic, cultural, and social environment.
- Providing a high-quality education that prepares students of diverse interests and abilities for lifelong learning and employment.
- Serving as many students as possible within resource constraints.
- Delivering education that is affordable for students and the Church.

_Learn more about BYU-Idaho by going to [byui.edu/about](https://www.byui.edu/about)_

---

<div align="center">
  <p><strong>Built with ❤️ by BYU‑Idaho AI Engineering</strong></p>
</div>
