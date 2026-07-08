import mongoose, { Schema, model } from 'mongoose';
import type { ICourse, CourseModel } from '@/types/models';

const LessonSchema = new Schema({
  title: { type: String, required: true },
  videoId: { type: String, required: true },
  videoUrl: { type: String, required: true },
  duration: { type: Number, default: 0 },
  order: { type: Number, required: true },
  isFree: { type: Boolean, default: false },
});

const SectionSchema = new Schema({
  title: { type: String, required: true },
  order: { type: Number, required: true },
  lessons: [LessonSchema],
});

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
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
    whatYouLearn: [{ type: String }],
    requirements: [{ type: String }],
    published: { type: Boolean, default: false },
    sections: [SectionSchema],
  },
  { timestamps: true }
);

CourseSchema.index({ instructor: 1 });
CourseSchema.index({ published: 1, createdAt: -1 });

const Course =
  (mongoose.models.Course as CourseModel) ||
  model<ICourse, CourseModel>('Course', CourseSchema);

export default Course;
