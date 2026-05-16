"""AI Feature #6: Personalised Savings Challenges — generates 3 varied options."""
from openai import AsyncOpenAI
from app.config import settings
import json

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


async def generate_challenge(first_name: str, currency: str, spending_data: str) -> dict:
    """
    Generates a single challenge — kept for backward compatibility.
    Calls generate_challenges and returns the first one.
    """
    challenges = await generate_challenges(first_name, currency, spending_data)
    return challenges[0] if challenges else _fallback()[0]


async def generate_challenges(first_name: str, currency: str, spending_data: str) -> list[dict]:
    """
    Generates 3 distinct savings challenges with different approaches:
    - One easy/short (7 days)
    - One medium (14 days)
    - One ambitious (30 days)
    Each must be genuinely different in strategy, not just duration.
    """
    prompt = f"""Generate exactly 3 distinct personalised savings challenges for {first_name}, a young East African user.

User spending data: {spending_data}
Currency: {currency}

Rules:
- Challenge 1: Short and easy (7 days), focused on one small habit change
- Challenge 2: Medium difficulty (14 days), requires more consistency
- Challenge 3: Ambitious (30 days), significant lifestyle change
- Each challenge must have a completely different strategy and focus area
- Make them specific to East African context (boda rides, mobile money fees, market shopping, eating out, airtime)
- Never generate the same type of challenge twice in one response

Return ONLY a valid JSON array with exactly 3 objects, each with these fields:
[
  {{
    "title": "short challenge title max 50 chars",
    "description": "2 sentences describing what to do",
    "duration_days": 7,
    "target_amount": null or a number,
    "tips": ["tip 1", "tip 2", "tip 3"],
    "difficulty": "Easy"
  }},
  ...
]

Return ONLY the JSON array, nothing else."""

    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL_LIGHT,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1000,
        temperature=0.9,  # Higher temperature = more variety
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content or ""
    try:
        parsed = json.loads(content)
        # Handle if OpenAI wraps in an object
        if isinstance(parsed, dict):
            for key in parsed:
                if isinstance(parsed[key], list):
                    parsed = parsed[key]
                    break
        if isinstance(parsed, list) and len(parsed) >= 1:
            return parsed[:3]
        return _fallback()
    except json.JSONDecodeError:
        return _fallback()


def _fallback() -> list[dict]:
    return [
        {
            "title": "7-Day No Unnecessary Spend",
            "description": "For 7 days, buy only essentials — food, transport, utilities. Skip everything else.",
            "duration_days": 7,
            "target_amount": None,
            "tips": ["Delete shopping apps temporarily", "Cook at home", "Track every purchase"],
            "difficulty": "Easy",
        },
        {
            "title": "14-Day Mobile Money Fee Saver",
            "description": "For 14 days, plan all withdrawals in bulk to avoid multiple Mobile Money fees.",
            "duration_days": 14,
            "target_amount": None,
            "tips": ["Withdraw once a week", "Use float where possible", "Note fees you avoid"],
            "difficulty": "Medium",
        },
        {
            "title": "30-Day Save 20% Challenge",
            "description": "Every time you receive money, immediately set aside 20% before spending anything.",
            "duration_days": 30,
            "target_amount": None,
            "tips": ["Transfer savings immediately", "Tell a friend to hold you accountable", "Track daily"],
            "difficulty": "Ambitious",
        },
    ]
