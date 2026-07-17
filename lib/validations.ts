import { z } from 'zod';

const titleSchema = z.string().trim().min(1, 'Title is required').max(200);
const slugableTitle = z.string().trim().min(1, 'Title is required').max(200);
const descriptionSchema = z.string().max(5000).optional();
const priceSchema = z.number().min(0).max(99999).optional();
const levelSchema = z.enum(['beginner', 'intermediate', 'advanced']).optional();
const languageSchema = z.enum(['ar', 'en']).optional();
const tagsSchema = z.array(z.string().max(50)).max(20).optional();
const imageSchema = z.string().url('Invalid image URL').max(2000).optional().or(z.literal(''));
const boolSchema = z.boolean().optional();

const sectionSchema = z.object({
  title: z.string().max(200).optional(),
  lessons: z.array(z.any()).optional(),
}).passthrough();

const blockSchema = z.object({
  id: z.string(),
  type: z.string(),
  content: z.string().max(100000).optional(),
  attrs: z.record(z.any()).optional(),
}).passthrough();

const lessonSchema = z.object({
  id: z.string().optional(),
  title: z.string().max(200).optional(),
  blocks: z.array(blockSchema).optional(),
  children: z.array(z.any()).optional(),
}).passthrough();

const courseCreateSchema = z.object({
  title: slugableTitle,
  description: descriptionSchema,
  price: priceSchema,
  level: levelSchema,
  category: z.string().max(100).optional(),
  tags: tagsSchema,
  image: imageSchema,
  whatYouLearn: z.array(z.string().max(500)).max(20).optional(),
  requirements: z.array(z.string().max(500)).max(20).optional(),
  sections: z.array(sectionSchema).min(1, 'At least one section is required'),
  published: boolSchema,
});

const courseUpdateSchema = z.object({
  title: slugableTitle.optional(),
  description: descriptionSchema,
  price: priceSchema,
  level: levelSchema,
  category: z.string().max(100).optional(),
  tags: tagsSchema,
  image: imageSchema,
  whatYouLearn: z.array(z.string().max(500)).max(20).optional(),
  requirements: z.array(z.string().max(500)).max(20).optional(),
  sections: z.array(sectionSchema).optional(),
  published: boolSchema,
});

const workshopCreateSchema = z.object({
  title: slugableTitle,
  description: descriptionSchema,
  price: priceSchema,
  level: levelSchema,
  language: languageSchema,
  category: z.string().max(100).optional(),
  tags: tagsSchema,
  image: imageSchema,
  whatYouLearn: z.array(z.string().max(500)).max(20).optional(),
  requirements: z.array(z.string().max(500)).max(20).optional(),
  sections: z.array(sectionSchema).optional(),
  published: boolSchema,
});

const workshopUpdateSchema = z.object({
  title: slugableTitle.optional(),
  titleAr: z.string().max(200).optional(),
  description: descriptionSchema,
  price: priceSchema,
  level: levelSchema,
  language: languageSchema,
  category: z.string().max(100).optional(),
  tags: tagsSchema,
  image: imageSchema,
  whatYouLearn: z.array(z.string().max(500)).max(20).optional(),
  requirements: z.array(z.string().max(500)).max(20).optional(),
  sections: z.array(sectionSchema).optional(),
  published: boolSchema,
});

const newsCreateSchema = z.object({
  title: titleSchema,
  titleAr: z.string().max(200).optional(),
  content: z.string().trim().min(1, 'Content is required').max(100000),
  contentAr: z.string().max(100000).optional(),
  excerpt: z.string().max(500).optional(),
  excerptAr: z.string().max(500).optional(),
  imageUrl: z.string().max(2000).optional().or(z.literal('')),
  tags: z.array(z.string().max(50)).max(20).optional(),
  published: boolSchema,
});

const newsUpdateSchema = z.object({
  title: titleSchema.optional(),
  titleAr: z.string().max(200).optional(),
  content: z.string().max(100000).optional(),
  contentAr: z.string().max(100000).optional(),
  excerpt: z.string().max(500).optional(),
  excerptAr: z.string().max(500).optional(),
  imageUrl: z.string().max(2000).optional().or(z.literal('')),
  tags: z.array(z.string().max(50)).max(20).optional(),
  published: boolSchema,
});

const profileUpdateSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  bio: z.string().max(2000).optional(),
  image: z.string().max(2000).optional().or(z.literal('')),
});

export type CourseCreateInput = z.infer<typeof courseCreateSchema>;
export type CourseUpdateInput = z.infer<typeof courseUpdateSchema>;
export type WorkshopCreateInput = z.infer<typeof workshopCreateSchema>;
export type WorkshopUpdateInput = z.infer<typeof workshopUpdateSchema>;
export type NewsCreateInput = z.infer<typeof newsCreateSchema>;
export type NewsUpdateInput = z.infer<typeof newsUpdateSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const firstError = result.error.errors[0];
  const message = firstError ? `${firstError.path.join('.')}: ${firstError.message}` : 'Validation failed';
  return { success: false, error: message };
}

export const schemas = {
  courseCreate: courseCreateSchema,
  courseUpdate: courseUpdateSchema,
  workshopCreate: workshopCreateSchema,
  workshopUpdate: workshopUpdateSchema,
  newsCreate: newsCreateSchema,
  newsUpdate: newsUpdateSchema,
  profileUpdate: profileUpdateSchema,
};
