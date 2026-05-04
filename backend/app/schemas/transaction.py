from pydantic import BaseModel, field_validator
from datetime import datetime
import uuid
from app.models.transaction import TransactionType, TransactionCategory


class TransactionCreateRequest(BaseModel):
    amount: float
    type: TransactionType
    category: TransactionCategory
    description: str
    merchant: str | None = None
    notes: str | None = None
    transaction_date: datetime | None = None

    @field_validator("amount")
    @classmethod
    def amount_must_be_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Amount must be greater than 0")
        return v

    @field_validator("description")
    @classmethod
    def description_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Description cannot be empty")
        return v


class TransactionUpdateRequest(BaseModel):
    amount: float | None = None
    category: TransactionCategory | None = None
    description: str | None = None
    merchant: str | None = None
    notes: str | None = None
    transaction_date: datetime | None = None


class TransactionResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    amount: float
    type: TransactionType
    category: TransactionCategory
    description: str
    merchant: str | None
    ai_scanned: bool
    ai_categorized: bool
    notes: str | None
    transaction_date: datetime
    created_at: datetime

    model_config = {"from_attributes": True}


class TransactionSummary(BaseModel):
    total_income: float
    total_expenses: float
    balance: float
    transaction_count: int
    period: str


class ReceiptScanRequest(BaseModel):
    image_base64: str
    image_type: str = "image/jpeg"
