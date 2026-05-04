# Lumi — Your Financial Future, Illuminated 💡

> AI-powered financial wellness for East African youth. Built with FastAPI, LangGraph, OpenAI, and Next.js.

---

## What is Lumi?

Lumi is a full-stack financial wellness platform built specifically for East African youth aged 18–35. It combines intelligent money tracking, AI-powered insights, savings goal coaching, gamification, and a privacy-first anonymous community — all in one app that understands the East African financial context (MTN Mobile Money, Airtel Money, local currencies, boda boda rides, Cafe Javas, Owino market).

**Tagline:** Your Financial Future, Illuminated.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand, Recharts |
| Backend | Python 3.13, FastAPI, SQLAlchemy 2.x async |
| AI | LangChain + LangGraph + OpenAI (GPT-4o) |
| AI Observability | LangSmith |
| Database | PostgreSQL 16 |
| Migrations | Alembic |
| Package manager | UV (Python), npm (Node) |
| Frontend deploy | Vercel |
| Backend deploy | Railway |
| CI/CD | GitHub Actions |

---

## Project Structure

```
lumi/
├── .github/
│   └── workflows/
│       ├── ci.yml                  # Lint + test on every PR
│       ├── deploy-backend.yml      # Deploy to Railway on push to main
│       └── deploy-frontend.yml     # Deploy to Vercel on push to main
├── backend/                        # Python FastAPI backend
│   ├── app/
│   │   ├── ai/                     # All 11 AI features
│   │   ├── api/                    # Route handlers
│   │   ├── core/                   # Auth, security, dependencies
│   │   ├── db/                     # Database engine + base
│   │   ├── models/                 # SQLAlchemy ORM models
│   │   ├── schemas/                # Pydantic schemas
│   │   ├── services/               # Business logic
│   │   └── main.py                 # FastAPI app entry point
│   ├── alembic/                    # Database migrations
│   ├── tests/                      # pytest test suite
│   ├── pyproject.toml              # Python dependencies (UV)
│   ├── Dockerfile                  # Railway deployment
│   └── railway.toml
├── frontend/                       # Next.js frontend
│   └── src/
│       ├── app/                    # Next.js App Router pages
│       ├── components/             # React components
│       ├── hooks/                  # Custom React hooks
│       ├── lib/                    # API client, utilities
│       ├── store/                  # Zustand state
│       └── types/                  # TypeScript types
├── .gitignore
├── docker-compose.yml              # Local dev: postgres + backend
└── README.md
```

---

## Getting Started (Windows / Local Dev)

### Prerequisites

- Python 3.13 — [python.org](https://python.org)
- Node.js 20 — [nodejs.org](https://nodejs.org)
- UV — Python package manager
- PostgreSQL 16 (or Docker Desktop)
- Git

### 1. Install UV

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

Restart your terminal after installing.

### 2. Clone the repository

```powershell
git clone https://github.com/your-username/lumi.git
cd lumi
```

### 3. Set up the backend

```powershell
cd backend
copy .env.example .env
```

Edit `.env` and fill in:
- `SECRET_KEY` — generate with: `python -c "import secrets; print(secrets.token_hex(32))"`
- `OPENAI_API_KEY` — your OpenAI API key from [platform.openai.com](https://platform.openai.com)
- `LANGCHAIN_API_KEY` — from [smith.langchain.com](https://smith.langchain.com) (free account)
- `DATABASE_URL` and `DATABASE_URL_SYNC` — your PostgreSQL connection strings

```powershell
# Install Python dependencies
uv sync

# Start PostgreSQL (if using Docker)
docker compose up postgres -d

# Run database migrations
uv run alembic upgrade head

# Start the API server
uv run uvicorn app.main:app --reload --port 8000
```

API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### 4. Set up the frontend

```powershell
cd ..\frontend
copy .env.local.example .env.local
```

`.env.local` should contain:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

```powershell
npm install
npm run dev
```

App runs at: [http://localhost:3000](http://localhost:3000)

---

## Running Tests

```powershell
cd backend

# Create test database
createdb lumi_test   # or via pgAdmin

# Run full test suite with coverage
uv run pytest --cov=app --cov-report=term-missing -v
```

Target: **90% code coverage**

---

## All 11 AI Features (Lumi Pro)

| # | Feature | File | Model |
|---|---|---|---|
| 1 | Receipt & SMS Scanner | `app/ai/receipt_scanner.py` + `sms_parser.py` | GPT-4o Vision |
| 2 | Smart Spending Alerts | `app/ai/spending_alerts.py` | GPT-4o-mini |
| 3 | Money Personality Profile | `app/ai/money_personality.py` | GPT-4o |
| 4 | Financial Literacy Lessons | `app/ai/financial_literacy.py` | GPT-4o-mini |
| 5 | AI Savings Coach | `app/ai/savings_coach.py` | GPT-4o-mini |
| 6 | Savings Challenges | `app/ai/savings_challenges.py` | GPT-4o-mini |
| 7 | Chat with Your Finances | `app/ai/agent.py` + `graph.py` | GPT-4o + LangGraph |
| 8 | AI Visual Reports | `app/ai/visual_reports.py` | GPT-4o |
| 9 | Investment Hints | `app/ai/investment_hints.py` | GPT-4o |
| 10 | Notification Intelligence | `app/ai/notification_intelligence.py` | GPT-4o-mini |
| 11 | Community Pulse | `app/ai/community_pulse.py` | GPT-4o-mini |

The chat feature uses **LangGraph** for stateful agent orchestration with **LangChain tools** that query the user's real financial data. All AI calls are traced via **LangSmith**.

---

## Supported Countries & Currencies

| Country | Currency |
|---|---|
| 🇺🇬 Uganda | UGX |
| 🇰🇪 Kenya | KES |
| 🇹🇿 Tanzania | TZS |
| 🇷🇼 Rwanda | RWF |
| 🇪🇹 Ethiopia | ETB |
| 🇧🇮 Burundi | BIF |
| 🇸🇸 South Sudan | SSP |

---

## Deployment

### Backend → Railway

1. Create a Railway project
2. Add a PostgreSQL database service
3. Add a backend service pointed at `backend/` folder
4. Set all environment variables from `backend/.env.example`
5. Railway auto-deploys via `railway.toml`

### Frontend → Vercel

1. Import the repo into Vercel
2. Set root directory to `frontend/`
3. Add `NEXT_PUBLIC_API_URL` pointing to your Railway backend URL
4. Vercel auto-deploys on push to `main`

### CI/CD — GitHub Actions

- **`ci.yml`** — runs on every PR: lints, type-checks, runs backend tests
- **`deploy-backend.yml`** — deploys backend to Railway on push to `main`
- **`deploy-frontend.yml`** — deploys frontend to Vercel on push to `main`

Required GitHub secrets:
```
RAILWAY_TOKEN
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
OPENAI_API_KEY
LANGCHAIN_API_KEY
```

---

## Design System — Midnight Gold

| Token | Value | Usage |
|---|---|---|
| Primary background (dark) | `#0A0F1E` | App background |
| Accent | `#FAC775` | Buttons, highlights, active states |
| Success | `#1D9E75` | Income, completed goals, positive |
| Alert | `#D85A30` | Expenses, budget warnings |
| Dark mode | Default | Toggle in profile settings |

---

## Subscription Model

| Feature | Free | Pro ($1/month) |
|---|---|---|
| Transactions | 20/month | Unlimited |
| AI features | ✗ | All 11 |
| Community | Read-only | Full participation |
| Streaks & badges | ✗ | ✓ |

> Stripe integration is planned for production. The subscription page is a polished UI showcase.

---

## Security

- JWT stored in **HTTP-only cookies** — never localStorage
- All user data scoped strictly to the authenticated user
- Password validation enforces uppercase, lowercase, numbers, and symbols
- CORS origins, methods, and headers loaded from environment variables
- All secrets in environment variables — nothing hardcoded

---

## License

Built for demo day. All rights reserved.
