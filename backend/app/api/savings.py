from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from app.db.database import get_db
from app.core.dependencies import get_current_user, get_current_pro_user
from app.models.user import User
from app.models.notification import NotificationType
from app.schemas.savings import (
    SavingsGoalCreateRequest, SavingsGoalUpdateRequest,
    SavingsGoalResponse, StreakResponse,
)
from app.services.savings_service import SavingsService
from app.services.notification_service import NotificationService
from app.ai.savings_coach import generate_coaching_message
from app.ai.savings_challenges import generate_challenges
from app.services.transaction_service import TransactionService  # noqa: F401
from datetime import date

router = APIRouter(prefix="/savings", tags=["Savings"])


@router.get("/goals", response_model=list[SavingsGoalResponse])
async def get_goals(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = SavingsService(db)
    goals = await service.get_goals(current_user)
    result = []
    for g in goals:
        g_dict = {
            "id": g.id, "user_id": g.user_id, "name": g.name, "description": g.description,
            "target_amount": float(g.target_amount), "current_amount": float(g.current_amount),
            "deadline": g.deadline, "status": g.status, "emoji": g.emoji,
            "ai_coached": g.ai_coached,
            "weekly_target": float(g.weekly_target) if g.weekly_target else None,
            "progress_percentage": round(float(g.current_amount) / float(g.target_amount) * 100, 2) if float(g.target_amount) > 0 else 0,
            "created_at": g.created_at,
        }
        result.append(SavingsGoalResponse(**g_dict))
    return result


@router.post("/goals", response_model=SavingsGoalResponse, status_code=status.HTTP_201_CREATED)
async def create_goal(
    data: SavingsGoalCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = SavingsService(db)
    goal = await service.create_goal(current_user, data)
    await service.update_streak(current_user)
    pct = round(float(goal.current_amount) / float(goal.target_amount) * 100, 2) if float(goal.target_amount) > 0 else 0
    return SavingsGoalResponse(
        id=goal.id, user_id=goal.user_id, name=goal.name, description=goal.description,
        target_amount=float(goal.target_amount), current_amount=float(goal.current_amount),
        deadline=goal.deadline, status=goal.status, emoji=goal.emoji,
        ai_coached=goal.ai_coached, weekly_target=None, progress_percentage=pct,
        created_at=goal.created_at,
    )


@router.patch("/goals/{goal_id}", response_model=SavingsGoalResponse)
async def update_goal(
    goal_id: uuid.UUID,
    data: SavingsGoalUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = SavingsService(db)
    notif_service = NotificationService(db)
    await service.update_streak(current_user)
    goal = await service.update_goal(current_user, goal_id, data)

    from app.models.savings_goal import GoalStatus
    if goal.status == GoalStatus.COMPLETED:
        await notif_service.create_notification(
            user=current_user,
            notification_type=NotificationType.GOAL_ACHIEVED,
            title=f"🏆 Goal crushed, {current_user.first_name}!",
            message=f"You've fully saved {current_user.currency_code} {float(goal.target_amount):,.0f} for '{goal.name}'. Incredible discipline!",
        )

    pct = round(float(goal.current_amount) / float(goal.target_amount) * 100, 2) if float(goal.target_amount) > 0 else 0
    return SavingsGoalResponse(
        id=goal.id, user_id=goal.user_id, name=goal.name, description=goal.description,
        target_amount=float(goal.target_amount), current_amount=float(goal.current_amount),
        deadline=goal.deadline, status=goal.status, emoji=goal.emoji,
        ai_coached=goal.ai_coached,
        weekly_target=float(goal.weekly_target) if goal.weekly_target else None,
        progress_percentage=pct, created_at=goal.created_at,
    )


@router.delete("/goals/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal(
    goal_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = SavingsService(db)
    await service.delete_goal(current_user, goal_id)


@router.get("/streak", response_model=StreakResponse)
async def get_streak(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = SavingsService(db)
    streak = await service.get_streak(current_user)
    return StreakResponse(
        current_streak=streak.current_streak,
        longest_streak=streak.longest_streak,
        last_activity_date=streak.last_activity_date,
        total_days_active=streak.total_days_active,
    )


@router.post("/streak/checkin", response_model=StreakResponse)
async def checkin_streak(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Called automatically when the user logs a transaction or updates a goal.
    Updates the streak and sends a milestone notification if applicable.
    """
    service = SavingsService(db)
    notif_service = NotificationService(db)
    streak = await service.update_streak(current_user)

    if streak.current_streak == 7:
        await notif_service.create_notification(
            current_user,
            NotificationType.SAVINGS_MILESTONE,
            title=f"🔥 7-day streak, {current_user.first_name}!",
            message="You've been saving consistently for a whole week. Keep this energy going — you're building real financial discipline!",
        )
    elif streak.current_streak == 14:
        await notif_service.create_notification(
            current_user,
            NotificationType.SAVINGS_MILESTONE,
            title=f"⚡ 14-day streak, {current_user.first_name}!",
            message="Two weeks of consistent saving! You're forming a powerful money habit that will change your financial future.",
        )
    elif streak.current_streak == 30:
        await notif_service.create_notification(
            current_user,
            NotificationType.SAVINGS_MILESTONE,
            title=f"👑 30-day streak, {current_user.first_name}! You're a champion!",
            message="A full month of daily saving activity. This is the level of discipline that builds real wealth. You've earned the Month Streak badge!",
        )

    return StreakResponse(
        current_streak=streak.current_streak,
        longest_streak=streak.longest_streak,
        last_activity_date=streak.last_activity_date,
        total_days_active=streak.total_days_active,
    )


@router.get("/badges")
async def get_badges(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = SavingsService(db)
    badges = await service.get_badges(current_user)
    return [
        {"id": str(b.id), "name": b.name.value, "badge_type": b.badge_type.value,
         "description": b.description, "unlocked_at": b.unlocked_at.isoformat()}
        for b in badges
    ]


# AI Feature #5: Savings Coach (Pro only)
@router.post("/goals/{goal_id}/coach", response_model=dict)
async def get_coaching(
    goal_id: uuid.UUID,
    current_user: User = Depends(get_current_pro_user),
    db: AsyncSession = Depends(get_db),
):
    service = SavingsService(db)
    goal = await service.get_goal_by_id(current_user, goal_id)
    message = await generate_coaching_message(
        first_name=current_user.first_name,
        currency=current_user.currency_code,
        goal_name=goal.name,
        target=float(goal.target_amount),
        current=float(goal.current_amount),
        deadline=goal.deadline,
    )
    return {"coaching_message": message, "goal_id": str(goal_id)}


# AI Feature #6: Savings Challenges — returns 3 options (Pro only)
@router.post("/challenges/generate", response_model=list)
async def generate_ai_challenge(
    current_user: User = Depends(get_current_pro_user),
    db: AsyncSession = Depends(get_db),
):
    """Generates 3 distinct AI savings challenges for the user to choose from."""
    tx_service = TransactionService(db)
    summary = await tx_service.get_summary(current_user, "month")
    spending_data = (
        f"Monthly expenses: {current_user.currency_code} {summary.total_expenses:,.0f}, "
        f"Income: {current_user.currency_code} {summary.total_income:,.0f}"
    )
    challenges = await generate_challenges(
        current_user.first_name,
        current_user.currency_code,
        spending_data,
    )
    return challenges
