from app.models.user import User, SubscriptionTier


class SubscriptionService:
    """
    Feature gate service. Stripe integration planned for production.
    """

    FREE_FEATURES = [
        "basic_tracking",
        "manual_entry",
        "community_read",
        "basic_reports",
    ]

    PRO_FEATURES = [
        "unlimited_transactions",
        "receipt_scanner",
        "sms_scanner",
        "smart_spending_alerts",
        "money_personality",
        "financial_literacy",
        "savings_coach",
        "savings_challenges",
        "ai_chat",
        "visual_reports",
        "investment_hints",
        "notification_intelligence",
        "community_pulse",
        "community_post",
        "community_challenge",
        "streaks_badges",
        "priority_support",
    ]

    @staticmethod
    def has_feature(user: User, feature: str) -> bool:
        if user.subscription_tier == SubscriptionTier.PRO:
            return feature in SubscriptionService.PRO_FEATURES + SubscriptionService.FREE_FEATURES
        return feature in SubscriptionService.FREE_FEATURES

    @staticmethod
    def is_pro(user: User) -> bool:
        return user.subscription_tier == SubscriptionTier.PRO

    @staticmethod
    def get_plan_details() -> dict:
        return {
            "free": {
                "name": "Lumi Free",
                "price": 0,
                "currency": "USD",
                "features": SubscriptionService.FREE_FEATURES,
                "limits": {"transactions_per_month": 20},
            },
            "pro": {
                "name": "Lumi Pro",
                "price": 1,
                "currency": "USD",
                "billing": "monthly",
                "features": SubscriptionService.PRO_FEATURES + SubscriptionService.FREE_FEATURES,
                "limits": {"transactions_per_month": None},
            },
        }
