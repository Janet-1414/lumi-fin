FROM python:3.13-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install UV
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copy dependency files first for better caching
COPY pyproject.toml uv.lock ./

# Install ALL dependencies including extras
RUN uv sync --extra dev

# Copy app source
COPY . .

# Expose port
EXPOSE 8000

# Start — run migrations then uvicorn
CMD ["sh", "-c", "uv run alembic upgrade head && echo 'Migrations done, starting uvicorn...' && uv run uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --log-level debug"]