import mongoose, { Schema, model } from 'mongoose';
import { IReadingHistory, ReadingHistoryModel } from '../types/models';

const readingHistorySchema = new Schema<IReadingHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    articleId: {
      type: Schema.Types.ObjectId,
      ref: 'Article',
      required: true,
    },
    readAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

readingHistorySchema.index({ userId: 1, readAt: -1 });
readingHistorySchema.index({ userId: 1, articleId: 1 });

const ReadingHistory =
  (mongoose.models.ReadingHistory as ReadingHistoryModel) ||
  model<IReadingHistory, ReadingHistoryModel>('ReadingHistory', readingHistorySchema);

export default ReadingHistory;
