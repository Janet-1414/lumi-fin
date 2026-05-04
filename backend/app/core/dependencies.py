from fastapi import Depends, HTTPException, Cookie, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.database import get_db
from app.core.security import decode_access_token
from app.models.user import User, SubscriptionTier
from typing import Optional


async def get_current_user(
    access_token: Optional[str] = Cookie(default=None),
    db: AsyncSession = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated. Please log in.",
    )
    if not access_token:
        raise credentials_exception

    user_id = decode_access_token(access_token)
    if not user_id:
        raise credentials_exception

    result = await db.execute(select(User).where(User.id == user_id, User.is_active == True))
    user = result.scalar_one_or_none()

    if not user:
        raise credentials_exception

    return user


async def get_current_pro_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.subscription_tier != SubscriptionTier.PRO:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This feature requires Lumi Pro. Upgrade to unlock all AI features.",
        )
    return current_user
