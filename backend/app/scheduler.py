"""
Lumi Scheduler — runs background jobs for streak management and notifications.
Uses APScheduler with AsyncIO scheduler so it runs inside the FastAPI event loop.
"""
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import AsyncSessionLocal
from app.models.user import User, SubscriptionTier
from app.models.streak import Streak
from app.models.transaction import Transaction
from app.models.savings_goal import SavingsGoal, GoalStatus
from app.models.notification import Notification, NotificationType
from datetime import date, datetime, timedelta
import logging

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler(timezone="Africa/Nairobi")


async def _create_notification(
    session: AsyncSession,
    user_id,
    notification_type: NotificationType,
    title: str,
    message: str,
) -> None:
    """Create an in-app notification for a user."""
    notif = Notification(
        user_id=user_id,
        type=notification_type,
        title=title,
        message=message,
    )
    session.add(notif)


async def check_streaks_and_notify() -> None:
    """
    Runs daily at 20:00 EAT (8 PM Kampala time).
    - Warns users who haven't checked in today
    - Resets streaks for users who missed yesterday entirely
    """
    logger.info("Running daily streak check...")
    today = date.today()
    yesterday = today - timedelta(days=1)

    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(User, Streak)
            .join(Streak, Streak.user_id == User.id)
            .where(User.is_active == True)
        )
        rows = result.all()

        for user, streak in rows:
            try:
                # User hasn't checked in today — send warning
                if streak.last_activity_date != today and streak.current_streak > 0:
                    await _create_notification(
                        session,
                        user.id,
                        NotificationType.STREAK_REMINDER,
                        title=f"🔥 {user.first_name}, your {streak.current_streak}-day streak is at risk!",
                        message=f"You haven't logged any savings activity today. Add a transaction or update a goal before midnight to keep your {streak.current_streak}-day streak alive!",
                    )

                # User missed yesterday entirely — reset streak
                if (
                    streak.last_activity_date is not None
                    and streak.last_activity_date < yesterday
                    and streak.current_streak > 0
                ):
                    old_streak = streak.current_streak
                    streak.current_streak = 0
                    await _create_notification(
                        session,
                        user.id,
                        NotificationType.STREAK_REMINDER,
                        title=f"💔 {user.first_name}, your streak has reset",
                        message=f"Your {old_streak}-day streak ended because you missed a day. Don't worry — start fresh today! Every streak starts with day 1.",
                    )

            except Exception as e:
                logger.error(f"Error processing streak for user {user.id}: {e}")

        await session.commit()
    logger.info("Streak check complete.")


async def check_savings_goals_and_notify() -> None:
    """
    Runs daily at 09:00 EAT.
    Notifies users about goals that are close to deadline or close to completion.
    """
    logger.info("Running savings goals notification check...")
    today = date.today()
    week_from_now = today + timedelta(days=7)

    async with AsyncSessionLocal() as session:
        # Goals with deadline in the next 7 days
        result = await session.execute(
            select(SavingsGoal, User)
            .join(User, User.id == SavingsGoal.user_id)
            .where(
                SavingsGoal.status == GoalStatus.ACTIVE,
                SavingsGoal.deadline != None,
                SavingsGoal.deadline <= week_from_now,
                SavingsGoal.deadline >= today,
            )
        )
        for goal, user in result.all():
            days_left = (goal.deadline - today).days
            pct = round(float(goal.current_amount) / float(goal.target_amount) * 100, 0) if goal.target_amount > 0 else 0
            try:
                await _create_notification(
                    session,
                    user.id,
                    NotificationType.SAVINGS_MILESTONE,
                    title=f"⏰ {user.first_name}, '{goal.name}' deadline in {days_left} day{'s' if days_left != 1 else ''}!",
                    message=f"You're at {pct:.0f}% of your {user.currency_code} {float(goal.target_amount):,.0f} goal. {'You\'re almost there — push through!' if pct >= 80 else 'Keep saving daily to reach your target in time!'}",
                )
            except Exception as e:
                logger.error(f"Error notifying goal deadline for user {user.id}: {e}")

        # Goals just hit 100%
        result2 = await session.execute(
            select(SavingsGoal, User)
            .join(User, User.id == SavingsGoal.user_id)
            .where(
                SavingsGoal.status == GoalStatus.COMPLETED,
                SavingsGoal.updated_at >= datetime.utcnow() - timedelta(hours=24),
            )
        )
        for goal, user in result2.all():
            try:
                await _create_notification(
                    session,
                    user.id,
                    NotificationType.GOAL_ACHIEVED,
                    title=f"🏆 {user.first_name}, you crushed your goal!",
                    message=f"You've fully saved {user.currency_code} {float(goal.target_amount):,.0f} for '{goal.name}'. That's incredible discipline — you've earned your Goal Crusher badge!",
                )
            except Exception as e:
                logger.error(f"Error notifying goal completion for user {user.id}: {e}")

        await session.commit()
    logger.info("Savings goals check complete.")


async def send_weekly_report_notifications() -> None:
    """
    Runs every Monday at 07:00 EAT.
    Sends a weekly summary notification to all active users.
    """
    logger.info("Sending weekly report notifications...")
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(User).where(User.is_active == True)
        )
        users = result.scalars().all()

        for user in users:
            try:
                await _create_notification(
                    session,
                    user.id,
                    NotificationType.WEEKLY_REPORT,
                    title=f"📊 {user.first_name}, your weekly financial report is ready",
                    message="Your weekly summary is ready. Head to Reports to see your income, expenses, savings rate, and AI insights for the past week.",
                )
            except Exception as e:
                logger.error(f"Error sending weekly report notif for user {user.id}: {e}")

        await session.commit()
    logger.info("Weekly reports sent.")


async def check_budget_alerts() -> None:
    """
    Runs daily at 18:00 EAT.
    Checks if users are overspending in any category this month.
    """
    logger.info("Running budget alert check...")
    from sqlalchemy import func, extract
    from app.models.transaction import Transaction, TransactionType, TransactionCategory

    now = datetime.utcnow()

    # Simple budget thresholds — warn if food/transport > 40% of month's expenses
    WARNING_CATEGORIES = {
        TransactionCategory.FOOD: ("food", 0.40),
        TransactionCategory.ENTERTAINMENT: ("entertainment", 0.20),
        TransactionCategory.SHOPPING: ("shopping", 0.30),
    }

    async with AsyncSessionLocal() as session:
        user_result = await session.execute(
            select(User).where(User.is_active == True)
        )
        users = user_result.scalars().all()

        for user in users:
            try:
                # Get total expenses this month
                total_result = await session.execute(
                    select(func.sum(Transaction.amount)).where(
                        Transaction.user_id == user.id,
                        Transaction.type == TransactionType.EXPENSE,
                        extract("month", Transaction.transaction_date) == now.month,
                        extract("year", Transaction.transaction_date) == now.year,
                    )
                )
                total = float(total_result.scalar() or 0)
                if total == 0:
                    continue

                for category, (label, threshold) in WARNING_CATEGORIES.items():
                    cat_result = await session.execute(
                        select(func.sum(Transaction.amount)).where(
                            Transaction.user_id == user.id,
                            Transaction.type == TransactionType.EXPENSE,
                            Transaction.category == category,
                            extract("month", Transaction.transaction_date) == now.month,
                            extract("year", Transaction.transaction_date) == now.year,
                        )
                    )
                    cat_total = float(cat_result.scalar() or 0)
                    if cat_total == 0:
                        continue

                    pct = cat_total / total
                    if pct > threshold:
                        await _create_notification(
                            session,
                            user.id,
                            NotificationType.SPENDING_ALERT,
                            title=f"⚠️ {user.first_name}, high {label} spending this month",
                            message=f"Your {label} spending ({user.currency_code} {cat_total:,.0f}) is {pct*100:.0f}% of your total expenses — above the recommended {threshold*100:.0f}%. Consider cutting back to hit your savings goals.",
                        )
            except Exception as e:
                logger.error(f"Error checking budget for user {user.id}: {e}")

        await session.commit()
    logger.info("Budget alert check complete.")


def start_scheduler() -> None:
    """Register all scheduled jobs and start the scheduler."""

    # Daily streak check + warning — 8 PM Kampala
    scheduler.add_job(
        check_streaks_and_notify,
        CronTrigger(hour=20, minute=0, timezone="Africa/Nairobi"),
        id="streak_check",
        replace_existing=True,
    )

    # Daily savings goals check — 9 AM Kampala
    scheduler.add_job(
        check_savings_goals_and_notify,
        CronTrigger(hour=9, minute=0, timezone="Africa/Nairobi"),
        id="goals_check",
        replace_existing=True,
    )

    # Weekly report — every Monday 7 AM Kampala
    scheduler.add_job(
        send_weekly_report_notifications,
        CronTrigger(day_of_week="mon", hour=7, minute=0, timezone="Africa/Nairobi"),
        id="weekly_report",
        replace_existing=True,
    )

    # Budget alerts — 6 PM Kampala daily
    scheduler.add_job(
    check_streaks_and_notify,
    CronTrigger(hour=23, minute=30, timezone="Africa/Nairobi"),
    id="streak_check",
    replace_existing=True,
)

    scheduler.start()
    logger.info("Lumi scheduler started — streak checks, goal reminders, budget alerts active.")


def stop_scheduler() -> None:
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Lumi scheduler stopped.")
