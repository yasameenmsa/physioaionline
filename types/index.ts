export type UserRole = 'user' | 'admin';
export type UserTier = 'free' | 'premium' | 'pro';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type PaymentStatus = 'pending' | 'approved' | 'rejected';

export interface Question {
  _id: string;
  questionText: string;
  category: string;
  options: string[];
  difficulty?: QuestionDifficulty;
  source: string;
}

export interface UserProgress {
  totalAnswered: number;
  correctAnswers: number;
  accuracy: number;
  categoryStats: Record<string, CategoryStats>;
  currentStreak: number;
  longestStreak: number;
}

export interface CategoryStats {
  total: number;
  correct: number;
  accuracy: number;
}

export interface DailyLimitInfo {
  remaining: number;
  limit: number;
  resetsAt: Date;
}
