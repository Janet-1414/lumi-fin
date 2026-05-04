import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_savings_goal(auth_client: AsyncClient):
    response = await auth_client.post("/api/v1/savings/goals", json={
        "name": "New Laptop",
        "target_amount": 1500000,
        "emoji": "💻",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "New Laptop"
    assert data["progress_percentage"] == 0.0


@pytest.mark.asyncio
async def test_get_savings_goals(auth_client: AsyncClient):
    response = await auth_client.get("/api/v1/savings/goals")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_get_streak(auth_client: AsyncClient):
    response = await auth_client.get("/api/v1/savings/streak")
    assert response.status_code == 200
    data = response.json()
    assert "current_streak" in data
    assert "longest_streak" in data
