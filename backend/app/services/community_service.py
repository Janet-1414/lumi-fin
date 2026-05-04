from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.community_post import CommunityPost, PostType
from app.models.savings_goal import SavingsGoal, GoalStatus
from app.models.user import User, SubscriptionTier
from app.schemas.community import CommunityPostCreateRequest, LeaderboardEntry
from app.core.exceptions import ForbiddenError, NotFoundError
import uuid


class CommunityService:
    def __init__(self, db: AsyncSession):
        self.db = db

    def _check_pro(self, user: User) -> None:
        if user.subscription_tier != SubscriptionTier.PRO:
            raise ForbiddenError("Full community participation requires Lumi Pro.")

    async def create_post(self, user: User, data: CommunityPostCreateRequest) -> CommunityPost:
        self._check_pro(user)
        post = CommunityPost(
            user_id=user.id,
            post_type=data.post_type,
            content=data.content,
            is_anonymous=data.is_anonymous,
            savings_percentage=data.savings_percentage,
            goal_completion_percentage=data.goal_completion_percentage,
        )
        self.db.add(post)
        await self.db.commit()
        await self.db.refresh(post)
        return post

    async def get_feed(self, post_type: PostType | None = None, skip: int = 0, limit: int = 20) -> list[CommunityPost]:
        conditions = [CommunityPost.is_approved == True]
        if post_type:
            conditions.append(CommunityPost.post_type == post_type)

        from sqlalchemy import and_
        result = await self.db.execute(
            select(CommunityPost)
            .where(and_(*conditions))
            .order_by(CommunityPost.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def like_post(self, user: User, post_id: uuid.UUID) -> CommunityPost:
        self._check_pro(user)
        result = await self.db.execute(
            select(CommunityPost).where(CommunityPost.id == post_id, CommunityPost.is_approved == True)
        )
        post = result.scalar_one_or_none()
        if not post:
            raise NotFoundError("Post")
        post.likes += 1
        await self.db.commit()
        await self.db.refresh(post)
        return post

    async def get_leaderboard(self, limit: int = 10) -> list[LeaderboardEntry]:
        """
        Ranked by savings goal completion percentage only.
        Never by real amounts. Always anonymous.
        """
        result = await self.db.execute(
            select(
                SavingsGoal.user_id,
                func.avg(
                    (SavingsGoal.current_amount / SavingsGoal.target_amount) * 100
                ).label("avg_completion"),
            )
            .where(SavingsGoal.status == GoalStatus.ACTIVE, SavingsGoal.target_amount > 0)
            .group_by(SavingsGoal.user_id)
            .order_by(func.avg((SavingsGoal.current_amount / SavingsGoal.target_amount) * 100).desc())
            .limit(limit)
        )
        rows = result.all()

        entries = []
        for i, row in enumerate(rows, start=1):
            entries.append(LeaderboardEntry(
                rank=i,
                display_name=f"Saver #{i}",  # Always anonymous
                goal_completion_percentage=round(float(row.avg_completion or 0), 2),
                badge_type=None,
            ))
        return entries
