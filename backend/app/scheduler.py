"""
Lumi Scheduler — runs background notification jobs throughout the day.
All times are East Africa Time (EAT, UTC+3).

Daily schedule:
  07:00 — Good morning greeting + daily intention
  12:00 — Midday spending check
  15:00 — Afternoon financial tip
  18:00 — Budget alert check
  20:00 — Evening savings encouragement
  23:30 — Streak warning before midnight
"""
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy import select, func, extract
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import AsyncSessionLocal
from app.models.user import User
from app.models.streak import Streak
from app.models.transaction import Transaction, TransactionType
from app.models.savings_goal import SavingsGoal, GoalStatus
from app.models.notification import Notification, NotificationType
from datetime import date, datetime, timedelta
import random
import logging

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler(timezone="Africa/Nairobi")


async def _notify(
    session: AsyncSession,
    user_id,
    notification_type: NotificationType,
    title: str,
    message: str,
) -> None:
    """Create an in-app notification."""
    session.add(Notification(
        user_id=user_id,
        type=notification_type,
        title=title,
        message=message,
    ))


# ── 07:00 — Good morning greeting
async def morning_greeting() -> None:
    logger.info("Sending morning greetings...")

    MORNING_INTENTIONS = [
        "Today is a new chance to make a smart money decision. What's one thing you can do differently today?",
        "Every shilling you save today is a step closer to your goals. Start strong!",
        "Financial freedom starts with small daily decisions. Make today count.",
        "Before you spend anything today, ask yourself — is this a need or a want?",
        "Your future self will thank you for the money decisions you make today.",
        "One good financial habit a day keeps financial stress away. What's yours today?",
        "The best time to save was yesterday. The second best time is right now.",
    ]

    GREETINGS = [
        "Good morning", "Rise and shine", "Hello", "Good morning",
        "A new day begins", "Morning", "Good morning",
    ]

    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(User, Streak)
            .join(Streak, Streak.user_id == User.id)
            .where(User.is_active == True)
        )
        for user, streak in result.all():
            try:
                greeting = random.choice(GREETINGS)
                intention = random.choice(MORNING_INTENTIONS)
                streak_msg = ""
                if streak.current_streak > 0:
                    streak_msg = f" You're on a {streak.current_streak}-day streak — keep it alive today!"

                await _notify(
                    session, user.id,
                    NotificationType.STREAK_REMINDER,
                    title=f"☀️ {greeting}, {user.first_name}!",
                    message=f"{intention}{streak_msg}",
                )
            except Exception as e:
                logger.error(f"Morning greeting error for {user.id}: {e}")
        await session.commit()
    logger.info("Morning greetings sent.")


# ── 12:00 — Midday spending check
async def midday_check() -> None:
    logger.info("Running midday spending check...")

    ENCOURAGEMENTS = [
        "You're doing great — keep tracking every expense!",
        "Halfway through the day. Stay mindful of your spending.",
        "Every transaction you log brings you closer to financial clarity.",
        "Small expenses add up. Keep your eyes open this afternoon!",
    ]

    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(User).where(User.is_active == True)
        )
        users = result.scalars().all()

        for user in users:
            try:
                now = datetime.utcnow()
                # Get today's spending
                today_expenses = await session.execute(
                    select(func.sum(Transaction.amount)).where(
                        Transaction.user_id == user.id,
                        Transaction.type == TransactionType.EXPENSE,
                        func.date(Transaction.transaction_date) == date.today(),
                    )
                )
                spent_today = float(today_expenses.scalar() or 0)

                # Get today's income
                today_income = await session.execute(
                    select(func.sum(Transaction.amount)).where(
                        Transaction.user_id == user.id,
                        Transaction.type == TransactionType.INCOME,
                        func.date(Transaction.transaction_date) == date.today(),
                    )
                )
                earned_today = float(today_income.scalar() or 0)

                if spent_today > 0:
                    msg = (
                        f"You've spent {user.currency_code} {spent_today:,.0f} so far today. "
                        f"{random.choice(ENCOURAGEMENTS)}"
                    )
                    if earned_today > 0:
                        msg += f" Income logged today: {user.currency_code} {earned_today:,.0f}."
                else:
                    msg = (
                        f"No transactions logged yet today, {user.first_name}. "
                        "Remember to track every expense — even small ones add up!"
                    )

                await _notify(
                    session, user.id,
                    NotificationType.SPENDING_ALERT,
                    title=f"📊 Midday check-in, {user.first_name}",
                    message=msg,
                )
            except Exception as e:
                logger.error(f"Midday check error for {user.id}: {e}")
        await session.commit()
    logger.info("Midday checks sent.")


# ── 15:00 — Afternoon financial tip
async def afternoon_tip() -> None:
    logger.info("Sending afternoon tips...")

    TIPS = [
        ("Budget your airtime", "Before buying airtime, ask — do I really need this much right now? Buying in bulk usually saves money over daily top-ups."),
        ("The boda boda trap", "Boda rides are convenient but expensive over time. Walking 10 minutes instead of riding once a day saves thousands per month."),
        ("Mobile Money fees", "Plan your withdrawals in bulk. Withdrawing UGX 100,000 once costs far less in fees than withdrawing UGX 10,000 ten times."),
        ("Cook at home", "Buying lunch daily at a restaurant can cost 3x more than cooking the same meal at home. Even cooking twice a week makes a difference."),
        ("The 24-hour rule", "Before any non-essential purchase above UGX 20,000, wait 24 hours. Most impulse buys feel unnecessary the next day."),
        ("Track every shilling", "You can't manage what you don't measure. Every transaction logged in Lumi gives your AI a clearer picture of your habits."),
        ("Emergency fund first", "Before investing or spending on wants, build 3 months of expenses as an emergency fund. This is your financial safety net."),
        ("SACCOs are powerful", "A SACCO membership lets you save and borrow at lower rates than banks. Ask around — your employer or church likely has one."),
        ("Avoid buying on credit", "Buying something you can't afford today on credit means paying more for it tomorrow. Save first, buy after."),
        ("Celebrate small wins", "Saved more than usual this week? Acknowledge it! Celebrating small wins builds the motivation to keep going."),
        ("Review subscriptions", "Check your phone for recurring charges — apps, services, subscriptions. Cancel anything you haven't used in 30 days."),
        ("Set a daily spending limit", "Decide in the morning the maximum you'll spend today. Having a number in mind reduces impulse spending throughout the day."),
    ]

    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(User).where(User.is_active == True)
        )
        users = result.scalars().all()

        for user in users:
            try:
                tip_title, tip_body = random.choice(TIPS)
                await _notify(
                    session, user.id,
                    NotificationType.LITERACY_LESSON,
                    title=f"💡 Money tip: {tip_title}",
                    message=f"{user.first_name}, {tip_body}",
                )
            except Exception as e:
                logger.error(f"Afternoon tip error for {user.id}: {e}")
        await session.commit()
    logger.info("Afternoon tips sent.")


# ── 18:00 — Budget alert + evening summary
async def evening_summary() -> None:
    logger.info("Running evening summary...")

    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(User).where(User.is_active == True)
        )
        users = result.scalars().all()

        for user in users:
            try:
                now = datetime.utcnow()

                # This month's totals
                income_res = await session.execute(
                    select(func.sum(Transaction.amount)).where(
                        Transaction.user_id == user.id,
                        Transaction.type == TransactionType.INCOME,
                        extract("month", Transaction.transaction_date) == now.month,
                        extract("year", Transaction.transaction_date) == now.year,
                    )
                )
                expense_res = await session.execute(
                    select(func.sum(Transaction.amount)).where(
                        Transaction.user_id == user.id,
                        Transaction.type == TransactionType.EXPENSE,
                        extract("month", Transaction.transaction_date) == now.month,
                        extract("year", Transaction.transaction_date) == now.year,
                    )
                )
                income = float(income_res.scalar() or 0)
                expenses = float(expense_res.scalar() or 0)
                balance = income - expenses

                if income == 0 and expenses == 0:
                    # No data yet — send generic encouragement
                    await _notify(
                        session, user.id,
                        NotificationType.WEEKLY_REPORT,
                        title=f"🌆 Good evening, {user.first_name}!",
                        message="Start logging your income and expenses so Lumi can give you a personalised evening summary each day.",
                    )
                    continue

                savings_rate = round((balance / income * 100), 1) if income > 0 else 0

                # Build message based on how they're doing
                if savings_rate >= 20:
                    verdict = f"Excellent! You're saving {savings_rate}% of your income this month — well above the recommended 20%."
                elif savings_rate >= 10:
                    verdict = f"Good progress! You're saving {savings_rate}% this month. Push a little harder to hit 20%."
                elif savings_rate > 0:
                    verdict = f"You're saving {savings_rate}% this month. There's room to improve — try cutting one expense tomorrow."
                else:
                    verdict = f"Your expenses are exceeding your income this month. Let's work on reducing spending starting tomorrow."

                await _notify(
                    session, user.id,
                    NotificationType.WEEKLY_REPORT,
                    title=f"🌆 Evening summary, {user.first_name}",
                    message=(
                        f"This month: Income {user.currency_code} {income:,.0f} · "
                        f"Expenses {user.currency_code} {expenses:,.0f} · "
                        f"Balance {user.currency_code} {balance:,.0f}. {verdict}"
                    ),
                )

                # Separate budget warning if overspending
                if income > 0 and expenses >= income * 0.9:
                    await _notify(
                        session, user.id,
                        NotificationType.SPENDING_ALERT,
                        title=f"⚠️ {user.first_name}, you've used {round(expenses/income*100)}% of your income!",
                        message=f"You've spent {user.currency_code} {expenses:,.0f} out of {user.currency_code} {income:,.0f}. Consider pausing non-essential spending for the rest of the month.",
                    )

            except Exception as e:
                logger.error(f"Evening summary error for {user.id}: {e}")
        await session.commit()
    logger.info("Evening summaries sent.")


# ── 20:00 — Savings encouragement
async def savings_encouragement() -> None:
    logger.info("Sending savings encouragement...")

    MESSAGES = [
        "Every shilling you don't spend tonight is a shilling working for your future.",
        "Before bed — did you save anything today? Even a small amount counts.",
        "Your savings goals are waiting. How much closer did you get today?",
        "Financial discipline at night is just as important as in the morning. Stay strong!",
        "The wealthy don't spend everything they earn. Neither should you.",
        "One day closer to your goals. Keep showing up every day.",
        "Your future self is cheering you on. Don't let them down tonight.",
    ]

    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(User, Streak)
            .join(Streak, Streak.user_id == User.id)
            .where(User.is_active == True)
        )
        for user, streak in result.all():
            try:
                # Check active goals
                goals_res = await session.execute(
                    select(func.count(SavingsGoal.id)).where(
                        SavingsGoal.user_id == user.id,
                        SavingsGoal.status == GoalStatus.ACTIVE,
                    )
                )
                active_goals = goals_res.scalar() or 0

                msg = random.choice(MESSAGES)
                if active_goals > 0:
                    msg += f" You have {active_goals} active savings goal{'s' if active_goals > 1 else ''} to work towards."

                await _notify(
                    session, user.id,
                    NotificationType.SAVINGS_MILESTONE,
                    title=f"🌙 Keep going, {user.first_name}!",
                    message=msg,
                )
            except Exception as e:
                logger.error(f"Evening encouragement error for {user.id}: {e}")
        await session.commit()
    logger.info("Savings encouragement sent.")


# ── 23:30 — Streak warning before midnight
async def streak_warning() -> None:
    logger.info("Running streak check before midnight...")
    today = date.today()
    yesterday = today - timedelta(days=1)

    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(User, Streak)
            .join(Streak, Streak.user_id == User.id)
            .where(User.is_active == True)
        )
        for user, streak in result.all():
            try:
                # Hasn't checked in today — warn them
                if streak.last_activity_date != today and streak.current_streak > 0:
                    await _notify(
                        session, user.id,
                        NotificationType.STREAK_REMINDER,
                        title=f"🔥 {user.first_name}, 30 minutes to save your streak!",
                        message=f"Your {streak.current_streak}-day streak expires at midnight. Add any transaction or update a savings goal right now to keep it alive!",
                    )

                # Missed yesterday — reset streak
                if (
                    streak.last_activity_date is not None
                    and streak.last_activity_date < yesterday
                    and streak.current_streak > 0
                ):
                    old = streak.current_streak
                    streak.current_streak = 0
                    await _notify(
                        session, user.id,
                        NotificationType.STREAK_REMINDER,
                        title=f"💔 {user.first_name}, your streak has reset",
                        message=f"Your {old}-day streak ended because you missed a day. Don't worry — every champion starts over sometimes. Begin your new streak today!",
                    )

            except Exception as e:
                logger.error(f"Streak check error for {user.id}: {e}")
        await session.commit()
    logger.info("Streak check complete.")


# ── Weekly: Monday 07:00 — Weekly report notification
async def weekly_report() -> None:
    logger.info("Sending weekly report notifications...")
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(User).where(User.is_active == True)
        )
        for user in result.scalars().all():
            try:
                await _notify(
                    session, user.id,
                    NotificationType.WEEKLY_REPORT,
                    title=f"📊 {user.first_name}, your weekly report is ready!",
                    message="A new week, a fresh start. Head to Reports to review last week's income, expenses, savings rate, and get your AI summary.",
                )
            except Exception as e:
                logger.error(f"Weekly report error for {user.id}: {e}")
        await session.commit()
    logger.info("Weekly reports sent.")


# ── Daily 09:00 — Savings goals deadline check
async def goals_deadline_check() -> None:
    logger.info("Checking savings goal deadlines...")
    today = date.today()
    week_from_now = today + timedelta(days=7)

    async with AsyncSessionLocal() as session:
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
            try:
                days_left = (goal.deadline - today).days
                pct = round(float(goal.current_amount) / float(goal.target_amount) * 100, 0) if goal.target_amount > 0 else 0
                remaining = float(goal.target_amount) - float(goal.current_amount)

                await _notify(
                    session, user.id,
                    NotificationType.SAVINGS_MILESTONE,
                    title=f"⏰ '{goal.name}' deadline in {days_left} day{'s' if days_left != 1 else ''}!",
                    message=(
                        f"You're {pct:.0f}% there ({user.currency_code} {float(goal.current_amount):,.0f} saved). "
                        f"You still need {user.currency_code} {remaining:,.0f} to hit your goal. "
                        f"{'Almost there — final push!' if pct >= 75 else 'Every shilling counts now!'}"
                    ),
                )
            except Exception as e:
                logger.error(f"Goal deadline error for {user.id}: {e}")
        await session.commit()
    logger.info("Goals deadline check complete.")


def start_scheduler() -> None:
    """Register all jobs and start the scheduler."""

    # 07:00 — Morning greeting
    scheduler.add_job(
        morning_greeting,
        CronTrigger(hour=7, minute=0, timezone="Africa/Nairobi"),
        id="morning_greeting", replace_existing=True,
    )

    # 09:00 — Goals deadline check
    scheduler.add_job(
        goals_deadline_check,
        CronTrigger(hour=9, minute=0, timezone="Africa/Nairobi"),
        id="goals_check", replace_existing=True,
    )

    # 12:00 — Midday spending check
    scheduler.add_job(
        midday_check,
        CronTrigger(hour=12, minute=0, timezone="Africa/Nairobi"),
        id="midday_check", replace_existing=True,
    )

    # 15:00 — Afternoon financial tip
    scheduler.add_job(
        afternoon_tip,
        CronTrigger(hour=15, minute=0, timezone="Africa/Nairobi"),
        id="afternoon_tip", replace_existing=True,
    )

    # 18:00 — Evening summary + budget alerts
    scheduler.add_job(
        evening_summary,
        CronTrigger(hour=18, minute=0, timezone="Africa/Nairobi"),
        id="evening_summary", replace_existing=True,
    )

    # 20:00 — Savings encouragement
    scheduler.add_job(
        savings_encouragement,
        CronTrigger(hour=20, minute=0, timezone="Africa/Nairobi"),
        id="savings_encouragement", replace_existing=True,
    )

    # 23:30 — Streak warning before midnight
    scheduler.add_job(
        streak_warning,
        CronTrigger(hour=23, minute=30, timezone="Africa/Nairobi"),
        id="streak_warning", replace_existing=True,
    )

    # Monday 07:00 — Weekly report
    scheduler.add_job(
        weekly_report,
        CronTrigger(day_of_week="mon", hour=7, minute=0, timezone="Africa/Nairobi"),
        id="weekly_report", replace_existing=True,
    )

    scheduler.start()
    logger.info(
        "Lumi scheduler started — 7 daily jobs active:\n"
        "  07:00 Morning greeting\n"
        "  09:00 Goals deadline check\n"
        "  12:00 Midday spending check\n"
        "  15:00 Afternoon tip\n"
        "  18:00 Evening summary\n"
        "  20:00 Savings encouragement\n"
        "  23:30 Streak warning"
    )


def stop_scheduler() -> None:
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Lumi scheduler stopped.")
