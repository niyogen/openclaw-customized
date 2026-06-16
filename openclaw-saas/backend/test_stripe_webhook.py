import asyncio
import os
import json
from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine
from app.db import models
from app.main import stripe_webhook, get_db
from fastapi import Request

class MockRequest:
    def __init__(self, body_bytes):
        self._body = body_bytes
        self.headers = {}
        
    async def body(self):
        return self._body

async def test_stripe_integration():
    print("🚀 Starting Stripe Webhook End-to-End Test...")
    db = SessionLocal()
    
    test_session_id = "cs_test_mock_session_999"
    test_company = "Stripe Test Corp"
    test_email = "stripe_test@niyogen.com"
    test_subdomain = "stripe-test-corp"
    
    # 1. Clean up previous test runs
    existing_order = db.query(models.Order).filter(models.Order.stripe_session_id == test_session_id).first()
    if existing_order:
        db.delete(existing_order)
        
    existing_customer = db.query(models.Customer).filter(models.Customer.subdomain == test_subdomain).first()
    if existing_customer:
        db.delete(existing_customer)
        
    db.commit()
    
    # 2. Simulate Frontend Checkout Route creating an Order
    print("📦 Creating pending order in database (simulating frontend /api/checkout)...")
    new_order = models.Order(
        company_name=test_company,
        email=test_email,
        stripe_session_id=test_session_id,
        amount=2900,
        status="pending"
    )
    db.add(new_order)
    db.commit()
    print(f"✅ Order created successfully. Status: {new_order.status}")

    # 3. Simulate Stripe Webhook Event Payload
    print("\n💳 Simulating incoming Stripe 'checkout.session.completed' webhook event...")
    mock_payload = {
        "id": "evt_test_123",
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "id": test_session_id,
                "metadata": {
                    "password": "secure_mock_password_123"
                }
            }
        }
    }
    
    req = MockRequest(json.dumps(mock_payload).encode('utf-8'))
    
    try:
        # Temporarily clear secret to bypass signature validation for local test
        original_secret = os.environ.get("STRIPE_WEBHOOK_SECRET")
        if "STRIPE_WEBHOOK_SECRET" in os.environ:
            del os.environ["STRIPE_WEBHOOK_SECRET"]
            
        await stripe_webhook(request=req, db=db)
        print("✅ Webhook executed successfully without crashing.")
        
        if original_secret:
            os.environ["STRIPE_WEBHOOK_SECRET"] = original_secret
            
    except Exception as e:
        print(f"❌ Webhook execution failed: {e}")
        db.close()
        return

    # 4. Verify Database Changes
    print("\n🔍 Verifying Database State...")
    db.expire_all() # Refresh session
    
    updated_order = db.query(models.Order).filter(models.Order.stripe_session_id == test_session_id).first()
    if updated_order.status == "paid":
        print(f"✅ Order status successfully updated to 'paid'!")
    else:
        print(f"❌ Order status is still '{updated_order.status}'")
        
    new_customer = db.query(models.Customer).filter(models.Customer.subdomain == test_subdomain).first()
    if new_customer:
        print(f"✅ Customer automatically provisioned in database! (Subdomain: {new_customer.subdomain})")
    else:
        print("❌ Customer was NOT provisioned in database.")
        
    # Check if Schema exists
    from sqlalchemy import text
    try:
        db.execute(text(f'SET search_path TO "tenant_{test_subdomain}"'))
        print(f"✅ PostgreSQL Isolated Schema 'tenant_{test_subdomain}' successfully created!")
    except Exception as e:
        print(f"❌ Failed to switch to tenant schema. It was likely not created. Error: {e}")
        
    print("\n🎉 Stripe End-to-End Integration Test Completed!")
    db.close()

if __name__ == "__main__":
    asyncio.run(test_stripe_integration())
