import { NextResponse } from 'next/server';

const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour window in milliseconds
const RATE_LIMIT_MAX_ATTEMPTS = 5; // Allow 5 attempts per window

export function middleware(req) {
  const clientIP = req.headers.get('x-forwarded-for') || req.ip || 'UNKNOWN';
  const currentTime = Date.now();

  if (!rateLimitMap.has(clientIP)) {
    rateLimitMap.set(clientIP, { count: 1, firstRequest: currentTime });
    return NextResponse.next();
  }

  const { count, firstRequest } = rateLimitMap.get(clientIP);

  if (currentTime - firstRequest > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(clientIP, { count: 1, firstRequest: currentTime });
    return NextResponse.next();
  }

  if (count < RATE_LIMIT_MAX_ATTEMPTS) {
    rateLimitMap.set(clientIP, { count: count + 1, firstRequest });
    return NextResponse.next();
  }

  return new NextResponse('Too many requests, try again later.', { status: 429 });
}

export const config = {
  matcher: '/api/auth/login', // Apply middleware only to login route
};
