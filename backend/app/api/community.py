from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select
import uuid
from app.db.database import get_db
from app.core.dependencies import get_current_user, get_current_pro_user
from app.models.user import User
from app.models.savings_goal import SavingsGoal, GoalStatus
from app.schemas.community import CommunityPostCreateRequest, CommunityPostResponse, LeaderboardEntry, CommunityPulseResponse
from app.services.community_service import CommunityService
from app.ai.community_pulse import generate_community_pulse

router = APIRouter(prefix="/community", tags=["Community"])


@router.get("/feed", response_model=list[CommunityPostResponse])
async def get_feed(
    post_type: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=50),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.models.community_post import PostType
    post_type_enum = PostType(post_type) if post_type else None
    service = CommunityService(db)
    posts = await service.get_feed(post_type_enum, skip, limit)
    return [
        CommunityPostResponse(
            id=p.id, post_type=p.post_type, content=p.content,
            is_anonymous=p.is_anonymous, savings_percentage=float(p.savings_percentage) if p.savings_percentage else None,
            goal_completion_percentage=float(p.goal_completion_percentage) if p.goal_completion_percentage else None,
            likes=p.likes, created_at=p.created_at,
            display_name="Anonymous Saver" if p.is_anonymous else "Community Member",
        )
        for p in posts
    ]


@router.post("/feed", response_model=CommunityPostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    data: CommunityPostCreateRequest,
    current_user: User = Depends(get_current_pro_user),
    db: AsyncSession = Depends(get_db),
):
    service = CommunityService(db)
    post = await service.create_post(current_user, data)
    return CommunityPostResponse(
        id=post.id, post_type=post.post_type, content=post.content,
        is_anonymous=post.is_anonymous,
        savings_percentage=float(post.savings_percentage) if post.savings_percentage else None,
        goal_completion_percentage=float(post.goal_completion_percentage) if post.goal_completion_percentage else None,
        likes=post.likes, created_at=post.created_at,
        display_name="Anonymous Saver",
    )


@router.post("/feed/{post_id}/like")
async def like_post(
    post_id: uuid.UUID,
    current_user: User = Depends(get_current_pro_user),
    db: AsyncSession = Depends(get_db),
):
    service = CommunityService(db)
    post = await service.like_post(current_user, post_id)
    return {"likes": post.likes}


@router.get("/leaderboard", response_model=list[LeaderboardEntry])
async def get_leaderboard(
    limit: int = Query(10, le=20),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = CommunityService(db)
    return await service.get_leaderboard(limit)


# AI Feature #11: Community Pulse (Pro only)
@router.get("/pulse", response_model=CommunityPulseResponse)
async def get_community_pulse(
    current_user: User = Depends(get_current_pro_user),
    db: AsyncSession = Depends(get_db),
):
    from app.models.savings_goal import SavingsGoal, GoalStatus
    from app.models.community_post import CommunityPost

    total_savers_res = await db.execute(select(func.count(SavingsGoal.user_id.distinct())).where(SavingsGoal.status == GoalStatus.ACTIVE))
    total_savers = total_savers_res.scalar() or 0

    completed_res = await db.execute(select(func.count(SavingsGoal.id)).where(SavingsGoal.status == GoalStatus.COMPLETED))
    total_goals_achieved = completed_res.scalar() or 0

    avg_rate_res = await db.execute(
        select(func.avg((SavingsGoal.current_amount / SavingsGoal.target_amount) * 100)).where(
            SavingsGoal.status == GoalStatus.ACTIVE, SavingsGoal.target_amount > 0
        )
    )
    avg_savings_rate = round(float(avg_rate_res.scalar() or 0), 1)

    pulse_text = await generate_community_pulse(
        total_savers=total_savers,
        total_goals_achieved=total_goals_achieved,
        avg_savings_rate=avg_savings_rate,
        top_challenge="No-Spend Weekend",
    )

    return CommunityPulseResponse(
        total_savers_this_week=total_savers,
        total_goals_achieved=total_goals_achieved,
        average_savings_rate=avg_savings_rate,
        ai_summary=pulse_text,
        top_challenge_participation=0,
    )
