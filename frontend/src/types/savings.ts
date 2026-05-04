export type GoalStatus = "active" | "completed" | "paused" | "cancelled";
export type ChallengeStatus = "active" | "completed" | "failed" | "skipped";

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  status: GoalStatus;
  emoji: string | null;
  ai_coached: boolean;
  weekly_target: number | null;
  progress_percentage: number;
  created_at: string;
}

export interface Streak {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  total_days_active: number;
}

export interface Badge {
  id: string;
  name: string;
  badge_type: "bronze" | "silver" | "gold" | "diamond";
  description: string;
  unlocked_at: string;
}
