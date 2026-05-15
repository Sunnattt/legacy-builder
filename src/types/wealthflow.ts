export type TransactionType = "income" | "expense" | "saving" | "investment";

export interface Transaction {
  id: string;
  user_id?: string;
  type: TransactionType;
  amount: number;
  category: string;
  note?: string | null;
  date: string; // YYYY-MM-DD
  created_at?: string;
}

export interface Goal {
  id: string;
  user_id?: string;
  title: string;
  emoji: string;
  target_amount: number;
  current_amount: number;
  color: string;
  deadline: string | null;
  is_completed: boolean;
  milestones_hit: number[];
  created_at?: string;
}

export interface Habit {
  id: string;
  user_id?: string;
  name: string;
  icon: string;
  streak: number;
  longest_streak: number;
  completed_dates: string[];
  created_at?: string;
}

export interface NetWorthSnapshot {
  id?: string;
  user_id?: string;
  amount: number;
  date: string;
  created_at?: string;
}

export interface Profile {
  id: string;
  display_name: string | null;
  currency: string;
  privacy_mode: boolean;
}
