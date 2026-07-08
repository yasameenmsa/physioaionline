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

  // Subscription fields
  subscriptionExpiresAt?: Date;

  // Profile fields
  bio?: string;
  image?: string;

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
  imageUrl?: string;
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

export interface IArticle extends Document {
  title: string;
  slug: string;
  body: string;
  blocks?: string;
  excerpt: string;
  category: Types.ObjectId;
  author: Types.ObjectId;
  reviewer?: Types.ObjectId;
  status: 'draft' | 'review' | 'published' | 'archived';
  references: string[];
  tags: string[];
  viewCount: number;
  publishedAt?: Date;
  version: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISavedArticle extends Document {
  userId: Types.ObjectId;
  articleId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReadingHistory extends Document {
  userId: Types.ObjectId;
  articleId: Types.ObjectId;
  readAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVoucher extends Document {
  code: string;
  type: 'trial' | 'premium';
  durationDays: number | null;
  maxUses: number;
  usedCount: number;
  active: boolean;
  createdBy?: Types.ObjectId;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type UserModel = Model<IUser>;
export type QuestionModel = Model<IQuestion>;
export type VoucherModel = Model<IVoucher>;
export type UserProgressModel = Model<IUserProgress>;
export type PaymentVerificationModel = Model<IPaymentVerification>;
export type WaitlistEntryModel = Model<IWaitlistEntry>;
export type CategoryModel = Model<ICategory>;
export type ArticleModel = Model<IArticle>;
export type SavedArticleModel = Model<ISavedArticle>;
export type ReadingHistoryModel = Model<IReadingHistory>;

export interface ICourse extends Document {
  title: string;
  slug: string;
  description: string;
  image: string;
  price: number;
  instructor: Types.ObjectId;
  category: string;
  tags: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  whatYouLearn: string[];
  requirements: string[];
  published: boolean;
  sections: ISection[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ISection {
  title: string;
  order: number;
  lessons: ILesson[];
}

export interface ILesson {
  title: string;
  videoId: string;
  videoUrl: string;
  duration: number;
  order: number;
  isFree: boolean;
  _id: Types.ObjectId;
}

export interface IProgress extends Document {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  completedLessons: string[];
  completedAt: Date | null;
  lastVideoId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPurchase extends Document {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  amount: number;
  status: 'pending' | 'completed' | 'refunded';
  sessionId: string;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface INews extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  imageUrl?: string;
  author: Types.ObjectId;
  published: boolean;
  tags: string[];
  viewCount: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type CourseModel = Model<ICourse>;
export type ProgressModel = Model<IProgress>;
export type PurchaseModel = Model<IPurchase>;
export type NewsModel = Model<INews>;
