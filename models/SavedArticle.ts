import mongoose, { Schema, model } from 'mongoose';
import { ISavedArticle, SavedArticleModel } from '../types/models';

const savedArticleSchema = new Schema<ISavedArticle>(
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
  },
  { timestamps: true }
);

savedArticleSchema.index({ userId: 1, articleId: 1 }, { unique: true });
savedArticleSchema.index({ userId: 1, createdAt: -1 });

const SavedArticle =
  (mongoose.models.SavedArticle as SavedArticleModel) ||
  model<ISavedArticle, SavedArticleModel>('SavedArticle', savedArticleSchema);

export default SavedArticle;
