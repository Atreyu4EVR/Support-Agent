<div align="center">
  <img src="documents/bsc-agent-logo.png" alt="BSC Agent Logo" width="600"/>
  
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Azure](https://img.shields.io/badge/Microsoft_Azure-0089D0?style=for-the-badge&logo=microsoft-azure&logoColor=white)](https://azure.microsoft.com/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
  [![n8n](https://img.shields.io/badge/n8n-EA4B71?style=for-the-badge&logo=n8n&logoColor=white)](https://n8n.io/)
  
  **An AI-powered full-stack application for the BYU-Idaho Support**
  
  *Advancing responsible AI by building agentic systems that cut through the hype—delivering real-world solutions and values-driven support to BYU-Idaho’s students and employees.*
</div>

# Project Overview

The BSC Agent project is BYU-Idaho’s pilot project aimed at leveraging AI agents to support students and staff with frontline support. It leverages a Retrieval-Augmented Generation (RAG) architecture to deliver fast, consistent, and values-aligned responses to common student inquiries. This project leverages a full-stack approach, with a backend in node.js and a frontend in react. Users can interact with the agent through a chat interface, and the agent will use the RAG architecture to generate responses to the user's inquiries.

## Tech Stack

### Key Technologies

- Hosting: Azure
- Programming Language: Typescript
- Backend: node.js
- Frontend: react
- Database: PostgreSQL (long-term storage for user interactions)
- Vite
- Docusaurus (for documentation)
- ESLint (for linting)

### Backend Libraries:

- LangGraph (for agentic orchestration)
- Azure OpenAI (GPT-4.1 for generation, text-embedding-3-large for vector search)
- Pinecone (semantic vector database)
- Tavily (web search)

### Frontend Libraries:

- React (for the web app)
- Tailwind CSS (for styling)

## Impact Goals

- Reduce administrative burden on support employees
- Cut operational costs by reducing reliance on human agents
- Improve CSAT (Customer Satisfaction) by delivering consistent, mission-aligned responses
- Scale effortlessly during peak periods (e.g., semester start, financial aid deadlines)

## Frontend Design

### Navigation Structure

- **Home**: Landing page with introduction and overview
- **Chat**: Interactive AI chat interface
- **Documentation**: Links to project documentation (docusaurus)
- **Settings**: User profile and preferences

### Design Principles

- **Minimal & Clean**: Icon-only sidebar for maximum content space
- **Accessible**: WCAG compliant with proper contrast ratios
- **Responsive**: Mobile-first design approach
- **Consistent**: Unified color scheme and typography

---

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
