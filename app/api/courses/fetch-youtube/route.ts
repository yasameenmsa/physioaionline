import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';
import { rateLimit } from '@/lib/rate-limit';
import { fetchFromUrl } from '@/lib/youtube';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return apiError('Unauthorized', 401);

    const rl = rateLimit(`youtube:${session.user.id}`, 10, 60 * 60 * 1000);
    if (!rl.allowed) {
      return apiError(`Rate limit exceeded. Try again in ${Math.ceil(rl.retryAfterMs / 60000)} minutes.`, 429);
    }

    const { url } = await req.json();
    if (!url) return apiError('YouTube URL is required', 400);

    const result = await fetchFromUrl(url);

    return apiSuccess(result);
  } catch (error) {
    console.error('YouTube fetch error:', error);
    return apiError('Failed to fetch YouTube data', 500);
  }
}
