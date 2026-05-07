import { NextRequest, NextResponse } from 'next/server';

/**
 * OAuth2 callback handler for social auth providers (Google, GitHub, etc.)
 *
 * Google (and other providers) redirect to:
 *   /api/auth/callback/{provider}?code=...&state=...
 *
 * This route redirects to the frontend callback page at /callback which
 * handles the token exchange by calling the backend /social-auth/complete.
 *
 * WHY: The catch-all proxy at /api/auth/[...path] would forward this to
 * the backend where no matching route exists. This specific route takes
 * precedence and correctly routes the OAuth response to the React handler.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } },
) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');

  // Build redirect to the frontend callback page, preserving all OAuth params
  const callbackUrl = new URL('/callback', url.origin);

  if (error) {
    callbackUrl.searchParams.set('error', error);
    if (errorDescription) callbackUrl.searchParams.set('error_description', errorDescription);
  } else {
    if (code) callbackUrl.searchParams.set('code', code);
    if (state) callbackUrl.searchParams.set('state', state);
    callbackUrl.searchParams.set('provider', params.provider);
  }

  return NextResponse.redirect(callbackUrl.toString());
}
