# Contributing to Lumi

## Branch naming
- `feature/your-feature-name`
- `fix/bug-description`
- `chore/task-description`

## Commit format
```
type: short description

feat: add AI savings coach endpoint
fix: correct currency formatting for ETB
chore: update OpenAI SDK to 1.60
```

## Before pushing
```powershell
# Backend
cd backend
uv run pytest --cov=app -v
uv run python -m py_compile app/main.py

# Frontend
cd frontend
npm run type-check
npm run lint
```

## Environment variables
Never commit `.env` files. Always update `.env.example` when adding new variables.

## Database changes
Always create an Alembic migration for schema changes:
```powershell
cd backend
uv run alembic revision --autogenerate -m "describe your change"
uv run alembic upgrade head
```
