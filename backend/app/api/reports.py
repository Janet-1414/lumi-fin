from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.core.dependencies import get_current_user, get_current_pro_user
from app.models.user import User
from app.schemas.reports import ReportResponse
from app.services.report_service import ReportService
from app.ai.visual_reports import generate_report_summary

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("", response_model=ReportResponse)
async def get_report(
    period: str = Query("month"),  # No enum restriction — accepts month, last_month, year, all_time, 2026-05 etc
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ReportService(db)
    return await service.get_report(current_user, period)


@router.get("/ai-summary", response_model=dict)
async def get_ai_report_summary(
    period: str = Query("month"),
    current_user: User = Depends(get_current_pro_user),
    db: AsyncSession = Depends(get_db),
):
    service = ReportService(db)
    report = await service.get_report(current_user, period)
    top_cats = [f"{c.category} ({current_user.currency_code} {c.amount:,.0f})" for c in report.top_categories[:3]]
    summary = await generate_report_summary(
        first_name=current_user.first_name,
        currency=current_user.currency_code,
        period=period,
        income=report.total_income,
        expenses=report.total_expenses,
        top_categories=top_cats,
    )
    return {"summary": summary, "period": period}
