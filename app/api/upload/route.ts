import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';
import { rateLimit } from '@/lib/rate-limit';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return apiError('Unauthorized', 401);
    }

    const rl = rateLimit(`upload:${session.user.id}`, 20, 60 * 60 * 1000);
    if (!rl.allowed) {
      return apiError(`Rate limit exceeded. Try again in ${Math.ceil(rl.retryAfterMs / 60000)} minutes.`, 429);
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return apiError('No file provided');
    }

    if (file.size > MAX_FILE_SIZE) {
      return apiError('File too large. Maximum size is 5MB.', 400);
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return apiError('Invalid file type. Allowed: JPEG, PNG, GIF, WebP, PDF.', 400);
    }

    const ext = path.extname(file.name).toLowerCase() || '.jpg';
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return apiError('Invalid file extension.', 400);
    }

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const uploadDir = path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), 'storage'));
    const filepath = path.join(uploadDir, filename);

    await mkdir(uploadDir, { recursive: true });
    const bytes = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(bytes));

    const url = `/api/files/${filename}`;
    return apiSuccess({ url }, 'File uploaded');
  } catch (error) {
    console.error('Upload error:', error);
    return apiError('Failed to upload file', 500);
  }
}
