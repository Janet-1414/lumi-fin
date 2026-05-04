"""
LangChain tools that give the LangGraph chat agent access to the user's real financial data.
These tools are injected into the agent so it can answer questions grounded in actual data.
"""
from langchain_core.tools import tool
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, extract
from datetime import datetime
from typing import Any
from app.models.transaction import Transaction, TransactionType
from app.models.savings_goal import SavingsGoal, GoalStatus
from app.models.streak import Streak
import uuid


def create_financial_tools(db: AsyncSession, user_id: uuid.UUID, currency: str):
    """
    Factory function that creates LangChain tools scoped to the authenticated user.
    All tools are bound to user_id so the agent can never access another user's data.
    """

    @tool
    async def get_spending_summary(period: str = "month") -> str:
        """
        Get the user's income and expense summary.
        period: 'month', 'week', or 'year'
        """
        now = datetime.utcnow()
        conditions = [Transaction.user_id == user_id]

        if period == "month":
            conditions += [
                extract("month", Transaction.transaction_date) == now.month,
                extract("year", Transaction.transaction_date) == now.year,
            ]
        elif period == "week":
            from datetime import timedelta
            week_start = now - timedelta(days=now.weekday())
            conditions.append(Transaction.transaction_date >= week_start)

        income_res = await db.execute(
            select(func.sum(Transaction.amount)).where(
                and_(*conditions, Transaction.type == TransactionType.INCOME)
            )
        )
        expense_res = await db.execute(
            select(func.sum(Transaction.amount)).where(
                and_(*conditions, Transaction.type == TransactionType.EXPENSE)
            )
        )
        income = float(income_res.scalar() or 0)
        expenses = float(expense_res.scalar() or 0)
        balance = income - expenses
        savings_rate = round((balance / income * 100), 1) if income > 0 else 0

        return (
            f"For this {period}: Income = {currency} {income:,.0f}, "
            f"Expenses = {currency} {expenses:,.0f}, "
            f"Balance = {currency} {balance:,.0f}, "
            f"Savings rate = {savings_rate}%"
        )

    @tool
    async def get_top_spending_categories(limit: int = 5) -> str:
        """Get the user's top spending categories this month."""
        now = datetime.utcnow()
        result = await db.execute(
            select(
                Transaction.category,
                func.sum(Transaction.amount).label("total"),
            )
            .where(
                Transaction.user_id == user_id,
                Transaction.type == TransactionType.EXPENSE,
                extract("month", Transaction.transaction_date) == now.month,
                extract("year", Transaction.transaction_date) == now.year,
            )
            .group_by(Transaction.category)
            .order_by(func.sum(Transaction.amount).desc())
            .limit(limit)
        )
        rows = result.all()
        if not rows:
            return "No expenses recorded this month yet."

        lines = [f"{row.category.value}: {currency} {float(row.total):,.0f}" for row in rows]
        return "Top spending categories this month:\n" + "\n".join(lines)

    @tool
    async def get_savings_goals() -> str:
        """Get the user's active savings goals and their progress."""
        result = await db.execute(
            select(SavingsGoal).where(
                SavingsGoal.user_id == user_id,
                SavingsGoal.status == GoalStatus.ACTIVE,
            )
        )
        goals = result.scalars().all()
        if not goals:
            return "No active savings goals found."

        lines = []
        for g in goals:
            pct = round((float(g.current_amount) / float(g.target_amount) * 100), 1) if g.target_amount > 0 else 0
            lines.append(
                f"Goal: {g.name} — {currency} {float(g.current_amount):,.0f} / {currency} {float(g.target_amount):,.0f} ({pct}% complete)"
            )
        return "Active savings goals:\n" + "\n".join(lines)

    @tool
    async def get_recent_transactions(limit: int = 10) -> str:
        """Get the user's most recent transactions."""
        result = await db.execute(
            select(Transaction)
            .where(Transaction.user_id == user_id)
            .order_by(Transaction.transaction_date.desc())
            .limit(limit)
        )
        transactions = result.scalars().all()
        if not transactions:
            return "No transactions recorded yet."

        lines = []
        for t in transactions:
            sign = "+" if t.type == TransactionType.INCOME else "-"
            lines.append(
                f"{t.transaction_date.strftime('%d %b')}: {sign}{currency} {float(t.amount):,.0f} — {t.description} ({t.category.value})"
            )
        return "Recent transactions:\n" + "\n".join(lines)

    @tool
    async def get_streak_info() -> str:
        """Get the user's current saving streak."""
        result = await db.execute(select(Streak).where(Streak.user_id == user_id))
        streak = result.scalar_one_or_none()
        if not streak:
            return "No streak data found. Start saving daily to build your streak!"
        return (
            f"Current streak: {streak.current_streak} days, "
            f"Longest streak: {streak.longest_streak} days, "
            f"Total active days: {streak.total_days_active}"
        )

    return [get_spending_summary, get_top_spending_categories, get_savings_goals, get_recent_transactions, get_streak_info]
