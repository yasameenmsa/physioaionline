import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';
import { fetchFromUrl } from '@/lib/youtube';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return apiError('Unauthorized', 401);

    const { url } = await req.json();
    if (!url) return apiError('YouTube URL is required', 400);

    const result = await fetchFromUrl(url);

    return apiSuccess(result);
  } catch (error: any) {
    console.error('YouTube fetch error:', error);
    return apiError(error.message || 'Failed to fetch YouTube data', 500);
  }
}
