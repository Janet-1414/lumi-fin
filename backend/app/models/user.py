from __future__ import annotations
from typing import TYPE_CHECKING
import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base
import enum

if TYPE_CHECKING:
    from app.models.transaction import Transaction
    from app.models.savings_goal import SavingsGoal
    from app.models.streak import Streak
    from app.models.badge import Badge
    from app.models.community_post import CommunityPost
    from app.models.notification import Notification
    from app.models.money_personality import MoneyPersonalityProfile

VC = lambda x: [e.value for e in x]


class SubscriptionTier(str, enum.Enum):
    FREE = "free"
    PRO = "pro"


class Theme(str, enum.Enum):
    DARK = "dark"
    LIGHT = "light"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    country: Mapped[str] = mapped_column(String(100), nullable=False)
    currency_code: Mapped[str] = mapped_column(String(10), nullable=False)
    subscription_tier: Mapped[SubscriptionTier] = mapped_column(
        SAEnum(SubscriptionTier, values_callable=VC),
        default=SubscriptionTier.FREE,
        nullable=False,
    )
    theme: Mapped[Theme] = mapped_column(
        SAEnum(Theme, values_callable=VC),
        default=Theme.DARK,
        nullable=False,
    )
    money_personality: Mapped[str | None] = mapped_column(String(100), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    email_notifications: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    push_notifications: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    transactions: Mapped[list[Transaction]] = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    savings_goals: Mapped[list[SavingsGoal]] = relationship("SavingsGoal", back_populates="user", cascade="all, delete-orphan")
    streak: Mapped[Streak | None] = relationship("Streak", back_populates="user", uselist=False, cascade="all, delete-orphan")
    badges: Mapped[list[Badge]] = relationship("Badge", back_populates="user", cascade="all, delete-orphan")
    community_posts: Mapped[list[CommunityPost]] = relationship("CommunityPost", back_populates="user", cascade="all, delete-orphan")
    notifications: Mapped[list[Notification]] = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    money_personality_profile: Mapped[MoneyPersonalityProfile | None] = relationship(
        "MoneyPersonalityProfile", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )