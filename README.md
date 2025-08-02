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

## 🌟 Overview

The **BSC Support Agent** is designed to revolutionize how the BYU-Idaho handles student support requests. This modern React + TypeScript application integrates with an AI model to provide fast, consistent, and values-aligned responses to student inquiries.

### 🎯 Key Objectives

- **Improve Consistency**: AI-powered responses aligned with BYU-Idaho's values
- **Scale Effortlessly**: Handle peak periods (semester start, financial aid deadlines)

## ✨ Features

### 🔐 **Secure Authentication System**

- JWT-based authentication with PostgreSQL session management
- Role-based access control (user, admin)
- Secure password hashing with bcrypt
- Session tracking and logout capabilities

### 🤖 **AI-Powered Interactions**

- **Chat Interface**: Real-time AI assistance with knowledge base integration
- **Context-Aware Responses**: Grounded in BYU-Idaho's policies and knowledge base

### 🎨 **Modern User Experience**

- Clean, responsive design with Tailwind CSS
- Dark/light theme support
- Icon-only sidebar navigation with Lucide React icons
- Mobile-friendly responsive layout

### 🔧 **Developer Experience**

- TypeScript for type safety
- Hot reload development server
- Automated deployment scripts
- Comprehensive error handling

## 🛠️ Tech Stack

### Frontend

| Technology       | Version | Purpose      |
| ---------------- | ------- | ------------ |
| **React**        | 19.1.0  | UI Framework |
| **TypeScript**   | 5.8.3   | Type Safety  |
| **Vite**         | 7.0.4   | Build Tool   |
| **Tailwind CSS** | 3.4.17  | Styling      |
| **React Router** | 7.7.0   | Navigation   |

### Backend

| Technology     | Version | Purpose          |
| -------------- | ------- | ---------------- |
| **PostgreSQL** | -       | Database         |
| **JWT**        | 9.0.0   | Authentication   |
| **bcryptjs**   | 2.4.3   | Password Hashing |

### AI & Integration

- **OpenAI**: GPT-4.1 for generation, text-embedding-3-large for search
- **Pinecone**: Vector database for semantic search

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **Azure CLI** (for deployment)
- **PostgreSQL** (Azure PostgreSQL Flexible Server recommended)
- **Azure Subscription**

The application will be available at:

- **Frontend**: http://localhost:5173

### ⚙️ Environment Configuration

## 🗂️ Project Structure

```
BSC-Agent-Application/
├── 📁 src/                     # Frontend React application
│   ├── 📁 components/         # Reusable UI components
│   ├── 📁 pages/             # Application pages (Home, Chat, Settings)
│   ├── 📁 context/           # React context providers
│   ├── 📁 hooks/             # Custom React hooks
│   └── 📁 utils/             # Utility functions
├── 📁 public/                  # Static assets
├── 📁 documents/               # Project documentation
└── 📁 scripts/                 # Utility scripts
```

### Environment Variables for Production

Set these in your Azure Static Web App configuration:

| Variable            | Description                | Required |
| ------------------- | -------------------------- | -------- |
| `POSTGRES_HOST`     | PostgreSQL server hostname | ✅       |
| `POSTGRES_DB`       | Database name              | ✅       |
| `POSTGRES_USER`     | Database user              | ✅       |
| `POSTGRES_PASSWORD` | Database password          | ✅       |
| `JWT_SECRET`        | JWT signing secret         | ✅       |

## 🗄️ Database Setup

### Initialize PostgreSQL Database

```bash
# Connect to your Azure PostgreSQL server
psql -h your-server.postgres.database.azure.com \
     -U your_admin_user \
     -d your_database_name \
     -f api/database/init.sql
```

### Database Schema

The application uses two main tables:

- **`users`**: User accounts with authentication details
- **`user_sessions`**: JWT session management and tracking

## 🎨 UI/UX Design

### Navigation Structure

- **Home** 🏠: Landing page with feature overview
- **Chat** 💬: Interactive AI chat interface
- **Settings** ⚙️: User profile and preferences
- **About** ❓: Links to project documentation

### Design Principles

- **Minimal & Clean**: Icon-only sidebar for maximum content space
- **Accessible**: WCAG compliant with proper contrast ratios
- **Responsive**: Mobile-first design approach
- **Consistent**: Unified color scheme and typography

## 🔒 Security Features

- **🔐 JWT Authentication**: Secure token-based authentication
- **🛡️ Password Security**: bcrypt hashing with 12 salt rounds
- **📊 Session Management**: Database-tracked sessions with expiration
- **🔍 Input Validation**: Joi schema validation for all inputs
- **🛡️ SQL Injection Protection**: Parameterized queries
- **🌐 CORS Configuration**: Properly configured cross-origin requests

## 🧪 Development Commands

```bash
# Development
npm run dev                    # Start frontend development server
npm run start:api             # Start Azure Functions locally
./run.sh                      # Start both frontend and backend

# Building
npm run build                 # Build for production
npm run preview               # Preview production build

# Dependencies
npm run install:all           # Install frontend + backend dependencies

# Linting
npm run lint                  # Run ESLint
```

## 🏫 About BYU-Idaho

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

<!-- Deployment test - checking Azure Functions deployment -->
