import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { auth } from '@/lib/auth';

const SAFE_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name } = await params;

  const sanitized = path.basename(name);
  const uploadDir = path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), 'storage'));
  const filepath = path.join(uploadDir, sanitized);

  if (!existsSync(filepath)) {
    const placeholder = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#f3f4f6"/><text x="200" y="150" font-family="sans-serif" font-size="14" fill="#9ca3af" text-anchor="middle">Image not available</text></svg>`;
    return new NextResponse(placeholder, {
      headers: { 'Content-Type': 'image/svg+xml' },
    });
  }

  const ext = path.extname(sanitized).toLowerCase();

  const buffer = await readFile(filepath);
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': SAFE_MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
