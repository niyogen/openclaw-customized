import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    
    if (!googleClientId) {
      console.error('GOOGLE_CLIENT_ID is not configured');
      return NextResponse.json(
        { error: 'Google OAuth is not configured' },
        { status: 500 }
      );
    }

    // Use explicit APP_URL env var — request.nextUrl.origin resolves to the
    // internal Docker address (0.0.0.0:3000) behind a reverse proxy, not the
    // public domain. Fall back to x-forwarded-host header, then request origin.
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
      || (request.headers.get('x-forwarded-proto') && request.headers.get('x-forwarded-host')
          ? `${request.headers.get('x-forwarded-proto')}://${request.headers.get('x-forwarded-host')}`
          : request.nextUrl.origin);
    const redirectUri = `${appUrl}/api/auth/google/callback`;

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', googleClientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'openid email profile');
    // Note: access_type=offline + prompt=consent cause Error 400 invalid_request
    // for unverified/testing OAuth apps. We only need the user's email + profile.
    authUrl.searchParams.set('access_type', 'online');
    
    const originParam = request.nextUrl.searchParams.get('origin') || 'signup';
    
    // We can pass a state parameter if needed
    authUrl.searchParams.set('state', originParam);

    return NextResponse.redirect(authUrl.toString());
  } catch (error: any) {
    console.error('Google OAuth initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Google OAuth' },
      { status: 500 }
    );
  }
}
