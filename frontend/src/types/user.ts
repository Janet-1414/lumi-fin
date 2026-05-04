export type SubscriptionTier = "free" | "pro";
export type Theme = "dark" | "light";

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  country: string;
  currency_code: string;
  subscription_tier: SubscriptionTier;
  theme: Theme;
  money_personality: string | null;
  email_notifications: boolean;
  push_notifications: boolean;
  created_at: string;
}
