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

# Start uvicorn directly — no alembic
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]