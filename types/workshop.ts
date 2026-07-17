import { Types, Document, Model } from 'mongoose';
import type { WorkshopBlock } from '@/lib/workshop-blocks';

export interface IWorkshopBlock {
  id: string;
  type: string;
  content: string;
  attrs?: Record<string, any>;
  children?: IWorkshopBlock[];
}

export interface IWorkshopLesson {
  _id: Types.ObjectId;
  title: string;
  order: number;
  isFree: boolean;
  blocks: IWorkshopBlock[];
  children: IWorkshopLesson[];
}

export interface IWorkshopSection {
  _id: Types.ObjectId;
  title: string;
  order: number;
  lessons: IWorkshopLesson[];
}

export interface IWorkshop extends Document {
  title: string;
  slug: string;
  description: string;
  image: string;
  price: number;
  instructor: Types.ObjectId;
  category: string;
  tags: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  language: 'ar' | 'en';
  whatYouLearn: string[];
  requirements: string[];
  published: boolean;
  sections: IWorkshopSection[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IWorkshopProgress extends Document {
  userId: Types.ObjectId;
  workshopId: Types.ObjectId;
  completedLessons: string[];
  completedAt: Date | null;
  lastLessonId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type WorkshopModel = Model<IWorkshop>;
export type WorkshopProgressModel = Model<IWorkshopProgress>;
