import mongoose, { Schema, model } from 'mongoose';
import { IArticle, ArticleModel } from '../types/models';

const articleSchema = new Schema<IArticle>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    blocks: {
      type: String,
      default: null,
    },
    excerpt: {
      type: String,
      required: true,
      maxlength: 300,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['draft', 'review', 'published', 'archived'],
      default: 'draft',
    },
    references: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    version: {
      type: Number,
      default: 1,
      min: 1,
    },
    imageUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ category: 1, status: 1 });
articleSchema.index({ author: 1 });
articleSchema.index({ tags: 1 });
articleSchema.index({ title: 'text', body: 'text', excerpt: 'text' });

articleSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

articleSchema.methods.incrementViews = async function () {
  this.viewCount += 1;
  await this.save();
};

const Article =
  (mongoose.models.Article as ArticleModel) ||
  model<IArticle, ArticleModel>('Article', articleSchema);

export default Article;
