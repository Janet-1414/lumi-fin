"""AI Feature #2: Smart Spending Alerts — real-time budget warnings via OpenAI."""
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from app.config import settings
from app.ai.prompts import get_spending_alert_prompt
from pydantic import SecretStr



async def generate_spending_alert(
    first_name: str, currency: str, category: str, spent: float, budget: float
) -> str:
    """
    Uses LangChain's ChatOpenAI to generate a personalised spending alert.
    Demonstrates LangChain usage for single-turn, prompt-driven tasks.
    """
    llm = ChatOpenAI(
        model=settings.OPENAI_MODEL_LIGHT,
        temperature=0.6,
        api_key=SecretStr(settings.OPENAI_API_KEY),

    )
    prompt = get_spending_alert_prompt(first_name, currency, category, spent, budget)
    response = await llm.ainvoke([HumanMessage(content=prompt)])
    return str(response.content)
