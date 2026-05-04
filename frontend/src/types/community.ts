export type PostType = "win" | "tip" | "question";

export interface CommunityPost {
  id: string;
  post_type: PostType;
  content: string;
  is_anonymous: boolean;
  savings_percentage: number | null;
  goal_completion_percentage: number | null;
  likes: number;
  created_at: string;
  display_name: string;
}

export interface LeaderboardEntry {
  rank: number;
  display_name: string;
  goal_completion_percentage: number;
  badge_type: string | null;
}

export interface CommunityPulse {
  total_savers_this_week: number;
  total_goals_achieved: number;
  average_savings_rate: number;
  ai_summary: string;
  top_challenge_participation: number;
}
