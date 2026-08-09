import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';
import { rateLimit } from '@/lib/rate-limit';
import { mkdir } from 'fs/promises';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import path from 'path';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/epub+zip',
  'application/zip',
  'application/x-zip-compressed',
  'application/vnd.rar',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  'text/plain',
  'text/csv',
  'application/json',
  'application/octet-stream',
];

const ALLOWED_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf',
  '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx',
  '.epub', '.zip', '.rar', '.7z', '.txt', '.csv', '.json',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024; // 10GB

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
      return apiError('File too large. Maximum size is 10GB.', 400);
    }

    const ext = path.extname(file.name).toLowerCase() || '';
    const mimeAllowed = ALLOWED_MIME_TYPES.includes(file.type);
    const extAllowed = ext.length > 0 && ALLOWED_EXTENSIONS.includes(ext);

    if (!mimeAllowed && !extAllowed) {
      return apiError('Invalid file type. Allowed: PDF, images, DOC, DOCX, PPT, PPTX, XLS, XLSX, EPUB, ZIP, RAR, 7Z, TXT, CSV.', 400);
    }

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const uploadDir = path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), 'storage'));
    const filepath = path.join(uploadDir, filename);

    await mkdir(uploadDir, { recursive: true });
    await pipeline(Readable.fromWeb(file.stream() as any), createWriteStream(filepath));

    const url = `/api/files/${filename}`;
    return apiSuccess({ url }, 'File uploaded');
  } catch (error) {
    console.error('Upload error:', error);
    return apiError('Failed to upload file', 500);
  }
}
