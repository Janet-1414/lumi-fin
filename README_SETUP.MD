# Lumi Backend — Setup Guide (Windows / ThinkPad)

## Prerequisites
- Python 3.13 (download from python.org)
- UV package manager
- PostgreSQL 16 (or use Docker)

## 1. Install UV (run in PowerShell as Administrator)
```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```
Restart your terminal after installing.

## 2. Clone and set up the project
```powershell
cd backend
uv sync
```

## 3. Set up environment variables
```powershell
copy .env.example .env
```
Edit `.env` with your real values:
- `DATABASE_URL` — your PostgreSQL connection string
- `DATABASE_URL_SYNC` — same but with `postgresql://` (not asyncpg)
- `SECRET_KEY` — generate with: `python -c "import secrets; print(secrets.token_hex(32))"`
- `OPENAI_API_KEY` — your OpenAI API key
- `LANGCHAIN_API_KEY` — your LangSmith API key (from smith.langchain.com)

## 4. Start PostgreSQL (if using Docker)
```powershell
docker compose up postgres -d
```

## 5. Run database migrations
```powershell
uv run alembic upgrade head
```

## 6. Start the development server
```powershell
uv run uvicorn app.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

## Running tests
```powershell
# Create test database first
createdb lumi_test

uv run pytest --cov=app --cov-report=term-missing
```

## Deployment to Railway
1. Push to GitHub
2. Connect Railway to your GitHub repo
3. Set all environment variables in Railway dashboard
4. Railway auto-deploys on push to main via GitHub Actions
