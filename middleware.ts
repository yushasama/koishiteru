import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ASIC_ACCESS_COOKIE, ASIC_ACCESS_PATH, ASIC_ACCESS_SESSION_SECONDS, ASIC_ARTICLE_PATH, type AsicAccessConfig, loadAsicAccessConfig } from './lib/asic-access/config';
import { createSessionToken, verifyPassword, verifySessionToken } from './lib/asic-access/crypto';
import { protectedRequestKind } from './lib/asic-access/routes';

const SHARED_PASSWORD_QUERY = 'p';

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

function redirectToAccess(request: NextRequest, error: 'invalid' | 'unavailable'): NextResponse {
  const destination = new URL(ASIC_ACCESS_PATH, request.url);
  destination.searchParams.set('error', error);
  return withPrivateHeaders(NextResponse.redirect(destination, 303));
}

function cleanSharedLinkDestination(request: NextRequest): URL {
  const destination = request.nextUrl.clone();
  destination.searchParams.delete(SHARED_PASSWORD_QUERY);
  if (destination.pathname !== ASIC_ACCESS_PATH) return destination;
  destination.pathname = ASIC_ARTICLE_PATH;
  destination.search = '';
  return destination;
}

async function sharedAccessResponse(request: NextRequest, config: AsicAccessConfig): Promise<NextResponse | null> {
  const password = request.nextUrl.searchParams.get(SHARED_PASSWORD_QUERY);
  if (password === null) return null;
  if (password.length < 1 || password.length > 1024 || !await verifyPassword(password, config)) return redirectToAccess(request, 'invalid');

  const response = NextResponse.redirect(cleanSharedLinkDestination(request), 303);
  response.cookies.set(ASIC_ACCESS_COOKIE, await createSessionToken(config), { httpOnly: true, maxAge: ASIC_ACCESS_SESSION_SECONDS, path: '/', sameSite: 'lax', secure: config.secureCookies });
  return withPrivateHeaders(response);
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  if (request.nextUrl.pathname === ASIC_ACCESS_PATH) {
    if (!request.nextUrl.searchParams.has(SHARED_PASSWORD_QUERY)) return withPrivateHeaders(NextResponse.next());
    try {
      return await sharedAccessResponse(request, loadAsicAccessConfig()) ?? withPrivateHeaders(NextResponse.next());
    } catch (error: unknown) {
      console.error('ASIC shared access failed:', error instanceof Error ? error.message : 'unknown configuration error');
      return redirectToAccess(request, 'unavailable');
    }
  }

  const kind = protectedRequestKind(request.nextUrl);
  if (!kind) return NextResponse.next();

  try {
    const config = loadAsicAccessConfig();
    const token = request.cookies.get(ASIC_ACCESS_COOKIE)?.value;
    if (token && await verifySessionToken(token, config)) {
      if (kind === 'document' && request.nextUrl.searchParams.has(SHARED_PASSWORD_QUERY)) return withPrivateHeaders(NextResponse.redirect(cleanSharedLinkDestination(request), 303));
      return withPrivateHeaders(NextResponse.next());
    }
    if (kind === 'document') {
      const sharedResponse = await sharedAccessResponse(request, config);
      if (sharedResponse) return sharedResponse;
    }
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
