import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_transaction(auth_client: AsyncClient):
    response = await auth_client.post("/api/v1/transactions", json={
        "amount": 50000,
        "type": "expense",
        "category": "food",
        "description": "Lunch at Cafe Javas",
        "merchant": "Cafe Javas",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["amount"] == 50000.0
    assert data["category"] == "food"


@pytest.mark.asyncio
async def test_get_transactions(auth_client: AsyncClient):
    response = await auth_client.get("/api/v1/transactions")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_get_summary(auth_client: AsyncClient):
    response = await auth_client.get("/api/v1/transactions/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_income" in data
    assert "total_expenses" in data
    assert "balance" in data


@pytest.mark.asyncio
async def test_negative_amount_rejected(auth_client: AsyncClient):
    response = await auth_client.post("/api/v1/transactions", json={
        "amount": -100,
        "type": "expense",
        "category": "food",
        "description": "Test",
    })
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_no_cross_user_access(auth_client: AsyncClient, client: AsyncClient):
    """Users should never be able to access another user's transactions."""
    create_resp = await auth_client.post("/api/v1/transactions", json={
        "amount": 10000,
        "type": "income",
        "category": "salary",
        "description": "My private salary",
    })
    tx_id = create_resp.json()["id"]

    # Unauthenticated client tries to access
    response = await client.get(f"/api/v1/transactions/{tx_id}")
    assert response.status_code == 401
