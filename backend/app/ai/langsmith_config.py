import os
from app.config import settings


def configure_langsmith() -> None:
    """
    Configure LangSmith tracing for all LangChain and LangGraph calls.
    Every AI interaction in Lumi is traced through LangSmith for observability.
    """
    os.environ["LANGCHAIN_TRACING_V2"] = str(settings.LANGCHAIN_TRACING_V2).lower()
    os.environ["LANGCHAIN_ENDPOINT"] = settings.LANGCHAIN_ENDPOINT
    os.environ["LANGCHAIN_API_KEY"] = settings.LANGCHAIN_API_KEY
    os.environ["LANGCHAIN_PROJECT"] = settings.LANGCHAIN_PROJECT
