from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, extract
from datetime import datetime
from app.models.transaction import Transaction, TransactionType, TransactionCategory
from app.models.user import User
from app.schemas.reports import ReportResponse, CategoryBreakdown, MonthlyData


class ReportService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_report(self, user: User, period: str = "month") -> ReportResponse:
        now = datetime.utcnow()
        monthly_data = []
        conditions = [Transaction.user_id == user.id]

        if period == "month":
            conditions += [
                extract("month", Transaction.transaction_date) == now.month,
                extract("year", Transaction.transaction_date) == now.year,
            ]
        elif period == "year":
            conditions.append(extract("year", Transaction.transaction_date) == now.year)
            # Build monthly breakdown
            for month in range(1, now.month + 1):
                m_conditions = [
                    Transaction.user_id == user.id,
                    extract("month", Transaction.transaction_date) == month,
                    extract("year", Transaction.transaction_date) == now.year,
                ]
                inc = await self._sum_by_type(m_conditions, TransactionType.INCOME)
                exp = await self._sum_by_type(m_conditions, TransactionType.EXPENSE)
                monthly_data.append(MonthlyData(
                    month=datetime(now.year, month, 1).strftime("%b"),
                    income=inc,
                    expenses=exp,
                    balance=inc - exp,
                ))

        total_income = await self._sum_by_type(conditions, TransactionType.INCOME)
        total_expenses = await self._sum_by_type(conditions, TransactionType.EXPENSE)
        net_balance = total_income - total_expenses
        savings_rate = round((net_balance / total_income * 100), 2) if total_income > 0 else 0

        # Category breakdown (expenses only)
        category_data = await self.db.execute(
            select(
                Transaction.category,
                func.sum(Transaction.amount).label("total"),
                func.count(Transaction.id).label("cnt"),
            )
            .where(and_(*conditions, Transaction.type == TransactionType.EXPENSE))
            .group_by(Transaction.category)
            .order_by(func.sum(Transaction.amount).desc())
        )
        rows = category_data.all()

        category_breakdown = []
        for row in rows:
            pct = round((float(row.total) / total_expenses * 100), 2) if total_expenses > 0 else 0
            category_breakdown.append(CategoryBreakdown(
                category=row.category.value,
                amount=float(row.total),
                percentage=pct,
                transaction_count=int(row.cnt),
            ))

        if not monthly_data:
            monthly_data = [MonthlyData(
                month=now.strftime("%b"),
                income=total_income,
                expenses=total_expenses,
                balance=net_balance,
            )]

        return ReportResponse(
            period=period,
            total_income=total_income,
            total_expenses=total_expenses,
            net_balance=net_balance,
            savings_rate=savings_rate,
            monthly_data=monthly_data,
            category_breakdown=category_breakdown,
            top_categories=category_breakdown[:5],
        )

    async def _sum_by_type(self, conditions: list, tx_type: TransactionType) -> float:
        result = await self.db.execute(
            select(func.sum(Transaction.amount)).where(
                and_(*conditions, Transaction.type == tx_type)
            )
        )
        return float(result.scalar() or 0)
