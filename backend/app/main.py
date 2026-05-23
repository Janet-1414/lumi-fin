from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from app.config import settings
from app.ai.langsmith_config import configure_langsmith
from app.scheduler import start_scheduler, stop_scheduler
from app.api import auth, transactions, savings, reports, community, chat, ai, profile, notifications


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_langsmith()
    start_scheduler()
    yield
    stop_scheduler()


app = FastAPI(
    title="Lumi API",
    description="Lumi Financial Wellness API — Your Financial Future, Illuminated",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=settings.cors_methods_list,
    allow_headers=settings.cors_headers_list,
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again."},
    )


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy", "service": "Lumi API", "version": "1.0.0"}


app.include_router(auth.router, prefix="/api/v1")
app.include_router(transactions.router, prefix="/api/v1")
app.include_router(savings.router, prefix="/api/v1")
app.include_router(reports.router, prefix="/api/v1")
app.include_router(community.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1")
app.include_router(ai.router, prefix="/api/v1")
app.include_router(profile.router, prefix="/api/v1")
app.include_router(notifications.router, prefix="/api/v1")
