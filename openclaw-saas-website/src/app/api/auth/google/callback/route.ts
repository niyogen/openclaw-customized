import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://openclaw.niyogen.com';

/** Auto-provision a customer tenant if they don't already exist. Idempotent. */
async function ensureTenantProvisioned(email: string, name: string): Promise<string> {
  // 1. Check if tenant already exists
  try {
    const lookupRes = await fetch(`${BACKEND_URL}/api/resolve-tenant?email=${encodeURIComponent(email)}`);
    if (lookupRes.ok) {
      const data = await lookupRes.json();
      // If the lookup found a real customer (not just a fallback), return their subdomain
      if (data.source !== 'fallback' && data.customer_name) {
        console.log(`[Provision] Tenant already exists: ${data.subdomain}`);
        return data.subdomain;
      }
    }
  } catch (e) {
    console.warn('[Provision] Lookup failed, proceeding with provisioning:', e);
  }

  // 2. Provision new tenant
  const companyName = name?.trim() || email.split('@')[0];
  console.log(`[Provision] Creating new tenant for: ${email} as "${companyName}"`);

  try {
    const onboardRes = await fetch(`${BACKEND_URL}/api/website/onboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_name: companyName,
        admin_email: email,
        admin_password: `OpenClaw@${Math.random().toString(36).slice(2, 10)}!`,
        plan: 'pro',
      }),
    });

    if (onboardRes.ok) {
      const onboardData = await onboardRes.json();
      const subdomain = onboardData.subdomain || companyName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      console.log(`[Provision] ✅ Tenant provisioned: ${subdomain}`);
      return subdomain;
    } else {
      const errText = await onboardRes.text();
      console.error('[Provision] Onboard failed:', errText);
      // If "already exists" error, resolve via lookup
      if (errText.includes('already exists')) {
        // Re-try lookup
        const retryRes = await fetch(`${BACKEND_URL}/api/resolve-tenant?email=${encodeURIComponent(email)}`);
        if (retryRes.ok) {
          const retryData = await retryRes.json();
          return retryData.subdomain;
        }
      }
    }
  } catch (e) {
    console.error('[Provision] Onboard request failed:', e);
  }

  // Fallback: use email prefix
  return email.split('@')[0].toLowerCase();
}

export async function GET(request: NextRequest) {
  // Use explicit APP_URL — request.nextUrl.origin is 0.0.0.0:3000 inside Docker
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
    || (request.headers.get('x-forwarded-proto') && request.headers.get('x-forwarded-host')
        ? `${request.headers.get('x-forwarded-proto')}://${request.headers.get('x-forwarded-host')}`
        : request.nextUrl.origin);

  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(new URL('/signup?error=google_oauth_failed', appUrl));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/signup?error=no_code', appUrl));
    }

    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${appUrl}/api/auth/google/callback`;

    if (!googleClientId || !googleClientSecret) {
      console.error('Google OAuth credentials not configured');
      return NextResponse.redirect(new URL('/signup?error=oauth_not_configured', appUrl));
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', await tokenResponse.text());
      return NextResponse.redirect(new URL('/signup?error=token_exchange_failed', appUrl));
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userInfoResponse.ok) {
      return NextResponse.redirect(new URL('/pricing?error=user_info_failed', appUrl));
    }

    const googleUser = await userInfoResponse.json();
    const { email, name } = googleUser;

    if (!email) {
      return NextResponse.redirect(new URL('/pricing?error=no_email', appUrl));
    }

    // ── AUTO-PROVISION TENANT ─────────────────────────────────────────────────
    // Run in background (don't block login) - provision will complete asynchronously
    ensureTenantProvisioned(email, name).catch(e =>
      console.error('[Provision] Background provisioning failed:', e)
    );
    // ─────────────────────────────────────────────────────────────────────────

    // ── CHECK PAYMENT STATUS ──────────────────────────────────────────────────
    let hasPaid = false;

    if (process.env.STRIPE_SECRET_KEY) {
      try {
        // @ts-ignore
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const customers = await stripe.customers.list({ email, limit: 1 });

        if (customers.data.length > 0) {
          const customerId = customers.data[0].id;
          const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: 'active',
            limit: 1,
          });
          if (subscriptions.data.length > 0) {
            hasPaid = true;
          } else {
            const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
            const charges = await stripe.charges.list({ customer: customerId, limit: 1 });
            if (
              charges.data.length > 0 &&
              charges.data[0].status === 'succeeded' &&
              charges.data[0].created > thirtyDaysAgo
            ) {
              hasPaid = true;
            }
          }
        }
      } catch (e) {
        console.error('Stripe payment verification failed:', e);
      }
    }

    // Check for admin-issued coupon
    if (!hasPaid) {
      try {
        const couponRes = await fetch(`${BACKEND_URL}/api/coupon/check?email=${encodeURIComponent(email)}`);
        if (couponRes.ok) {
          const couponData = await couponRes.json();
          if (couponData.has_coupon === true) hasPaid = true;
        }
      } catch (e) {
        console.error('Coupon check failed:', e);
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    const dashUrl = new URL('/dashboard', appUrl);
    dashUrl.searchParams.set('email', email);

    const response = NextResponse.redirect(dashUrl);
    response.cookies.set('fastclaw_portal_auth', 'true', {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
    });
    response.cookies.set('fastclaw_customer_email', email, {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
    });
    response.cookies.set('fastclaw_payment_done', hasPaid ? 'true' : 'false', {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error: any) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(new URL('/pricing?error=callback_failed', appUrl));
  }
}
