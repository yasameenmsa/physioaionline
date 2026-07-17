import { z } from 'zod';

const workshopBlockSchema = z.object({
  id: z.string(),
  type: z.enum([
    'paragraph', 'heading', 'image', 'youtube', 'quote', 'code',
    'list', 'divider', 'columns', 'callout', 'toggle', 'table',
    'file', 'quiz',
  ]),
  content: z.string().default(''),
  attrs: z.record(z.any()).optional(),
  children: z.array(z.any()).optional(),
});

const workshopLessonSchema = z.object({
  title: z.string().min(1, 'Lesson title is required'),
  order: z.number(),
  isFree: z.boolean().default(false),
  blocks: z.array(workshopBlockSchema).default([]),
});

const workshopSectionSchema = z.object({
  title: z.string().min(1, 'Section title is required'),
  order: z.number(),
  lessons: z.array(workshopLessonSchema).default([]),
});

export const workshopCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).default(''),
  image: z.string().default(''),
  price: z.number().min(0).default(0),
  category: z.string().default(''),
  tags: z.array(z.string()).default([]),
  level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  whatYouLearn: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  published: z.boolean().default(false),
  sections: z.array(workshopSectionSchema).default([]),
});

export const workshopUpdateSchema = workshopCreateSchema.partial();

export const workshopBlocksUpdateSchema = z.object({
  sections: z.array(workshopSectionSchema),
});

export type WorkshopCreateInput = z.infer<typeof workshopCreateSchema>;
export type WorkshopUpdateInput = z.infer<typeof workshopUpdateSchema>;
export type WorkshopBlocksUpdateInput = z.infer<typeof workshopBlocksUpdateSchema>;
