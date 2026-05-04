from pydantic import BaseModel
from typing import List


class CategoryBreakdown(BaseModel):
    category: str
    amount: float
    percentage: float
    transaction_count: int


class MonthlyData(BaseModel):
    month: str
    income: float
    expenses: float
    balance: float


class ReportResponse(BaseModel):
    period: str
    total_income: float
    total_expenses: float
    net_balance: float
    savings_rate: float
    monthly_data: List[MonthlyData]
    category_breakdown: List[CategoryBreakdown]
    ai_summary: str | None = None
    top_categories: List[CategoryBreakdown]
