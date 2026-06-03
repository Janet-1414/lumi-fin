from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, date
import uuid
from app.models.savings_goal import SavingsGoal, GoalStatus
from app.models.streak import Streak
from app.models.badge import Badge, BadgeType, BadgeName
from app.models.user import User
from app.schemas.savings import SavingsGoalCreateRequest, SavingsGoalUpdateRequest
from app.core.exceptions import NotFoundError


class SavingsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_goal(self, user: User, data: SavingsGoalCreateRequest) -> SavingsGoal:
        goal = SavingsGoal(
            user_id=user.id,
            name=data.name,
            description=data.description,
            target_amount=float(data.target_amount),
            deadline=data.deadline,
            emoji=data.emoji,
        )
        self.db.add(goal)
        await self.db.commit()
        await self.db.refresh(goal)
        return goal

    async def get_goals(self, user: User) -> list[SavingsGoal]:
        result = await self.db.execute(
            select(SavingsGoal)
            .where(SavingsGoal.user_id == user.id)
            .order_by(SavingsGoal.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_goal_by_id(self, user: User, goal_id: uuid.UUID) -> SavingsGoal:
        result = await self.db.execute(
            select(SavingsGoal).where(
                SavingsGoal.id == goal_id,
                SavingsGoal.user_id == user.id,
            )
        )
        goal = result.scalar_one_or_none()
        if not goal:
            raise NotFoundError("Savings goal")
        return goal

    async def update_goal(self, user: User, goal_id: uuid.UUID, data: SavingsGoalUpdateRequest) -> SavingsGoal:
        goal = await self.get_goal_by_id(user, goal_id)

    # Apply all fields except current_amount — handle that separately
        for field, value in data.model_dump(exclude_none=True).items():
            if field != "current_amount":
                setattr(goal, field, value)

    # Handle deposit — cap at target amount
        if data.current_amount is not None:
            new_amount = float(data.current_amount)
            target = float(goal.target_amount)

        # Cap at target — never allow going over
            if new_amount >= target:
                goal.current_amount = target
            else:
                goal.current_amount = new_amount

    # Check if goal is now completed
        if float(goal.current_amount) >= float(goal.target_amount) and goal.status == GoalStatus.ACTIVE:
            goal.status = GoalStatus.COMPLETED
            await self._award_badge(user, BadgeName.GOAL_CRUSHER, BadgeType.GOLD, "Completed a savings goal!")

        await self.db.commit()
        await self.db.refresh(goal)
        return goal
    
    
    async def delete_goal(self, user: User, goal_id: uuid.UUID) -> None:
        goal = await self.get_goal_by_id(user, goal_id)
        await self.db.delete(goal)
        await self.db.commit()

    async def get_streak(self, user: User) -> Streak:
        result = await self.db.execute(
            select(Streak).where(Streak.user_id == user.id)
        )
        streak = result.scalar_one_or_none()
        if not streak:
            streak = Streak(user_id=user.id)
            self.db.add(streak)
            await self.db.commit()
            await self.db.refresh(streak)
        return streak

    async def update_streak(self, user: User) -> Streak:
        streak = await self.get_streak(user)
        today = date.today()

        if streak.last_activity_date == today:
            return streak  # Already updated today

        if streak.last_activity_date:
            days_diff = (today - streak.last_activity_date).days
            if days_diff == 1:
                streak.current_streak += 1
            elif days_diff > 1:
                streak.current_streak = 1  # Reset streak
        else:
            streak.current_streak = 1

        streak.last_activity_date = today
        streak.total_days_active += 1
        if streak.current_streak > streak.longest_streak:
            streak.longest_streak = streak.current_streak

        # Check for streak badges
        if streak.current_streak == 7:
            await self._award_badge(user, BadgeName.WEEK_STREAK, BadgeType.BRONZE, "7-day saving streak!")
        elif streak.current_streak == 30:
            await self._award_badge(user, BadgeName.MONTH_STREAK, BadgeType.GOLD, "30-day saving streak!")

        await self.db.commit()
        await self.db.refresh(streak)
        return streak

    async def get_badges(self, user: User) -> list[Badge]:
        result = await self.db.execute(
            select(Badge)
            .where(Badge.user_id == user.id)
            .order_by(Badge.unlocked_at.desc())
        )
        return list(result.scalars().all())

    async def _award_badge(self, user: User, name: BadgeName, badge_type: BadgeType, description: str) -> None:
        # Check if badge already awarded
        result = await self.db.execute(
            select(Badge).where(Badge.user_id == user.id, Badge.name == name)
        )
        if result.scalar_one_or_none():
            return
        badge = Badge(user_id=user.id, name=name, badge_type=badge_type, description=description)
        self.db.add(badge)
