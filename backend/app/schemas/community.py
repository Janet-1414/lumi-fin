from pydantic import BaseModel, field_validator
from datetime import datetime
import uuid
from app.models.community_post import PostType


class CommunityPostCreateRequest(BaseModel):
    post_type: PostType
    content: str
    is_anonymous: bool = True
    savings_percentage: float | None = None
    goal_completion_percentage: float | None = None

    @field_validator("content")
    @classmethod
    def content_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Post content cannot be empty")
        if len(v) > 500:
            raise ValueError("Post content cannot exceed 500 characters")
        return v


class CommunityPostResponse(BaseModel):
    id: uuid.UUID
    post_type: PostType
    content: str
    is_anonymous: bool
    savings_percentage: float | None
    goal_completion_percentage: float | None
    likes: int
    created_at: datetime
    # Never expose user identity — display name is always anonymous
    display_name: str = "Anonymous Saver"

    model_config = {"from_attributes": True}


class LeaderboardEntry(BaseModel):
    rank: int
    display_name: str  # Always anonymous or username, never real name
    goal_completion_percentage: float
    badge_type: str | None


class CommunityPulseResponse(BaseModel):
    total_savers_this_week: int
    total_goals_achieved: int
    average_savings_rate: float
    ai_summary: str
    top_challenge_participation: int
