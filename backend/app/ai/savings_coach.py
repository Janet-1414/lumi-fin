"""AI Feature #5: AI Savings Coach — tracks goals and coaches users via OpenAI."""
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from app.config import settings
from app.ai.prompts import get_savings_coach_prompt
from datetime import date
from pydantic import SecretStr


async def generate_coaching_message(
    first_name: str,
    currency: str,
    goal_name: str,
    target: float,
    current: float,
    deadline: date | None,
) -> str:
    """
    Uses LangChain ChatOpenAI with a system + human message pattern to
    generate personalised savings coaching messages.
    """
    llm = ChatOpenAI(
    model=settings.OPENAI_MODEL_LIGHT,
    temperature=0.6,
    api_key=SecretStr(settings.OPENAI_API_KEY),
)

    deadline_days = None
    if deadline:
        deadline_days = (deadline - date.today()).days

    prompt = get_savings_coach_prompt(first_name, currency, goal_name, target, current, deadline_days)

    messages = [
        SystemMessage(content="You are Lumi's savings coach for East African youth. Be warm and motivating."),
        HumanMessage(content=prompt),
    ]

    response = await llm.ainvoke(messages)
    return str(response.content)
