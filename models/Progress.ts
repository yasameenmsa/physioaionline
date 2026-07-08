import mongoose, { Schema, model } from 'mongoose';
import type { IProgress, ProgressModel } from '@/types/models';

const ProgressSchema = new Schema<IProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    completedLessons: [{ type: String }],
    completedAt: { type: Date, default: null },
    lastVideoId: { type: String, default: '' },
  },
  { timestamps: true }
);

ProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const Progress =
  (mongoose.models.Progress as ProgressModel) ||
  model<IProgress, ProgressModel>('Progress', ProgressSchema);

export default Progress;
