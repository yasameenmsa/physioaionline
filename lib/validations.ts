import { z } from 'zod';

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
  .regex(/\d/, 'Password must contain at least one number');

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const answerSchema = z.object({
  answer: z.number().int().min(0).max(3),
});

export const waitlistSchema = z.object({
  email: emailSchema,
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export const resendVerificationSchema = z.object({
  email: emailSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const profileUpdateSchema = z.object({
  name: z.string().optional(),
  timezone: z.string().optional(),
});

export const paymentProcessSchema = z.object({
  action: z.enum(['approve', 'reject']),
  rejectionReason: z.string().optional(),
  adminNotes: z.string().optional(),
});

export const articleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  body: z.string().min(1, 'Body is required'),
  excerpt: z.string().min(1, 'Excerpt is required').max(300),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).optional().default([]),
  references: z.array(z.string()).optional().default([]),
  imageUrl: z.string().optional(),
});

export const articleUpdateSchema = articleSchema.partial().extend({
  status: z.enum(['draft', 'review', 'published', 'archived']).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AnswerInput = z.infer<typeof answerSchema>;
export type WaitlistInput = z.infer<typeof waitlistSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type PaymentProcessInput = z.infer<typeof paymentProcessSchema>;
export type ArticleInput = z.infer<typeof articleSchema>;
export type ArticleUpdateInput = z.infer<typeof articleUpdateSchema>;
