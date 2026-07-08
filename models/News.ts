import mongoose, { Schema, model } from 'mongoose';
import type { INews, NewsModel } from '@/types/models';

const newsSchema = new Schema<INews>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    published: { type: Boolean, default: false },
    tags: [{ type: String }],
    viewCount: { type: Number, default: 0 },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

newsSchema.index({ published: 1, publishedAt: -1 });
newsSchema.index({ tags: 1 });

const News = (mongoose.models.News as NewsModel) || model<INews, NewsModel>('News', newsSchema);

export default News;
