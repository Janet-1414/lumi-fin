import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base
import enum


class BadgeType(str, enum.Enum):
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"
    DIAMOND = "diamond"


class BadgeName(str, enum.Enum):
    FIRST_SAVE = "first_save"
    WEEK_STREAK = "week_streak"
    MONTH_STREAK = "month_streak"
    GOAL_CRUSHER = "goal_crusher"
    BUDGET_MASTER = "budget_master"
    COMMUNITY_STAR = "community_star"
    INVESTMENT_READY = "investment_ready"
    MONEY_MENTOR = "money_mentor"
    SAVINGS_CHAMPION = "savings_champion"
    DISCIPLINE_KING = "discipline_king"


class Badge(Base):
    __tablename__ = "badges"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[BadgeName] = mapped_column(SAEnum(BadgeName), nullable=False)
    badge_type: Mapped[BadgeType] = mapped_column(SAEnum(BadgeType), nullable=False)
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    unlocked_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="badges")
