"""AI Feature #9: Investment Hints — unlocked after demonstrated financial discipline."""
from openai import AsyncOpenAI
from app.config import settings
from app.ai.prompts import get_investment_hint_prompt
import json


client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


async def generate_investment_hint(
    first_name: str,
    currency: str,
    country: str,
    savings_rate: float,
    avg_monthly_savings: float,
) -> dict:
    """
    Generates an East Africa-relevant investment hint.
    Only triggered after the user demonstrates consistent financial discipline.
    """
    prompt = get_investment_hint_prompt(first_name, currency, country, savings_rate, avg_monthly_savings)

    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL_HEAVY,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=400,
        temperature=0.4,
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content or ""
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {
            "title": "Consider a SACCO",
            "description": "Savings and Credit Cooperative Organisations (SACCOs) offer competitive returns and loans.",
            "risk_level": "low",
            "relevant_to_country": country,
            "minimum_amount": None,
            "how_to_start": "Ask your employer or community about registered SACCOs in your area.",
        }
