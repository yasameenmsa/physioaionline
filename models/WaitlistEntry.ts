import mongoose, { Schema, model } from 'mongoose';
import { IWaitlistEntry, WaitlistEntryModel } from '../types/models';

const waitlistEntrySchema = new Schema<IWaitlistEntry>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    converted: {
      type: Boolean,
      default: false,
    },
    convertedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

waitlistEntrySchema.index({ converted: 1 });

const WaitlistEntry =
  (mongoose.models.WaitlistEntry as WaitlistEntryModel) ||
  model<IWaitlistEntry, WaitlistEntryModel>(
    'WaitlistEntry',
    waitlistEntrySchema
  );

export default WaitlistEntry;
