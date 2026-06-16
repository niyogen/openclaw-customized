import asyncio
import os
import json
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.db import models
from app.main import stripe_webhook
from fastapi import Request

class MockRequest:
    def __init__(self, body_bytes):
        self._body = body_bytes
        self.headers = {}
        
    async def body(self):
        return self._body

async def test_stripe_subscription_cancellation():
    print("🚀 Starting Stripe Subscription Cancellation Test...")
    db = SessionLocal()
    
    test_stripe_customer = "cus_mock_test_777"
    test_subdomain = "stripe-cancel-test"
    
    # 1. Setup a clean active customer
    existing = db.query(models.Customer).filter(models.Customer.subdomain == test_subdomain).first()
    if existing:
        db.delete(existing)
    db.commit()
    
    customer = models.Customer(
        customer_name="Cancel Test Corp",
        subdomain=test_subdomain,
        stripe_customer_id=test_stripe_customer,
        is_active=True
    )
    db.add(customer)
    db.commit()
    print(f"✅ Created active customer: {customer.subdomain} (is_active={customer.is_active})")
    
    # 2. Simulate Webhook
    print("\n💳 Simulating 'customer.subscription.deleted' webhook event...")
    mock_payload = {
        "id": "evt_test_delete_123",
        "type": "customer.subscription.deleted",
        "data": {
            "object": {
                "id": "sub_mock_123",
                "customer": test_stripe_customer
            }
        }
    }
    
    req = MockRequest(json.dumps(mock_payload).encode('utf-8'))
    
    try:
        # Temporarily bypass signature
        original_secret = os.environ.get("STRIPE_WEBHOOK_SECRET")
        if "STRIPE_WEBHOOK_SECRET" in os.environ:
            del os.environ["STRIPE_WEBHOOK_SECRET"]
            
        await stripe_webhook(request=req, db=db)
        
        if original_secret:
            os.environ["STRIPE_WEBHOOK_SECRET"] = original_secret
            
    except Exception as e:
        print(f"❌ Webhook failed: {e}")
        db.close()
        return

    # 3. Verify Database
    print("\n🔍 Verifying Database State...")
    db.expire_all()
    
    updated_customer = db.query(models.Customer).filter(models.Customer.stripe_customer_id == test_stripe_customer).first()
    if not updated_customer.is_active:
        print(f"✅ Success! Customer account is now LOCKED (is_active=False)")
    else:
        print("❌ Failed! Customer account is still active.")
        
    print("\n🎉 Test Completed!")
    db.close()

if __name__ == "__main__":
    asyncio.run(test_stripe_subscription_cancellation())
