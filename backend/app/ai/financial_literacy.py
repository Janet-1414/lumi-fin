"""AI Feature #4: Personalised Financial Literacy — lessons from real spending data."""
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from app.config import settings
from app.ai.prompts import get_financial_literacy_prompt


async def generate_lesson(first_name: str, currency: str, spending_pattern: str) -> str:
    """
    Uses a LangChain LCEL chain to generate a personalised financial lesson.
    Demonstrates LangChain Expression Language (LCEL) chain composition.
    """
    llm = ChatOpenAI(
        model=settings.OPENAI_MODEL_LIGHT,
        temperature=0.6,
        api_key=settings.OPENAI_API_KEY,
    )

    prompt_template = ChatPromptTemplate.from_messages([
        ("system", "You are Lumi, a financial literacy coach for East African youth."),
        ("human", "{lesson_prompt}"),
    ])

    # LCEL chain: prompt | llm | parser
    chain = prompt_template | llm | StrOutputParser()

    lesson_prompt = get_financial_literacy_prompt(first_name, currency, spending_pattern)
    result = await chain.ainvoke({"lesson_prompt": lesson_prompt})
    return result
