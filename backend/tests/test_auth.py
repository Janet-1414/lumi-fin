import pytest
from httpx import AsyncClient
from app.models.user import User


@pytest.mark.asyncio
async def test_signup(client: AsyncClient):
    """New user can sign up with valid credentials."""
    response = await client.post("/api/v1/auth/signup", json={
        "first_name": "Amara",
        "last_name": "Okonkwo",
        "email": "amara@test.com",
        "password": "Strong@1234",
        "country": "Uganda",
    })
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "amara@test.com"
    assert data["user"]["currency_code"] == "UGX"


@pytest.mark.asyncio
async def test_signup_duplicate_email(client: AsyncClient):
    """Signing up with an existing email returns 409."""
    payload = {
        "first_name": "Duplicate",
        "last_name": "User",
        "email": "duplicate@test.com",
        "password": "Strong@1234",
        "country": "Uganda",
    }
    await client.post("/api/v1/auth/signup", json=payload)
    response = await client.post("/api/v1/auth/signup", json=payload)
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_signup_weak_password(client: AsyncClient):
    """Weak passwords are rejected with 422."""
    response = await client.post("/api/v1/auth/signup", json={
        "first_name": "Weak",
        "last_name": "Pass",
        "email": "weak@test.com",
        "password": "1234",
        "country": "Uganda",
    })
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, test_user: User):
    """Registered user can log in and receive a token cookie."""
    # test_user fixture ensures nakato@test.com exists with correct password hash
    response = await client.post("/api/v1/auth/login", json={
        "email": "nakato@test.com",
        "password": "Test@1234",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "nakato@test.com"


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient, test_user: User):
    """Wrong password returns 401."""
    response = await client.post("/api/v1/auth/login", json={
        "email": "nakato@test.com",
        "password": "WrongPassword123",
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me(auth_client: AsyncClient):
    """Authenticated user can fetch their own profile."""
    response = await auth_client.get("/api/v1/auth/me")
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "nakato@test.com"
    assert "password_hash" not in data


@pytest.mark.asyncio
async def test_logout(auth_client: AsyncClient):
    """Logout clears the auth cookie."""
    response = await auth_client.post("/api/v1/auth/logout")
    assert response.status_code == 200
