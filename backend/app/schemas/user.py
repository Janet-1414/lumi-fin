from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
import uuid
from app.models.user import SubscriptionTier, Theme


SUPPORTED_COUNTRIES = {
    "Uganda": "UGX",
    "Kenya": "KES",
    "Tanzania": "TZS",
    "Rwanda": "RWF",
    "Ethiopia": "ETB",
    "Burundi": "BIF",
    "South Sudan": "SSP",
}


class UserSignupRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    country: str

    @field_validator("first_name", "last_name")
    @classmethod
    def name_must_not_be_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name cannot be empty")
        return v

    @field_validator("country")
    @classmethod
    def country_must_be_supported(cls, v: str) -> str:
        if v not in SUPPORTED_COUNTRIES:
            raise ValueError(f"Country must be one of: {', '.join(SUPPORTED_COUNTRIES.keys())}")
        return v


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: uuid.UUID
    first_name: str
    last_name: str
    email: str
    country: str
    currency_code: str
    subscription_tier: SubscriptionTier
    theme: Theme
    money_personality: str | None
    email_notifications: bool
    push_notifications: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdateRequest(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    country: str | None = None
    theme: Theme | None = None
    email_notifications: bool | None = None
    push_notifications: bool | None = None

    @field_validator("country")
    @classmethod
    def country_must_be_supported(cls, v: str | None) -> str | None:
        if v is not None and v not in SUPPORTED_COUNTRIES:
            raise ValueError(f"Country must be one of: {', '.join(SUPPORTED_COUNTRIES.keys())}")
        return v


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
