import mongoose, { Schema, model } from 'mongoose';
import { IUserProgress, UserProgressModel } from '../types/models';

const userProgressSchema = new Schema<IUserProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    questionsAnswered: {
      type: [Schema.Types.ObjectId],
      default: [],
    },
    correctAnswers: {
      type: Number,
      default: 0,
      min: 0,
    },
    categoryStats: {
      type: Map,
      of: new Schema({
        total: { type: Number, default: 0 },
        correct: { type: Number, default: 0 },
      }),
      default: new Map<string, { total: number; correct: number }>(),
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastPracticeDate: {
      type: Date,
    },
    studyDays: {
      type: [Date],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userProgressSchema.index({ lastPracticeDate: 1 });

userProgressSchema.virtual('accuracy').get(function () {
  const total = this.questionsAnswered.length;
  if (total === 0) return 0;
  return Math.round((this.correctAnswers / total) * 100);
});

userProgressSchema.methods.recordAnswer = async function (
  questionId: mongoose.Types.ObjectId,
  categoryId: string,
  isCorrect: boolean
): Promise<void> {
  if (!this.questionsAnswered.includes(questionId)) {
    this.questionsAnswered.push(questionId);

    if (isCorrect) {
      this.correctAnswers += 1;
    }
  }

  const categoryIdStr = categoryId.toString();
  const existingStats = this.categoryStats.get(categoryIdStr);

  if (existingStats) {
    existingStats.total += 1;
    if (isCorrect) {
      existingStats.correct += 1;
    }
    this.categoryStats.set(categoryIdStr, existingStats);
  } else {
    this.categoryStats.set(categoryIdStr, {
      total: 1,
      correct: isCorrect ? 1 : 0,
    });
  }

  this.updateStreak();
  await this.save();
};

userProgressSchema.methods.updateStreak = function (): void {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastPractice = this.lastPracticeDate
    ? new Date(this.lastPracticeDate)
    : null;

  if (lastPractice) {
    lastPractice.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastPractice.getTime() === today.getTime()) {
      return;
    } else if (lastPractice.getTime() === yesterday.getTime()) {
      this.currentStreak += 1;
      if (this.currentStreak > this.longestStreak) {
        this.longestStreak = this.currentStreak;
      }
    } else {
      this.currentStreak = 1;
    }
  } else {
    this.currentStreak = 1;
    this.longestStreak = 1;
  }

  const studyDate = new Date(today);
  const studyDateStr = studyDate.toDateString();
  const hasStudiedToday = this.studyDays.some(
    (d: Date) => new Date(d).toDateString() === studyDateStr
  );

  if (!hasStudiedToday) {
    this.studyDays.push(studyDate);
  }

  this.lastPracticeDate = new Date();
};

const UserProgress =
  (mongoose.models.UserProgress as UserProgressModel) ||
  model<IUserProgress, UserProgressModel>(
    'UserProgress',
    userProgressSchema
  );

export default UserProgress;
