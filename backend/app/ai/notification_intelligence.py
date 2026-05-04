"""AI Feature #10: Notification Intelligence — AI decides when and what to notify."""
from openai import AsyncOpenAI
from app.config import settings
from app.ai.prompts import get_notification_intelligence_prompt
import json


client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


async def decide_notification(first_name: str, currency: str, context: str) -> dict:
    """
    Analyses recent user activity and decides whether a notification should be sent,
    what type it should be, and what it should say.
    """
    prompt = get_notification_intelligence_prompt(first_name, currency, context)

    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL_LIGHT,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=300,
        temperature=0.3,
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {"should_notify": False, "type": None, "title": None, "message": None, "send_email": False}
