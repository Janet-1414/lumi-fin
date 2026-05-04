export type TransactionType = "income" | "expense";
export type TransactionCategory =
  | "food" | "transport" | "entertainment" | "utilities"
  | "health" | "education" | "shopping" | "savings"
  | "salary" | "freelance" | "mobile_money" | "rent" | "other";

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  merchant: string | null;
  ai_scanned: boolean;
  ai_categorized: boolean;
  notes: string | null;
  transaction_date: string;
  created_at: string;
}

export interface TransactionSummary {
  total_income: number;
  total_expenses: number;
  balance: number;
  transaction_count: number;
  period: string;
}

export interface CreateTransactionPayload {
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  merchant?: string;
  notes?: string;
  transaction_date?: string;
}
