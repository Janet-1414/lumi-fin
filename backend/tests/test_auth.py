import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_signup(client: AsyncClient):
    response = await client.post("/api/v1/auth/signup", json={
        "first_name": "Kato",
        "last_name": "Mugisha",
        "email": "kato@test.com",
        "password": "Test@1234",
        "country": "Uganda",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["user"]["first_name"] == "Kato"
    assert data["user"]["currency_code"] == "UGX"
    assert "access_token" in data


@pytest.mark.asyncio
async def test_signup_duplicate_email(client: AsyncClient):
    payload = {
        "first_name": "Nantongo",
        "last_name": "Test",
        "email": "nantongo@test.com",
        "password": "Test@1234",
        "country": "Uganda",
    }
    await client.post("/api/v1/auth/signup", json=payload)
    response = await client.post("/api/v1/auth/signup", json=payload)
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_signup_weak_password(client: AsyncClient):
    response = await client.post("/api/v1/auth/signup", json={
        "first_name": "Test",
        "last_name": "User",
        "email": "weak@test.com",
        "password": "password",
        "country": "Uganda",
    })
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    response = await client.post("/api/v1/auth/login", json={
        "email": "nakato@test.com",
        "password": "Test@1234",
    })
    assert response.status_code == 200
    assert response.json()["user"]["email"] == "nakato@test.com"


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient):
    response = await client.post("/api/v1/auth/login", json={
        "email": "nakato@test.com",
        "password": "wrongpassword",
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me(auth_client: AsyncClient):
    response = await auth_client.get("/api/v1/auth/me")
    assert response.status_code == 200
    assert response.json()["first_name"] == "Nakato"


@pytest.mark.asyncio
async def test_logout(auth_client: AsyncClient):
    response = await auth_client.post("/api/v1/auth/logout")
    assert response.status_code == 200
