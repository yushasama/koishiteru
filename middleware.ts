import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ASIC_ACCESS_COOKIE, ASIC_ACCESS_PATH, loadAsicAccessConfig } from './lib/asic-access/config';
import { verifySessionToken } from './lib/asic-access/crypto';
import { protectedRequestKind } from './lib/asic-access/routes';

const PRIVATE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0',
  'Content-Security-Policy': "frame-ancestors 'none'; form-action 'self'; base-uri 'self'; object-src 'none'",
  'Permissions-Policy': 'camera=(), geolocation=(), microphone=()',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet, noimageindex',
};

function withPrivateHeaders(response: NextResponse): NextResponse {
  Object.entries(PRIVATE_HEADERS).forEach(([name, value]) => response.headers.set(name, value));
  return response;
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  if (request.nextUrl.pathname === ASIC_ACCESS_PATH) return withPrivateHeaders(NextResponse.next());

  const kind = protectedRequestKind(request.nextUrl);
  if (!kind) return NextResponse.next();

  try {
    const config = loadAsicAccessConfig();
    const token = request.cookies.get(ASIC_ACCESS_COOKIE)?.value;
    if (token && await verifySessionToken(token, config)) return withPrivateHeaders(NextResponse.next());
  } catch (error: unknown) {
    console.error('ASIC access gate is unavailable:', error instanceof Error ? error.message : 'unknown configuration error');
    return withPrivateHeaders(new NextResponse(null, { status: 503 }));
  }

  if (kind === 'asset') return withPrivateHeaders(new NextResponse(null, { status: 401 }));
  return withPrivateHeaders(NextResponse.redirect(new URL(ASIC_ACCESS_PATH, request.url), 307));
}

export const config = {
  matcher: '/:path*',
};
