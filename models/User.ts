import mongoose, { Schema, model } from 'mongoose';
import { IUser, UserModel } from '../types/models';
import { generateVerificationToken, generateResetToken } from '../lib/tokens';

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    name: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    tier: {
      type: String,
      enum: ['free', 'premium', 'pro'],
      default: 'free',
    },
    dailyQuestionCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastResetDate: {
      type: Date,
      default: Date.now,
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    // Email verification fields
    emailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      select: false,
    },
    verificationTokenExpires: {
      type: Date,
      select: false,
    },
    // Password reset fields
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordTokenExpires: {
      type: Date,
      select: false,
    },
    // Account security fields
    lastLoginAt: {
      type: Date,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret) {
        delete ret.password;
        delete ret.verificationToken;
        delete ret.verificationTokenExpires;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordTokenExpires;
        delete ret.lockUntil;
        return ret;
      },
    }
  }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ tier: 1 });
// Sparse indexes for tokens (only index documents that have these fields)
userSchema.index({ verificationToken: 1 }, { sparse: true });
userSchema.index({ resetPasswordToken: 1 }, { sparse: true });
userSchema.index({ emailVerified: 1 });

userSchema.methods.needsDailyReset = function (): boolean {
  const now = new Date();
  const lastReset = this.lastResetDate;
  const userTimezone = this.timezone || 'UTC';

  const nowInUserTZ = new Date(
    now.toLocaleString('en-US', { timeZone: userTimezone })
  );
  const lastResetInUserTZ = new Date(
    lastReset.toLocaleString('en-US', { timeZone: userTimezone })
  );

  return (
    nowInUserTZ.getDate() !== lastResetInUserTZ.getDate() ||
    nowInUserTZ.getMonth() !== lastResetInUserTZ.getMonth() ||
    nowInUserTZ.getFullYear() !== lastResetInUserTZ.getFullYear()
  );
};

userSchema.methods.resetDailyCount = function (): void {
  this.dailyQuestionCount = 0;
  this.lastResetDate = new Date();
};

userSchema.methods.canAnswerMore = function (): boolean {
  if (this.tier !== 'free') {
    return true;
  }

  const DAILY_LIMIT = 5;

  if (this.needsDailyReset()) {
    return true;
  }

  return this.dailyQuestionCount < DAILY_LIMIT;
};

userSchema.methods.incrementDailyCount = async function (): Promise<void> {
  if (this.needsDailyReset()) {
    this.resetDailyCount();
  }

  this.dailyQuestionCount += 1;
  await this.save();
};

// Authentication methods

/**
 * Generate and set email verification token
 * Returns the plain token (to be sent in email)
 */
userSchema.methods.generateVerificationToken = async function (): Promise<string> {
  const { token, hashedToken, expiresAt } = generateVerificationToken();

  this.verificationToken = hashedToken;
  this.verificationTokenExpires = expiresAt;

  await this.save();

  return token;
};

/**
 * Generate and set password reset token
 * Returns the plain token (to be sent in email)
 */
userSchema.methods.generateResetToken = async function (): Promise<string> {
  const { token, hashedToken, expiresAt } = generateResetToken();

  this.resetPasswordToken = hashedToken;
  this.resetPasswordTokenExpires = expiresAt;

  await this.save();

  return token;
};

/**
 * Mark user's email as verified and clear verification token
 */
userSchema.methods.verifyEmail = async function (): Promise<void> {
  this.emailVerified = true;
  this.verificationToken = undefined;
  this.verificationTokenExpires = undefined;

  await this.save();
};

/**
 * Check if user account is currently locked due to failed login attempts
 */
userSchema.methods.isLocked = function (): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

/**
 * Record a failed login attempt and lock account if threshold exceeded
 */
userSchema.methods.recordFailedLogin = async function (): Promise<void> {
  this.failedLoginAttempts = (this.failedLoginAttempts || 0) + 1;

  // Lock account after 5 failed attempts for 15 minutes
  const MAX_ATTEMPTS = 5;
  const LOCK_DURATION = 15 * 60 * 1000; // 15 minutes

  if (this.failedLoginAttempts >= MAX_ATTEMPTS) {
    this.lockUntil = new Date(Date.now() + LOCK_DURATION);
  }

  await this.save();
};

/**
 * Reset failed login attempts (called on successful login)
 */
userSchema.methods.resetFailedLoginAttempts = async function (): Promise<void> {
  this.failedLoginAttempts = 0;
  this.lockUntil = undefined;
  this.lastLoginAt = new Date();

  await this.save();
};

const User =
  (mongoose.models.User as UserModel) ||
  model<IUser, UserModel>('User', userSchema);

export default User;
