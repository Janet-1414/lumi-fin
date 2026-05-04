from pydantic import BaseModel, field_validator
from datetime import datetime, date
import uuid
from app.models.savings_goal import GoalStatus
from app.models.challenge import ChallengeStatus


class SavingsGoalCreateRequest(BaseModel):
    name: str
    description: str | None = None
    target_amount: float
    deadline: date | None = None
    emoji: str | None = None

    @field_validator("target_amount")
    @classmethod
    def amount_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Target amount must be greater than 0")
        return v


class SavingsGoalUpdateRequest(BaseModel):
    name: str | None = None
    description: str | None = None
    target_amount: float | None = None
    current_amount: float | None = None
    deadline: date | None = None
    status: GoalStatus | None = None
    emoji: str | None = None


class SavingsGoalResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    description: str | None
    target_amount: float
    current_amount: float
    deadline: date | None
    status: GoalStatus
    emoji: str | None
    ai_coached: bool
    weekly_target: float | None
    progress_percentage: float
    created_at: datetime

    model_config = {"from_attributes": True}

    @property
    def progress_percentage(self) -> float:
        if self.target_amount == 0:
            return 0.0
        return round((self.current_amount / self.target_amount) * 100, 2)


class StreakResponse(BaseModel):
    current_streak: int
    longest_streak: int
    last_activity_date: date | None
    total_days_active: int

    model_config = {"from_attributes": True}


class ChallengeResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: str
    target_amount: float | None
    current_amount: float
    duration_days: int
    start_date: date
    end_date: date
    status: ChallengeStatus
    is_community: bool
    ai_generated: bool
    participants_count: int
    completion_percentage: float

    model_config = {"from_attributes": True}
