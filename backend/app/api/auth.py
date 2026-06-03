from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.schemas.user import UserSignupRequest, UserLoginRequest, UserResponse, TokenResponse
from app.services.auth_service import AuthService  # noqa: F401
from app.core.dependencies import get_current_user
from app.models.user import User
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


def set_auth_cookie(response: Response, token: str) -> None:
    """Set auth cookie with correct settings for local and production."""
    is_prod = settings.APP_ENV == "production"
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=is_prod,
        samesite="none" if is_prod else "lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    # Non-httponly flag cookie for proxy to check in production
    if is_prod:
        response.set_cookie(
            key="is_authenticated",
            value="1",
            httponly=False,
            secure=True,
            samesite="none",
            max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(data: UserSignupRequest, response: Response, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    user, token = await service.signup(data)
    set_auth_cookie(response, token)
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    user, token = await service.login(data)
    set_auth_cookie(response, token)
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token")
    response.delete_cookie(key="is_authenticated")
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)
