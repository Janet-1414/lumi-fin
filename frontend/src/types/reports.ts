export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  transaction_count: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface ReportData {
  period: string;
  total_income: number;
  total_expenses: number;
  net_balance: number;
  savings_rate: number;
  monthly_data: MonthlyData[];
  category_breakdown: CategoryBreakdown[];
  top_categories: CategoryBreakdown[];
}