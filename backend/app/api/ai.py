from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.core.dependencies import get_current_user, get_current_pro_user
from app.models.user import User
from app.schemas.ai import MoneyPersonalityQuizResponse, MoneyPersonalityResult, InvestmentHint
from app.ai.money_personality import generate_personality_profile, PERSONALITY_QUIZ_QUESTIONS
from app.ai.investment_hints import generate_investment_hint
from app.ai.notification_intelligence import decide_notification
from app.ai.spending_alerts import generate_spending_alert
from app.services.report_service import ReportService
from app.models.money_personality import MoneyPersonalityProfile
from sqlalchemy import select

router = APIRouter(prefix="/ai", tags=["AI Features"])


@router.get("/personality/questions")
async def get_quiz_questions(current_user: User = Depends(get_current_user)):
    """AI Feature #3: Return money personality quiz questions."""
    return {"questions": PERSONALITY_QUIZ_QUESTIONS}


@router.post("/personality/analyse")
async def analyse_personality(
    data: MoneyPersonalityQuizResponse,
    current_user: User = Depends(get_current_pro_user),
    db: AsyncSession = Depends(get_db),
):
    """AI Feature #3: Analyse money personality from quiz answers."""
    result = await generate_personality_profile(current_user.first_name, data.answers)

    # Persist the personality profile
    existing = await db.execute(
        select(MoneyPersonalityProfile).where(MoneyPersonalityProfile.user_id == current_user.id)
    )
    profile = existing.scalar_one_or_none()

    import json
    if profile:
        profile.personality_type = result.get("personality_type", "")
        profile.description = result.get("description", "")
        profile.strengths = json.dumps(result.get("strengths", []))
        profile.weaknesses = json.dumps(result.get("weaknesses", []))
        profile.advice = result.get("advice", "")
        profile.quiz_responses = json.dumps(data.answers)
    else:
        profile = MoneyPersonalityProfile(
            user_id=current_user.id,
            personality_type=result.get("personality_type", ""),
            description=result.get("description", ""),
            strengths=json.dumps(result.get("strengths", [])),
            weaknesses=json.dumps(result.get("weaknesses", [])),
            advice=result.get("advice", ""),
            quiz_responses=json.dumps(data.answers),
        )
        db.add(profile)

    # Update user's personality badge
    current_user.money_personality = result.get("personality_type")
    await db.commit()

    return result


@router.get("/investment-hint")
async def get_investment_hint(
    current_user: User = Depends(get_current_pro_user),
    db: AsyncSession = Depends(get_db),
):
    """AI Feature #9: Get an East Africa-relevant investment hint."""
    service = ReportService(db)
    report = await service.get_report(current_user, "month")

    hint = await generate_investment_hint(
        first_name=current_user.first_name,
        currency=current_user.currency_code,
        country=current_user.country,
        savings_rate=report.savings_rate,
        avg_monthly_savings=report.net_balance,
    )
    return hint


@router.post("/spending-alert")
async def get_spending_alert(
    category: str,
    spent: float,
    budget: float,
    current_user: User = Depends(get_current_pro_user),
):
    """AI Feature #2: Generate a smart spending alert."""
    message = await generate_spending_alert(
        first_name=current_user.first_name,
        currency=current_user.currency_code,
        category=category,
        spent=spent,
        budget=budget,
    )
    return {"alert_message": message}
