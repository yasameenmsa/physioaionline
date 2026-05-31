import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return apiError('Unauthorized', 401);
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return apiError('No file provided');
    }

    const ext = path.extname(file.name) || '.jpg';
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
