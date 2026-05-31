import mongoose, { Schema, model } from 'mongoose';
import { ICategory, CategoryModel } from '../types/models';

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    questionCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

categorySchema.index({ active: 1 });
categorySchema.index({ parentCategory: 1 });

categorySchema.pre('find', function () {
  this.where({ active: true });
});

const Category =
  (mongoose.models.Category as CategoryModel) ||
  model<ICategory, CategoryModel>('Category', categorySchema);

export default Category;
