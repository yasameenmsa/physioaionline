import mongoose, { Schema, model } from 'mongoose';
import { IVoucher, VoucherModel } from '../types/models';

const voucherSchema = new Schema<IVoucher>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['trial', 'premium'],
      required: true,
    },
    durationDays: {
      type: Number,
      default: null,
    },
    maxUses: {
      type: Number,
      default: 1,
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

voucherSchema.index({ active: 1, expiresAt: 1 });

const Voucher =
  (mongoose.models.Voucher as VoucherModel) ||
  model<IVoucher, VoucherModel>('Voucher', voucherSchema);

export default Voucher;
