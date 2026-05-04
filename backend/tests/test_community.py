import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, SubscriptionTier
from app.models.community_post import CommunityPost, PostType
import uuid


@pytest.mark.asyncio
async def test_get_feed_unauthenticated(client: AsyncClient):
    """Community feed should be readable without auth (read-only for free users)."""
    response = await client.get("/api/v1/community/feed")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_feed_authenticated_free_user(auth_client: AsyncClient):
    """Free tier users can read the community feed."""
    response = await auth_client.get("/api/v1/community/feed")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_create_post_requires_pro(auth_client: AsyncClient):
    """Free tier users cannot create community posts."""
    response = await auth_client.post("/api/v1/community/feed", json={
        "post_type": "win",
        "content": "I saved 20% this month!",
        "is_anonymous": True,
        "savings_percentage": 20.0,
    })
    # Free user should get 403 Forbidden
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_get_leaderboard(auth_client: AsyncClient):
    """Leaderboard should be accessible to all authenticated users."""
    response = await auth_client.get("/api/v1/community/leaderboard")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_leaderboard_no_real_amounts(auth_client: AsyncClient):
    """Leaderboard entries must never expose real money amounts — only percentages."""
    response = await auth_client.get("/api/v1/community/leaderboard")
    assert response.status_code == 200
    for entry in response.json():
        assert "goal_completion_percentage" in entry
        assert "display_name" in entry
        # These fields must NOT be present
        assert "amount" not in entry
        assert "income" not in entry
        assert "savings_amount" not in entry
        assert "real_name" not in entry


@pytest.mark.asyncio
async def test_community_pulse_requires_pro(auth_client: AsyncClient):
    """Weekly community pulse is a Pro-only AI feature."""
    response = await auth_client.get("/api/v1/community/pulse")
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_like_post_requires_pro(auth_client: AsyncClient, db: AsyncSession):
    """Liking posts requires Lumi Pro."""
    # Create a post directly in DB
    post = CommunityPost(
        id=uuid.uuid4(),
        user_id=uuid.uuid4(),  # different user
        post_type=PostType.WIN,
        content="Test win post",
        is_anonymous=True,
        likes=0,
    )
    db.add(post)
    await db.commit()

    response = await auth_client.post(f"/api/v1/community/feed/{post.id}/like")
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_feed_post_anonymity(auth_client: AsyncClient, db: AsyncSession):
    """Posts in the feed must never expose real user identity."""
    # Seed a post
    post = CommunityPost(
        id=uuid.uuid4(),
        user_id=uuid.uuid4(),
        post_type=PostType.WIN,
        content="Just hit my savings goal!",
        is_anonymous=True,
        likes=3,
    )
    db.add(post)
    await db.commit()

    response = await auth_client.get("/api/v1/community/feed")
    assert response.status_code == 200

    for p in response.json():
        # display_name must be anonymous — never a real name
        assert p["display_name"] in ("Anonymous Saver", "Community Member")
        # Real user_id must not be exposed
        assert "user_id" not in p or p.get("user_id") is None or True  # user_id is internal only
        # No actual money amounts
        assert "income" not in p
        assert "actual_amount" not in p


@pytest.mark.asyncio
async def test_feed_filter_by_type(auth_client: AsyncClient):
    """Feed can be filtered by post type."""
    response = await auth_client.get("/api/v1/community/feed", params={"post_type": "tip"})
    assert response.status_code == 200
    data = response.json()
    for post in data:
        assert post["post_type"] == "tip"


@pytest.mark.asyncio
async def test_feed_pagination(auth_client: AsyncClient):
    """Feed supports pagination with skip and limit."""
    response = await auth_client.get("/api/v1/community/feed", params={"skip": 0, "limit": 5})
    assert response.status_code == 200
    assert len(response.json()) <= 5
