"""AI Feature #3: Money Personality Profile — quiz-based profiling via OpenAI."""
from openai import AsyncOpenAI
from app.config import settings
from app.ai.prompts import get_money_personality_prompt
import json


client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

PERSONALITY_QUIZ_QUESTIONS = [
    "When you receive money, what's the first thing you think about?",
    "You see something you want but can't fully afford. What do you do?",
    "How do you feel when you check your bank balance?",
    "What does financial success look like to you in 5 years?",
    "How do you handle unexpected expenses?",
]


async def generate_personality_profile(first_name: str, answers: list[str]) -> dict:
    """
    Analyses quiz answers to generate a money personality profile.
    Used to tailor all AI advice and challenges to the user's financial style.
    """
    prompt = get_money_personality_prompt(first_name, answers)

    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL_HEAVY,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=600,
        temperature=0.5,
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content or ""
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {
            "personality_type": "The Planner",
            "description": "You are thoughtful about your finances.",
            "strengths": ["Careful", "Deliberate", "Goal-oriented"],
            "weaknesses": ["Can overthink", "Sometimes misses opportunities", "Risk-averse"],
            "advice": f"{first_name}, keep building on your planning skills while staying open to calculated risks.",
        }
