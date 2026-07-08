import mongoose, { Schema, model } from 'mongoose';
import type { IPurchase, PurchaseModel } from '@/types/models';

const PurchaseSchema = new Schema<IPurchase>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'refunded'],
      default: 'pending',
    },
    sessionId: { type: String, default: '' },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

PurchaseSchema.index({ userId: 1, courseId: 1 }, { unique: true });
PurchaseSchema.index({ sessionId: 1 });

const Purchase =
  (mongoose.models.Purchase as PurchaseModel) ||
  model<IPurchase, PurchaseModel>('Purchase', PurchaseSchema);

export default Purchase;
