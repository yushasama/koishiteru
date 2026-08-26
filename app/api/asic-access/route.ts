import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ASIC_ACCESS_COOKIE, ASIC_ACCESS_PATH, ASIC_ACCESS_SESSION_SECONDS, ASIC_ARTICLE_PATH, loadAsicAccessConfig } from '../../../lib/asic-access/config';
import { createSessionToken, verifyPassword } from '../../../lib/asic-access/crypto';

function redirectToAccess(request: NextRequest, error: string): NextResponse {
  const destination = new URL(ASIC_ACCESS_PATH, request.url);
  destination.searchParams.set('error', error);
  const response = NextResponse.redirect(destination, 303);
  response.headers.set('Cache-Control', 'private, no-store, max-age=0');
  return response;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return redirectToAccess(request, 'invalid');
  }

  const submittedPassword = form.get('password');
  if (typeof submittedPassword !== 'string' || submittedPassword.length < 1 || submittedPassword.length > 1024) return redirectToAccess(request, 'invalid');

  try {
    const config = loadAsicAccessConfig();
    if (!await verifyPassword(submittedPassword, config)) return redirectToAccess(request, 'invalid');

    const response = NextResponse.redirect(new URL(ASIC_ARTICLE_PATH, request.url), 303);
    response.cookies.set(ASIC_ACCESS_COOKIE, await createSessionToken(config), { httpOnly: true, maxAge: ASIC_ACCESS_SESSION_SECONDS, path: '/', sameSite: 'lax', secure: config.secureCookies });
    response.headers.set('Cache-Control', 'private, no-store, max-age=0');
    return response;
  } catch (error: unknown) {
    console.error('ASIC access sign-in failed:', error instanceof Error ? error.message : 'unknown configuration error');
    return redirectToAccess(request, 'unavailable');
  }
}
