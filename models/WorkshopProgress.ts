import mongoose, { Schema, model } from 'mongoose';
import type { IWorkshopProgress, WorkshopProgressModel } from '@/types/workshop';

const WorkshopProgressSchema = new Schema<IWorkshopProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    workshopId: { type: Schema.Types.ObjectId, ref: 'Workshop', required: true },
    completedLessons: [{ type: String }],
    completedAt: { type: Date, default: null },
    lastLessonId: { type: String, default: '' },
  },
  { timestamps: true }
);

WorkshopProgressSchema.index({ userId: 1, workshopId: 1 }, { unique: true });

const WorkshopProgress =
  (mongoose.models.WorkshopProgress as WorkshopProgressModel) ||
  model<IWorkshopProgress, WorkshopProgressModel>('WorkshopProgress', WorkshopProgressSchema);

export default WorkshopProgress;
