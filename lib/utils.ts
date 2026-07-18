import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function successResponse<T>(data: T, message?: string) {
  return Response.json({
    success: true,
    data,
    message,
  });
}

export function errorResponse(message: string, status: number = 400) {
  return Response.json(
    {
      success: false,
      error: message,
    },
    { status }
  );
}

export async function parseRequestBody<T>(
  request: Request,
  schema: { safeParse: (data: unknown) => { success?: boolean; data?: T; error?: { issues: Array<{ path: (string | number)[]; message: string }> } } }
): Promise<{ data?: T; error?: string }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      const firstError = (result as { error: { issues: Array<{ path: (string | number)[]; message: string }> } }).error.issues[0];
      return {
        error: `${firstError.path.join('.')}: ${firstError.message}`,
      };
    }

    return { data: result.data };
  } catch (e) {
    return { error: 'Invalid JSON' };
  }
}

export async function getSessionUser() {
  const { auth } = await import('@/lib/auth');
  const session = await auth();
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) {
    return null;
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (!user || user.role !== 'admin') {
    return null;
  }
  return user;
}

export function apiError(message: string, status: number = 400): Response {
  return Response.json({ success: false, error: message }, { status });
}

export function apiSuccess<T>(data: T, message?: string): Response {
  return Response.json({ success: true, data, message });
}

export function formatDate(date: Date | string, locale: string = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) {
    return text;
  }
  return text.slice(0, length) + '...';
}

export function generateSlug(text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  if (!slug) {
    return `workshop-${Date.now()}`;
  }
  return slug;
}

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}
