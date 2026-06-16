import stripe
import json
import time
import hmac
import hashlib
import traceback

payload = json.dumps({
    "id": "evt_test_123",
    "object": "event",
    "type": "checkout.session.completed",
    "data": {
        "object": {
            "id": "cs_test_something",
            "payment_status": "paid"
        }
    }
}, separators=(',', ':'))

timestamp = int(time.time())
signed_payload = f"{timestamp}.{payload}"
secret = b"whsec_e1cNvLunlfgqkmiMMjNWOyA5EtQmpQdT"
signature = hmac.new(secret, signed_payload.encode('utf-8'), hashlib.sha256).hexdigest()
stripe_signature = f"t={timestamp},v1={signature}"

try:
    event = stripe.Webhook.construct_event(payload, stripe_signature, "whsec_e1cNvLunlfgqkmiMMjNWOyA5EtQmpQdT")
    
    event_type = event.get('type') if isinstance(event, dict) else event.type
    if event_type == 'checkout.session.completed':
        session = event.get('data', {}).get('object') if isinstance(event, dict) else event.data.object
        session_id = session.get('id') if isinstance(session, dict) else session.id
        print("Session ID:", session_id)
except Exception as e:
    traceback.print_exc()
