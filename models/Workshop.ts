import mongoose, { Schema, model } from 'mongoose';
import type { IWorkshop, WorkshopModel } from '@/types/workshop';

const WorkshopBlockSchema = new Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: [
        'paragraph', 'heading', 'image', 'youtube', 'quote', 'code',
        'list', 'divider', 'columns', 'callout', 'toggle', 'table',
        'file', 'quiz',
      ],
    },
    content: { type: String, default: '' },
    attrs: { type: Schema.Types.Mixed, default: {} },
    children: { type: [Schema.Types.Mixed], default: [] },
  },
  { _id: false }
);

const WorkshopLessonSchema = new Schema(
  {
    title: { type: String, required: true },
    order: { type: Number, required: true },
    isFree: { type: Boolean, default: false },
    blocks: { type: [WorkshopBlockSchema], default: [] },
  },
  { _id: true }
);

// Recursive children — must be added AFTER schema creation
WorkshopLessonSchema.add({ children: { type: [WorkshopLessonSchema], default: [] } });

const WorkshopSectionSchema = new Schema(
  {
    title: { type: String, required: true },
    order: { type: Number, required: true },
    lessons: { type: [WorkshopLessonSchema], default: [] },
  },
  { _id: true }
);

const WorkshopSchema = new Schema<IWorkshop>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    price: { type: Number, default: 0 },
    instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, default: '' },
    tags: [{ type: String }],
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    language: {
      type: String,
      enum: ['ar', 'en'],
      default: 'en',
    },
    whatYouLearn: [{ type: String }],
    requirements: [{ type: String }],
    published: { type: Boolean, default: false },
    sections: { type: [WorkshopSectionSchema], default: [] },
  },
  { timestamps: true }
);

WorkshopSchema.index({ instructor: 1 });
WorkshopSchema.index({ published: 1, createdAt: -1 });
WorkshopSchema.index({ category: 1 });

const Workshop =
  (mongoose.models.Workshop as WorkshopModel) ||
  model<IWorkshop, WorkshopModel>('Workshop', WorkshopSchema);

export default Workshop;
