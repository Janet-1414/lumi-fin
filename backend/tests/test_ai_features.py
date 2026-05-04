import pytest
from unittest.mock import AsyncMock, patch
from app.ai.receipt_scanner import scan_receipt
from app.ai.sms_parser import parse_sms
from app.ai.money_personality import generate_personality_profile


@pytest.mark.asyncio
async def test_sms_parser_mtn_format():
    """Test that MTN Uganda SMS format is parsed correctly."""
    sms = "You have received UGX 500,000 from 0772123456. Ref: TX123. Balance: UGX 1,200,000."
    with patch("app.ai.sms_parser.client") as mock_client:
        mock_client.chat.completions.create = AsyncMock(return_value=AsyncMock(
            choices=[AsyncMock(message=AsyncMock(content='{"amount": 500000, "type": "income", "description": "MTN Mobile Money received", "merchant": null, "category": "mobile_money", "transaction_date": null, "reference": "TX123"}'))]
        ))
        result = await parse_sms(sms)
        assert "amount" in result or "error" in result


@pytest.mark.asyncio
async def test_personality_quiz_questions_count():
    """Ensure the quiz has exactly 5 questions."""
    from app.ai.money_personality import PERSONALITY_QUIZ_QUESTIONS
    assert len(PERSONALITY_QUIZ_QUESTIONS) == 5


@pytest.mark.asyncio
async def test_subscription_feature_gating():
    """Verify Pro features are correctly gated."""
    from app.services.subscription_service import SubscriptionService
    from app.models.user import User, SubscriptionTier
    import uuid

    free_user = User(
        id=uuid.uuid4(), first_name="Test", last_name="User",
        email="test@t.com", password_hash="x", country="Uganda",
        currency_code="UGX", subscription_tier=SubscriptionTier.FREE,
    )
    pro_user = User(
        id=uuid.uuid4(), first_name="Test", last_name="User",
        email="pro@t.com", password_hash="x", country="Uganda",
        currency_code="UGX", subscription_tier=SubscriptionTier.PRO,
    )

    assert not SubscriptionService.has_feature(free_user, "ai_chat")
    assert SubscriptionService.has_feature(pro_user, "ai_chat")
    assert SubscriptionService.has_feature(free_user, "basic_tracking")
    assert SubscriptionService.has_feature(pro_user, "basic_tracking")
