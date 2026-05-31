import { NextRequest, NextResponse } from 'next/server';
import { describe, it, expect, vi } from 'vitest';

function createRequest(urlStr: string, cookies: Record<string, string> = {}) {
  const url = new URL(urlStr, 'http://localhost:3000');
  return {
    url: url.href,
    nextUrl: url,
    cookies: {
      get: (name: string) => {
        const val = cookies[name];
        return val ? { value: val } : undefined;
      },
    },
  } as unknown as NextRequest;
}

describe('proxy', () => {
  it('allows public routes without token', async () => {
    const { default: proxy } = await import('@/proxy');
    const req = createRequest('http://localhost:3000/login');
    const res = proxy(req);
    expect(res).toBeInstanceOf(NextResponse);
  });

  it('allows public prefixes without token', async () => {
    const { default: proxy } = await import('@/proxy');
    const req = createRequest('http://localhost:3000/articles/some-post');
    const res = proxy(req);
    expect(res).toBeInstanceOf(NextResponse);
  });

  it('redirects to login for protected route without token', async () => {
    const { default: proxy } = await import('@/proxy');
    const req = createRequest('http://localhost:3000/dashboard');
    const res = proxy(req) as NextResponse;
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/login');
  });

  it('allows protected route with valid token', async () => {
    const { default: proxy } = await import('@/proxy');
    const req = createRequest('http://localhost:3000/dashboard', {
      'authjs.session-token': 'valid-token',
    });
    const res = proxy(req);
    expect(res).toBeInstanceOf(NextResponse);
  });

  it('allows protected route with secure token', async () => {
    const { default: proxy } = await import('@/proxy');
    const req = createRequest('http://localhost:3000/dashboard', {
      '__Secure-authjs.session-token': 'valid-token',
    });
    const res = proxy(req);
    expect(res).toBeInstanceOf(NextResponse);
  });

  it('allows static files', async () => {
    const { default: proxy } = await import('@/proxy');
    const req = createRequest('http://localhost:3000/_next/static/chunk.js');
    const res = proxy(req);
    expect(res).toBeInstanceOf(NextResponse);
  });

  it('allows image files', async () => {
    const { default: proxy } = await import('@/proxy');
    const req = createRequest('http://localhost:3000/image.png');
    const res = proxy(req);
    expect(res).toBeInstanceOf(NextResponse);
  });
});
