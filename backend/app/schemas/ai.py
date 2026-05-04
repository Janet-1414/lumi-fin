from pydantic import BaseModel
from typing import List


class MoneyPersonalityQuizResponse(BaseModel):
    answers: List[str]


class MoneyPersonalityResult(BaseModel):
    personality_type: str
    description: str
    strengths: List[str]
    weaknesses: List[str]
    advice: str


class FinancialLiteracyLesson(BaseModel):
    title: str
    content: str
    lesson_type: str
    based_on: str  # what spending mistake triggered this lesson


class SavingsCoachMessage(BaseModel):
    goal_id: str
    message: str
    weekly_target: float
    days_remaining: int | None
    on_track: bool


class InvestmentHint(BaseModel):
    title: str
    description: str
    risk_level: str
    relevant_to_country: str
    minimum_amount: float | None


class SMSScanRequest(BaseModel):
    sms_text: str
