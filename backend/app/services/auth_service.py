from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import timedelta
from app.models.user import User
from app.models.streak import Streak
from app.schemas.user import UserSignupRequest, UserLoginRequest, SUPPORTED_COUNTRIES
from app.core.security import hash_password, verify_password, create_access_token, validate_password_strength
from app.core.exceptions import ConflictError, UnauthorizedError, ValidationError
from app.config import settings


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def signup(self, data: UserSignupRequest) -> tuple[User, str]:
        # Validate password strength
        is_valid, error = validate_password_strength(data.password)
        if not is_valid:
            raise ValidationError(error)

        # Check if email already exists
        result = await self.db.execute(select(User).where(User.email == data.email.lower()))
        if result.scalar_one_or_none():
            raise ConflictError("An account with this email already exists")

        # Determine currency from country
        currency_code = SUPPORTED_COUNTRIES[data.country]

        # Create user
        user = User(
            first_name=data.first_name.strip(),
            last_name=data.last_name.strip(),
            email=data.email.lower(),
            password_hash=hash_password(data.password),
            country=data.country,
            currency_code=currency_code,
        )
        self.db.add(user)
        await self.db.flush()  # Get user.id

        # Create initial streak record
        streak = Streak(user_id=user.id)
        self.db.add(streak)

        await self.db.commit()
        await self.db.refresh(user)

        # Generate token
        token = create_access_token(
            subject=str(user.id),
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        )
        return user, token

    async def login(self, data: UserLoginRequest) -> tuple[User, str]:
        result = await self.db.execute(
            select(User).where(User.email == data.email.lower(), User.is_active == True)
        )
        user = result.scalar_one_or_none()

        if not user or not verify_password(data.password, user.password_hash):
            raise UnauthorizedError("Invalid email or password")

        token = create_access_token(
            subject=str(user.id),
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        )
        return user, token
