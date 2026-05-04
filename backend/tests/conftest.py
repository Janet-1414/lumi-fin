import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool
from app.main import app
from app.db.database import get_db
from app.db.base import Base
from app.models import User, Transaction, SavingsGoal, Streak

TEST_DATABASE_URL = "postgresql+asyncpg://postgres:password@localhost:5432/lumi_test"

test_engine = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool)
TestSessionLocal = async_sessionmaker(bind=test_engine, class_=AsyncSession, expire_on_commit=False)


async def override_get_db():
    async with TestSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session", autouse=True)
async def setup_db():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def db():
    async with TestSessionLocal() as session:
        yield session
        await session.rollback()


@pytest.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c


@pytest.fixture
async def test_user(db: AsyncSession):
    from app.core.security import hash_password
    import uuid
    user = User(
        id=uuid.uuid4(),
        first_name="Nakato",
        last_name="Namukasa",
        email="nakato@test.com",
        password_hash=hash_password("Test@1234"),
        country="Uganda",
        currency_code="UGX",
    )
    db.add(user)
    streak = Streak(user_id=user.id)
    db.add(streak)
    await db.commit()
    await db.refresh(user)
    return user


@pytest.fixture
async def auth_client(client: AsyncClient, test_user: User):
    """Client with auth cookie already set."""
    response = await client.post("/api/v1/auth/login", json={
        "email": "nakato@test.com",
        "password": "Test@1234",
    })
    assert response.status_code == 200
    return client
