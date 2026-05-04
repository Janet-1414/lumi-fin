import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, Integer, DateTime, ForeignKey, Text, Numeric, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base
import enum


class PostType(str, enum.Enum):
    WIN = "win"
    TIP = "tip"
    QUESTION = "question"


class CommunityPost(Base):
    __tablename__ = "community_posts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    post_type: Mapped[PostType] = mapped_column(SAEnum(PostType), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    is_anonymous: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    # Only percentages stored — never real amounts
    savings_percentage: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    goal_completion_percentage: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    likes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_moderated: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_approved: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="community_posts")
