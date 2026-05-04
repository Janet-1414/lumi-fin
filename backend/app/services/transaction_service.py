from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import datetime
import uuid
from app.models.transaction import Transaction, TransactionType
from app.models.user import User, SubscriptionTier
from app.schemas.transaction import TransactionCreateRequest, TransactionUpdateRequest, TransactionSummary
from app.core.exceptions import NotFoundError, ForbiddenError


FREE_TIER_MONTHLY_LIMIT = 20


class TransactionService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def check_monthly_limit(self, user: User) -> None:
        if user.subscription_tier == SubscriptionTier.PRO:
            return
        now = datetime.utcnow()
        count_result = await self.db.execute(
            select(func.count(Transaction.id)).where(
                Transaction.user_id == user.id,
                func.extract("month", Transaction.created_at) == now.month,
                func.extract("year", Transaction.created_at) == now.year,
            )
        )
        count = count_result.scalar()
        if count >= FREE_TIER_MONTHLY_LIMIT:
            raise ForbiddenError(
                f"Free tier limit reached ({FREE_TIER_MONTHLY_LIMIT} transactions/month). "
                "Upgrade to Lumi Pro for unlimited transactions."
            )

    async def create(self, user: User, data: TransactionCreateRequest) -> Transaction:
        await self.check_monthly_limit(user)
        transaction = Transaction(
            user_id=user.id,
            amount=float(data.amount),
            type=data.type,
            category=data.category,
            description=data.description,
            merchant=data.merchant,
            notes=data.notes,
            transaction_date=data.transaction_date or datetime.utcnow(),
        )
        self.db.add(transaction)
        await self.db.commit()
        await self.db.refresh(transaction)
        return transaction

    async def get_all(
        self,
        user: User,
        skip: int = 0,
        limit: int = 50,
        transaction_type: str | None = None,
        category: str | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
    ) -> list[Transaction]:
        conditions = [Transaction.user_id == user.id]
        if transaction_type:
            conditions.append(Transaction.type == transaction_type)
        if category:
            conditions.append(Transaction.category == category)
        if start_date:
            conditions.append(Transaction.transaction_date >= start_date)
        if end_date:
            conditions.append(Transaction.transaction_date <= end_date)

        result = await self.db.execute(
            select(Transaction)
            .where(and_(*conditions))
            .order_by(Transaction.transaction_date.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_by_id(self, user: User, transaction_id: uuid.UUID) -> Transaction:
        result = await self.db.execute(
            select(Transaction).where(
                Transaction.id == transaction_id,
                Transaction.user_id == user.id,
            )
        )
        transaction = result.scalar_one_or_none()
        if not transaction:
            raise NotFoundError("Transaction")
        return transaction

    async def update(self, user: User, transaction_id: uuid.UUID, data: TransactionUpdateRequest) -> Transaction:
        transaction = await self.get_by_id(user, transaction_id)
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(transaction, field, value)
        await self.db.commit()
        await self.db.refresh(transaction)
        return transaction

    async def delete(self, user: User, transaction_id: uuid.UUID) -> None:
        transaction = await self.get_by_id(user, transaction_id)
        await self.db.delete(transaction)
        await self.db.commit()

    async def get_summary(self, user: User, period: str = "month") -> TransactionSummary:
        now = datetime.utcnow()
        conditions = [Transaction.user_id == user.id]

        if period == "month":
            conditions += [
                func.extract("month", Transaction.transaction_date) == now.month,
                func.extract("year", Transaction.transaction_date) == now.year,
            ]
        elif period == "week":
            from datetime import timedelta
            week_start = now - timedelta(days=now.weekday())
            conditions.append(Transaction.transaction_date >= week_start)

        income_result = await self.db.execute(
            select(func.sum(Transaction.amount)).where(
                and_(*conditions, Transaction.type == TransactionType.INCOME)
            )
        )
        expense_result = await self.db.execute(
            select(func.sum(Transaction.amount)).where(
                and_(*conditions, Transaction.type == TransactionType.EXPENSE)
            )
        )
        count_result = await self.db.execute(
            select(func.count(Transaction.id)).where(and_(*conditions))
        )

        total_income = float(income_result.scalar() or 0)
        total_expenses = float(expense_result.scalar() or 0)

        return TransactionSummary(
            total_income=total_income,
            total_expenses=total_expenses,
            balance=total_income - total_expenses,
            transaction_count=count_result.scalar() or 0,
            period=period,
        )
