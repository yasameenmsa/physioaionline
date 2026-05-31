import mongoose, { Schema, model } from 'mongoose';
import { IPaymentVerification, PaymentVerificationModel } from '../types/models';

const paymentVerificationSchema = new Schema<IPaymentVerification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestedTier: {
      type: String,
      enum: ['premium', 'pro'],
      required: true,
    },
    screenshotPath: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
    },
    adminNotes: {
      type: String,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    processedAt: {
      type: Date,
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

paymentVerificationSchema.index({ userId: 1 });
paymentVerificationSchema.index({ status: 1 });
paymentVerificationSchema.index({ submittedAt: -1 });
paymentVerificationSchema.index({ status: 1, submittedAt: -1 });

const PaymentVerification =
  (mongoose.models.PaymentVerification as PaymentVerificationModel) ||
  model<IPaymentVerification, PaymentVerificationModel>(
    'PaymentVerification',
    paymentVerificationSchema
  );

export default PaymentVerification;
