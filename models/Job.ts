import mongoose, { Schema, model } from 'mongoose';
import type { IJob, JobModel } from '@/types/models';

const jobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    company: { type: String, required: true },
    location: { type: String, default: '' },
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'remote', 'contract', 'internship'],
      default: 'full-time',
    },
    description: { type: String, required: true },
    excerpt: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    applyUrl: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    published: { type: Boolean, default: false },
    tags: [{ type: String }],
    viewCount: { type: Number, default: 0 },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

jobSchema.index({ published: 1, publishedAt: -1 });
jobSchema.index({ tags: 1 });

const Job = (mongoose.models.Job as JobModel) || model<IJob, JobModel>('Job', jobSchema);

export default Job;
