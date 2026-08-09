# 📈 AI-Powered Financial & Stock Market Predictor

A dual-service monorepo platform featuring a Next.js (App Router, TypeScript) frontend, a Python FastAPI AI/ML backend, and Supabase PostgreSQL with `pgvector` database and authentication.

---

## 🏗️ Architecture & Monorepo Structure

```text
.
├── apps/
│   ├── web/                     # Next.js 14+ Frontend (App Router, Tailwind CSS, Supabase)
│   └── api/                     # FastAPI Python 3.11 Backend (LangChain, Gemini, Prophet)
├── supabase/                    # Supabase config & pgvector database migrations
├── .env.example                 # Root environment variables template
├── README.md
└── package.json                 # Monorepo workspace configuration
```

---

## 🚀 Quick Start Guide

### 1. Environment Setup

Copy `.env.example` to `.env` in the root directory (and optional app-specific `.env.local` files):

```bash
cp .env.example .env
```

Fill in your `GEMINI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### 2. Frontend Setup (`/apps/web`)

```bash
cd apps/web
npm install
npm run dev
```

The web application will run at [http://localhost:3000](http://localhost:3000).

### 3. Backend Setup (`/apps/api`)

Create a Python virtual environment and install dependencies:

```bash
cd apps/api
python -m venv venv

# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The FastAPI application will run at [http://localhost:8000](http://localhost:8000).  
Interactive Swagger docs: [http://localhost:8000/docs](http://localhost:8000/docs).

---

## ⚙️ Tech Stack

- **Frontend:** Next.js 14 (App Router, Strict Mode), Tailwind CSS, Framer Motion, `@tanstack/react-query`, Zustand, `@supabase/supabase-js`
- **Backend:** Python 3.11+, FastAPI, Uvicorn, LangChain, Google Generative AI (Gemini), Prophet (Time-series forecasting), Pandas, NumPy, Pydantic BaseSettings
- **Database & Auth:** Supabase PostgreSQL with `pgvector` extension & Supabase Auth
