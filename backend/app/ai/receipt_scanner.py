"""AI Feature #1: Receipt and SMS Scanner — powered by OpenAI GPT-4o vision."""
from openai import AsyncOpenAI
from app.config import settings
from app.ai.prompts import get_receipt_scanner_prompt
import json
import base64


client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


async def scan_receipt(image_base64: str, image_type: str = "image/jpeg") -> dict:
    """
    Scans a receipt image using GPT-4o vision and extracts transaction data.
    Returns a dict ready to be saved as a Transaction.
    """
    prompt = get_receipt_scanner_prompt()

    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL_VISION,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{image_type};base64,{image_base64}",
                            "detail": "high",
                        },
                    },
                    {"type": "text", "text": prompt},
                ],
            }
        ],
        max_tokens=500,
        temperature=0,
    )

    content = response.choices[0].message.content.strip()

    # Strip markdown code fences if present
    if content.startswith("```"):
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]
    content = content.strip()

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {"error": "Could not parse receipt. Please enter manually."}
