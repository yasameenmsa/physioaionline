import { Document, Types, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  role: 'user' | 'admin';
  tier: 'free' | 'premium' | 'pro';
  dailyQuestionCount: number;
  lastResetDate: Date;
  timezone: string;

  // Email verification fields
  emailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;

  // Password reset fields
  resetPasswordToken?: string;
  resetPasswordTokenExpires?: Date;

  // Account security fields
  lastLoginAt?: Date;
  failedLoginAttempts: number;
  lockUntil?: Date;

  createdAt: Date;
  updatedAt: Date;

  needsDailyReset(): boolean;
  resetDailyCount(): void;
  canAnswerMore(): boolean;
  incrementDailyCount(): Promise<void>;

  // Authentication methods
  generateVerificationToken(): Promise<string>;
  generateResetToken(): Promise<string>;
  verifyEmail(): Promise<void>;
  isLocked(): boolean;
  recordFailedLogin(): Promise<void>;
  resetFailedLoginAttempts(): Promise<void>;
}

export interface IQuestion extends Document {
  questionText: string;
  category: Types.ObjectId;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  source: string;
  sourceQuestionId?: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserProgress extends Document {
  userId: Types.ObjectId;
  questionsAnswered: Types.ObjectId[];
  correctAnswers: number;
  categoryStats: Map<string, { total: number; correct: number }>;
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: Date;
  studyDays: Date[];
  createdAt: Date;
  updatedAt: Date;

  recordAnswer(
    questionId: Types.ObjectId,
    categoryId: string,
    isCorrect: boolean
  ): Promise<void>;
  updateStreak(): void;
}

export interface IPaymentVerification extends Document {
  userId: Types.ObjectId;
  requestedTier: 'premium' | 'pro';
  screenshotPath: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  adminNotes?: string;
  submittedAt: Date;
  processedAt?: Date;
  processedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWaitlistEntry extends Document {
  email: string;
  converted: boolean;
  convertedAt?: Date;
  createdAt: Date;
}

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  parentCategory?: Types.ObjectId;
  questionCount: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserModel = Model<IUser>;
export type QuestionModel = Model<IQuestion>;
export type UserProgressModel = Model<IUserProgress>;
export type PaymentVerificationModel = Model<IPaymentVerification>;
export type WaitlistEntryModel = Model<IWaitlistEntry>;
export type CategoryModel = Model<ICategory>;
