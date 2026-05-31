import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;

  const sanitized = path.basename(name);
  const uploadDir = path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), 'storage'));
  const filepath = path.join(uploadDir, sanitized);

  if (!existsSync(filepath)) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const ext = path.extname(sanitized).toLowerCase();
  const mime: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
  };

  const buffer = await readFile(filepath);
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': mime[ext] || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
