import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_unauthenticated_access_rejected(client: AsyncClient):
    """All protected endpoints must reject unauthenticated requests."""
    protected_routes = [
        ("GET", "/api/v1/auth/me"),
        ("GET", "/api/v1/transactions"),
        ("GET", "/api/v1/savings/goals"),
        ("GET", "/api/v1/reports"),
        ("GET", "/api/v1/profile"),
    ]
    for method, url in protected_routes:
        if method == "GET":
            response = await client.get(url)
        assert response.status_code == 401, f"{url} should return 401"


@pytest.mark.asyncio
async def test_pro_only_endpoints_rejected_for_free_user(auth_client: AsyncClient):
    """Free tier users should not access Pro features."""
    response = await auth_client.post("/api/v1/chat/stream", json={"message": "Hello", "conversation_history": []})
    # Free user gets 403 Forbidden
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_health_endpoint(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
