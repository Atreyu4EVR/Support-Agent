<div align="center">
  <h1 style="font-size: 6em; font-weight: bold; margin: 20px 0;">
    BYUI Support Agent
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

---

## Summary

The BYUI Support Agent is a cutting-edge AI system designed to modernize student support at Brigham Young University-Idaho. This intelligent assistant provides instant, accurate responses to student inquiries 24/7, significantly reducing response times to seconds while maintaining BYU-Idaho's commitment to values-based education.

### Business Impact

- **Response Time**: Reduced to < 5 seconds
- **Student Satisfaction**: 24/7 availability during critical periods
- **Consistency**: 100% adherence to university policies and values
- **Scalability**: Handles unlimited concurrent users during peak periods

### Key Value Propositions

1. **Instant Access**: Students get immediate answers during registration, financial aid deadlines, and other critical periods
2. **Cost Effective**: Automates routine inquiries, allowing staff to focus on complex cases
3. **Always Available**: 24/7 support during nights, weekends, and holidays
4. **Consistent Quality**: Every response aligns with BYU-Idaho's policies and LDS values
5. **Future-Ready**: Built on modern cloud architecture for easy scaling and enhancement

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

## Features & Capabilities

### Advanced AI Capabilities

#### Intelligent Conversational AI

- **GPT-4.1 Powered**: Latest Azure OpenAI technology for natural conversations
- **Knowledge Grounded**: Responses based on verified BYU-Idaho policies and procedures
- **Context Aware**: Maintains conversation history and understands complex multi-turn dialogues
- **Real-Time Streaming**: Instant response generation with Server-Sent Events
- **Semantic Search**: Pinecone vector database for intelligent information retrieval

#### Values-Aligned Responses

- **Values Integration**: Every response reflects BYU-Idaho's values
- **Policy Compliance**: Adherence to official university guidelines
- **Academic Integrity**: Promotes honor code and ethical academic practices
- **Student-Centered**: Responses prioritize student success and well-being

### User Experience

#### Modern Interface Design

- **Responsive Design**: Seamless experience across desktop, tablet, and mobile
- **Dark/Light Themes**: User preference accommodation for any time of day
- **Lightning Fast**: Sub-second page loads with optimized React components
- **Intuitive Navigation**: Clean, icon-based sidebar with logical organization

### Technical Specifications

- **Cloud-Native**: Built for Azure with automatic scaling and high availability
- **TypeScript**: Full type safety across frontend and API interfaces
- **Modern Tooling**: Vite, ESLint, Prettier for optimal development experience
- **CI/CD Pipeline**: Automated testing, building, and deployment
- **Containerized**: Docker-based deployment for consistency and portability

## Team & Support

### Development Team

**Project Lead & AI Engineer**

- **Ron Vallejo** - AI Engineer, BYU-Idaho IT
- **Email**: vallejo@byui.edu
- **Expertise**: AI development, Azure architecture, LLM integration, and RAG architecture

**Stakeholders**

- **BYUI Support Center** - Primary stakeholder and user requirements
- **AI Governance** - Governance and oversight of general AI usage
- **AI Engineering Team** - Technical implementation and support

### Support & Maintenance

#### **For Technical Issues**

- **Primary Contact**: Ron Vallejo (vallejo@byui.edu)

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

<p><strong>Built with ❤️ by BYU‑Idaho AI Engineering Team</strong></p>
