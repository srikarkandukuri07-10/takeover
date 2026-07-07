# Autonomous HR Manager

**One AI Employee. Complete HR Operations.**

An AI-first HR Operations platform where an **Autonomous AI Employee** performs HR operations by planning workflows, making decisions, and executing tasks through specialized modules.

## Architecture

```
User Event → AI HR Manager → Workflow Planner → Tool Executor → HR Modules → Supabase DB → Realtime UI
```

## Tech Stack

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion
- **Backend**: FastAPI, Python
- **Database**: Supabase PostgreSQL
- **AI Provider**: Groq (abstracted for multi-provider support)
- **Auth**: Supabase Auth

## Getting Started

### 1. Database Setup

Run the schema in `backend/app/db/migrations/001_schema.sql` in your Supabase SQL Editor.

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your Supabase and Groq credentials
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 3. Frontend Setup

```bash
cd frontend
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
npm install
npm run dev
```

## Usage

Navigate to `http://localhost:3000` and describe a business event:

- "Hire Rahul as Backend Developer"
- "Priya requested leave"
- "Aman resigned today"
- "Review Sarah's performance"

The AI autonomously plans and executes the entire workflow.

## Project Structure

```
backend/
├── app/
│   ├── api/endpoints/     # API routes
│   ├── db/                # Database config & migrations
│   ├── schemas/           # Pydantic models
│   ├── services/
│   │   ├── ai/            # AI orchestration engine
│   │   ├── recruitment/   # Recruitment tools
│   │   ├── onboarding/    # Onboarding tools
│   │   ├── leave/         # Leave management tools
│   │   ├── training/      # Training tools
│   │   ├── performance/   # Performance review tools
│   │   ├── promotion/     # Promotion tools
│   │   ├── payroll/       # Payroll exception tools
│   │   └── exit/          # Exit management tools
│   └── main.py
└── requirements.txt

frontend/
├── src/
│   ├── app/               # Next.js App Router pages
│   ├── components/        # UI components
│   ├── hooks/             # React hooks
│   ├── lib/               # Utilities & API client
│   └── types/             # TypeScript types
└── package.json
```

## AI Architecture

The AI is **not a chatbot**. It's an orchestration engine that:

1. Understands business events
2. Detects the workflow type
3. Generates an execution plan
4. Executes business tools sequentially
5. Monitors execution in real-time
6. Returns status updates

The AI Provider is abstracted via `AIProvider` base class — swap Groq for OpenAI, Anthropic, or Ollama by changing `AI_PROVIDER` in `.env`.
