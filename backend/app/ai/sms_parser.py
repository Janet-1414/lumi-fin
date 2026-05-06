"""AI Feature #1b: Mobile Money SMS Parser — powered by OpenAI GPT-4o-mini."""
from openai import AsyncOpenAI
from app.config import settings
from app.ai.prompts import get_sms_parser_prompt
import json


client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


async def parse_sms(sms_text: str) -> dict:
    """
    Parses a Mobile Money SMS (MTN, Airtel, M-PESA) and extracts transaction data.
    Uses GPT-4o-mini for cost efficiency on this lighter task.
    """
    prompt = get_sms_parser_prompt()

    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL_LIGHT,
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": sms_text},
        ],
        max_tokens=300,
        temperature=0,
    )

    content = (response.choices[0].message.content or "").strip()
    if content.startswith("```"):
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]
    content = content.strip()

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {"error": "Could not parse SMS. Please enter manually."}
