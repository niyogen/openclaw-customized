import stripe
import requests
import json
import time
import hmac
import hashlib
import os

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY", "sk_test_placeholder")


print("Creating checkout session (price $20)...")
session = stripe.checkout.Session.create(
  payment_method_types=['card'],
  line_items=[{
    'price_data': {
      'currency': 'usd',
      'product_data': {'name': 'OpenClaw SaaS Pro Plan (1 Month)'},
      'unit_amount': 2000,
    },
    'quantity': 1,
  }],
  mode='payment',
  success_url='http://localhost:3000/success',
  cancel_url='http://localhost:3000/signup',
  customer_email="itranga@gmail.com"
)
session_id = session.id
print(f"Session created: {session_id}")

backend_url = "https://openclaw.niyogen.com"
print("Creating pending order in AWS backend...")
res = requests.post(f"{backend_url}/api/orders", json={
    "company_name": "Ranga Corp",
    "email": "itranga@gmail.com",
    "stripe_session_id": session_id,
    "amount": 2000
})
print("Order creation response:", res.status_code, res.text)

print("Simulating Stripe Webhook (checkout.session.completed)...")
payload = json.dumps({
    "id": "evt_test_email_123",
    "object": "event",
    "type": "checkout.session.completed",
    "data": {
        "object": {
            "id": session_id,
            "payment_status": "paid"
        }
    }
}, separators=(',', ':'))

timestamp = int(time.time())
signed_payload = f"{timestamp}.{payload}"
secret = os.environ.get("STRIPE_WEBHOOK_SECRET", "whsec_placeholder").encode('utf-8')
signature = hmac.new(secret, signed_payload.encode('utf-8'), hashlib.sha256).hexdigest()
stripe_signature = f"t={timestamp},v1={signature}"

headers = {
    "stripe-signature": stripe_signature,
    "Content-Type": "application/json"
}

res = requests.post(f"{backend_url}/api/webhook/stripe", data=payload, headers=headers)
print("Webhook response:", res.status_code, res.text)
