import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from app.models.transaction import Transaction, TransactionType, TransactionCategory
from app.models.user import User
import uuid


async def seed_transactions(db: AsyncSession, user: User):
    """Helper: insert a set of known transactions for report testing."""
    txs = [
        Transaction(
            id=uuid.uuid4(), user_id=user.id,
            amount=1_500_000, type=TransactionType.INCOME,
            category=TransactionCategory.SALARY,
            description="Monthly salary",
            transaction_date=datetime.utcnow(),
        ),
        Transaction(
            id=uuid.uuid4(), user_id=user.id,
            amount=120_000, type=TransactionType.EXPENSE,
            category=TransactionCategory.FOOD,
            description="Groceries at Owino market",
            transaction_date=datetime.utcnow(),
        ),
        Transaction(
            id=uuid.uuid4(), user_id=user.id,
            amount=50_000, type=TransactionType.EXPENSE,
            category=TransactionCategory.TRANSPORT,
            description="Boda boda rides",
            transaction_date=datetime.utcnow(),
        ),
        Transaction(
            id=uuid.uuid4(), user_id=user.id,
            amount=80_000, type=TransactionType.EXPENSE,
            category=TransactionCategory.ENTERTAINMENT,
            description="Entertainment",
            transaction_date=datetime.utcnow(),
        ),
    ]
    for tx in txs:
        db.add(tx)
    await db.commit()
    return txs


@pytest.mark.asyncio
async def test_get_report_unauthenticated(client: AsyncClient):
    """Reports must require authentication."""
    response = await client.get("/api/v1/reports")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_report_month(auth_client: AsyncClient):
    """Monthly report returns correct structure."""
    response = await auth_client.get("/api/v1/reports", params={"period": "month"})
    assert response.status_code == 200
    data = response.json()

    # Check required fields
    assert "total_income" in data
    assert "total_expenses" in data
    assert "net_balance" in data
    assert "savings_rate" in data
    assert "category_breakdown" in data
    assert "monthly_data" in data
    assert "top_categories" in data


@pytest.mark.asyncio
async def test_get_report_year(auth_client: AsyncClient):
    """Yearly report returns correct structure."""
    response = await auth_client.get("/api/v1/reports", params={"period": "year"})
    assert response.status_code == 200
    data = response.json()
    assert data["period"] == "year"
    assert isinstance(data["monthly_data"], list)


@pytest.mark.asyncio
async def test_report_balance_calculation(auth_client: AsyncClient, db: AsyncSession, test_user: User):
    """Net balance must equal income minus expenses."""
    await seed_transactions(db, test_user)

    response = await auth_client.get("/api/v1/reports", params={"period": "month"})
    assert response.status_code == 200
    data = response.json()

    expected_balance = data["total_income"] - data["total_expenses"]
    assert abs(data["net_balance"] - expected_balance) < 0.01


@pytest.mark.asyncio
async def test_report_savings_rate_calculation(auth_client: AsyncClient, db: AsyncSession, test_user: User):
    """Savings rate = (income - expenses) / income * 100."""
    await seed_transactions(db, test_user)

    response = await auth_client.get("/api/v1/reports", params={"period": "month"})
    assert response.status_code == 200
    data = response.json()

    if data["total_income"] > 0:
        expected_rate = round((data["net_balance"] / data["total_income"]) * 100, 2)
        assert abs(data["savings_rate"] - expected_rate) < 0.1


@pytest.mark.asyncio
async def test_report_category_percentages_sum(auth_client: AsyncClient, db: AsyncSession, test_user: User):
    """Category breakdown percentages should sum to ~100%."""
    await seed_transactions(db, test_user)

    response = await auth_client.get("/api/v1/reports", params={"period": "month"})
    assert response.status_code == 200
    data = response.json()

    if data["category_breakdown"]:
        total_pct = sum(c["percentage"] for c in data["category_breakdown"])
        # Allow small float rounding tolerance
        assert abs(total_pct - 100.0) < 1.0


@pytest.mark.asyncio
async def test_report_top_categories_limit(auth_client: AsyncClient, db: AsyncSession, test_user: User):
    """Top categories should return at most 5 items."""
    await seed_transactions(db, test_user)

    response = await auth_client.get("/api/v1/reports", params={"period": "month"})
    assert response.status_code == 200
    data = response.json()
    assert len(data["top_categories"]) <= 5


@pytest.mark.asyncio
async def test_ai_report_summary_requires_pro(auth_client: AsyncClient):
    """AI report summary is a Pro-only feature."""
    response = await auth_client.get("/api/v1/reports/ai-summary", params={"period": "month"})
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_report_invalid_period(auth_client: AsyncClient):
    """Invalid period parameter should return a validation error."""
    response = await auth_client.get("/api/v1/reports", params={"period": "decade"})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_report_no_cross_user_data(auth_client: AsyncClient, db: AsyncSession):
    """Reports must never include data from other users."""
    # Create a different user with their own transactions
    other_user_id = uuid.uuid4()
    other_tx = Transaction(
        id=uuid.uuid4(), user_id=other_user_id,
        amount=99_999_999,
        type=TransactionType.INCOME,
        category=TransactionCategory.SALARY,
        description="Other user secret income",
        transaction_date=datetime.utcnow(),
    )
    db.add(other_tx)
    await db.commit()

    response = await auth_client.get("/api/v1/reports", params={"period": "month"})
    assert response.status_code == 200
    data = response.json()

    # The authenticated user's report should never include 99,999,999
    assert data["total_income"] < 99_999_999
