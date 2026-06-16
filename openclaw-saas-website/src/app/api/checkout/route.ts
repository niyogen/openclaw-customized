import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

export async function POST(req: Request) {
  try {
    const { companyName, email, password, plan, cycle } = await req.json();
    
    const isMax = plan === 'max';
    let amount = 0;
    let interval: 'month' | 'year' = 'month';
    let intervalCount = 1;
    let planNameSuffix = '(1 Month)';
    
    if (isMax) {
      if (cycle === 'yearly') { amount = 7900 * 12; interval = 'year'; planNameSuffix = '(1 Year)'; }
      else if (cycle === 'quarterly') { amount = 8900 * 3; interval = 'month'; intervalCount = 3; planNameSuffix = '(3 Months)'; }
      else { amount = 9900; }
    } else {
      if (cycle === 'yearly') { amount = 1800 * 12; interval = 'year'; planNameSuffix = '(1 Year)'; }
      else if (cycle === 'quarterly') { amount = 2600 * 3; interval = 'month'; intervalCount = 3; planNameSuffix = '(3 Months)'; }
      else { amount = 2900; }
    }
    
    const planName = isMax ? `FastClaw SaaS Max Plan ${planNameSuffix}` : `FastClaw SaaS Pro Plan ${planNameSuffix}`;

    // If STRIPE_SECRET_KEY is not set in your .env file, we simulate the checkout
    // to allow you to test the flow immediately.
    if (!process.env.STRIPE_SECRET_KEY) {
      // Simulate Stripe's checkout redirect by jumping straight to our success page
      const encodedData = Buffer.from(JSON.stringify({ companyName, email })).toString('base64');
      return NextResponse.json({ 
        url: `/success?mock=true&data=${encodedData}` 
      });
    }

    // Real Stripe Checkout Session creation
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: planName,
              description: 'Full access to FastClaw Portal.',
            },
            unit_amount: amount,
            recurring: { interval: interval, interval_count: intervalCount },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription', // Use subscription for automatic recurring billing
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?error=payment_cancelled`,
      customer_email: email,
      metadata: {
        companyName,
        email,
        planType: isMax ? 'max' : 'pro',
        // Note: In production, do not pass plaintext passwords in metadata.
        // Instead, pass an ID and save the user in your DB as 'pending'.
        password,
      },
    });

    // Save order in backend
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_name: companyName,
          email: email,
          stripe_session_id: session.id,
          amount: amount,
        }),
      });
    } catch (e) {
      console.error('Failed to create order in backend:', e);
    }

    return NextResponse.json({ url: session.url, id: session.id });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
