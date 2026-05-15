from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from typing import Optional
import uuid
from app.db.database import get_db
from app.core.dependencies import get_current_user, get_current_pro_user
from app.models.user import User
from app.models.notification import NotificationType
from app.schemas.transaction import (
    TransactionCreateRequest, TransactionUpdateRequest,
    TransactionResponse, TransactionSummary, ReceiptScanRequest,
)
from app.services.transaction_service import TransactionService
from app.services.savings_service import SavingsService
from app.services.notification_service import NotificationService
from app.ai.receipt_scanner import scan_receipt
from app.ai.sms_parser import parse_sms
from app.schemas.ai import SMSScanRequest

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.get("/summary", response_model=TransactionSummary)
async def get_summary(
    period: str = Query("month", enum=["month", "week", "year"]),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TransactionService(db)
    return await service.get_summary(current_user, period)


@router.get("", response_model=list[TransactionResponse])
async def get_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=100),
    transaction_type: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TransactionService(db)
    return await service.get_all(current_user, skip, limit, transaction_type, category, start_date, end_date)


@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    data: TransactionCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tx_service = TransactionService(db)
    savings_service = SavingsService(db)
    notif_service = NotificationService(db)

    transaction = await tx_service.create(current_user, data)

    # Auto-checkin streak on every transaction logged
    streak = await savings_service.update_streak(current_user)

    # Notify on streak milestones
    if streak.current_streak in (7, 14, 30):
        milestone_msgs = {
            7: ("🔥 7-day streak!", "A whole week of tracking your money. Keep going!"),
            14: ("⚡ 14-day streak!", "Two weeks consistent! You're building real habits."),
            30: ("👑 30-day streak!", "A full month! You're a financial champion, {}!".format(current_user.first_name)),
        }
        title, msg = milestone_msgs[streak.current_streak]
        await notif_service.create_notification(
            current_user,
            NotificationType.SAVINGS_MILESTONE,
            title=f"{title} {current_user.first_name}",
            message=msg,
        )

    # Budget alert — warn if this expense pushes category over budget
    from app.models.transaction import TransactionType
    if data.type == TransactionType.EXPENSE:
        summary = await tx_service.get_summary(current_user, "month")
        if summary.total_expenses > summary.total_income * 0.9 and summary.total_income > 0:
            await notif_service.create_notification(
                current_user,
                NotificationType.SPENDING_ALERT,
                title=f"⚠️ {current_user.first_name}, you've spent 90%+ of your income!",
                message=f"This month you've spent {current_user.currency_code} {summary.total_expenses:,.0f} out of {current_user.currency_code} {summary.total_income:,.0f} income. Consider pausing non-essential spending.",
            )

    return transaction


@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TransactionService(db)
    return await service.get_by_id(current_user, transaction_id)


@router.patch("/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: uuid.UUID,
    data: TransactionUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TransactionService(db)
    return await service.update(current_user, transaction_id, data)


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(
    transaction_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TransactionService(db)
    await service.delete(current_user, transaction_id)


# AI Feature #1: Receipt Scanner (Pro only)
@router.post("/scan/receipt", response_model=dict)
async def scan_receipt_image(
    data: ReceiptScanRequest,
    current_user: User = Depends(get_current_pro_user),
):
    return await scan_receipt(data.image_base64, data.image_type)


# AI Feature #1b: SMS Scanner (Pro only)
@router.post("/scan/sms", response_model=dict)
async def scan_sms(
    data: SMSScanRequest,
    current_user: User = Depends(get_current_pro_user),
):
    return await parse_sms(data.sms_text)
