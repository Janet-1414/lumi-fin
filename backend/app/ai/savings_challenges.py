"""AI Feature #6: Personalised Savings Challenges — generated from spending habits."""
from openai import AsyncOpenAI
from app.config import settings
from app.ai.prompts import get_savings_challenge_prompt
import json


client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


async def generate_challenge(first_name: str, currency: str, spending_data: str) -> dict:
    """
    Generates a custom savings challenge based on the user's actual spending patterns.
    """
    prompt = get_savings_challenge_prompt(first_name, currency, spending_data)

    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL_LIGHT,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=500,
        temperature=0.7,
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content or ""
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {
            "title": "7-Day No-Spend Challenge",
            "description": "Avoid non-essential purchases for 7 days.",
            "target_amount": 0,
            "duration_days": 7,
            "tips": ["Cook at home", "Use public transport", "Track every shilling"],
        }
