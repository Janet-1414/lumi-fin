"""AI Feature #11: Weekly Community Pulse — anonymous collective AI summary."""
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from app.config import settings
from app.ai.prompts import get_community_pulse_prompt


async def generate_community_pulse(
    total_savers: int,
    total_goals_achieved: int,
    avg_savings_rate: float,
    top_challenge: str,
) -> str:
    """
    Uses LangChain ChatOpenAI to generate a weekly anonymous community pulse summary.
    Aggregated data only — no individual amounts or names ever included.
    """
    llm = ChatOpenAI(
        model=settings.OPENAI_MODEL_LIGHT,
        temperature=0.6,
        api_key=settings.OPENAI_API_KEY,
    )

    prompt = get_community_pulse_prompt(total_savers, total_goals_achieved, avg_savings_rate, top_challenge)
    response = await llm.ainvoke([HumanMessage(content=prompt)])
    return response.content
