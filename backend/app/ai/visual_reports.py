"""AI Feature #8: Visual Reports — AI-written summaries for charts."""
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from app.config import settings
from app.ai.prompts import get_visual_report_prompt
from pydantic import SecretStr



async def generate_report_summary(
    first_name: str,
    currency: str,
    period: str,
    income: float,
    expenses: float,
    top_categories: list,
) -> str:
    """
    Uses a LangChain LCEL chain to generate a written AI report summary.
    This summary accompanies the visual charts on the Reports page.
    """
    llm = ChatOpenAI(
        model=settings.OPENAI_MODEL_LIGHT,
        temperature=0.6,
        api_key=SecretStr(settings.OPENAI_API_KEY),
    )

    prompt_template = ChatPromptTemplate.from_messages([
        ("system", "You are Lumi, an AI financial advisor for East African youth. Write clear, encouraging financial summaries."),
        ("human", "{report_prompt}"),
    ])

    chain = prompt_template | llm | StrOutputParser()

    report_prompt = get_visual_report_prompt(first_name, currency, period, income, expenses, top_categories)
    result: str = await chain.ainvoke({"report_prompt": report_prompt})
    return result
