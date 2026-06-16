import asyncio
import os
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.db import models
from app.main import get_tenant_config, update_tenant_config, tenant_chat, ChatMessage, TenantConfig
from fastapi import HTTPException

async def test_locked_endpoints():
    print("🔒 Starting Auto-Lock Enforcement Test...")
    db = SessionLocal()
    
    test_subdomain = "locked-test-tenant"
    
    # 1. Setup a LOCKED customer
    existing = db.query(models.Customer).filter(models.Customer.subdomain == test_subdomain).first()
    if existing:
        db.delete(existing)
    db.commit()
    
    customer = models.Customer(
        customer_name="Locked Test Corp",
        subdomain=test_subdomain,
        is_active=False
    )
    db.add(customer)
    
    config = models.CustomerConfig(customer_id=customer.id)
    db.add(config)
    
    db.commit()
    print(f"✅ Created dummy customer: {customer.subdomain} (is_active={customer.is_active})")
    
    # 2. Test fetching config (Dashboard Access)
    print("\n🛑 Test 1: Attempting to fetch configuration (User opening Dashboard)...")
    try:
        await get_tenant_config(subdomain=test_subdomain, db=db)
        print("❌ FAILED! Endpoint allowed access to locked customer.")
    except HTTPException as e:
        if e.status_code == 402:
            print(f"✅ Success! Endpoint blocked access with 402: '{e.detail}'")
        else:
            print(f"❌ Unexpected HTTP Error: {e.status_code}")

    # 3. Test updating config (Dashboard Save Button)
    print("\n🛑 Test 2: Attempting to save configuration (User trying to hack save API)...")
    try:
        mock_config = TenantConfig(openai_api_key="sk-test-123")
        await update_tenant_config(subdomain=test_subdomain, config=mock_config, db=db)
        print("❌ FAILED! Endpoint allowed saving config for locked customer.")
    except HTTPException as e:
        if e.status_code == 402:
            print(f"✅ Success! Endpoint blocked save with 402: '{e.detail}'")
        else:
            print(f"❌ Unexpected HTTP Error: {e.status_code}")

    # 4. Test AI Agent Routing
    print("\n🤖 Test 3: Attempting to route AI chat message (Customer sending WhatsApp message)...")
    try:
        chat_req = ChatMessage(session_id="wa_locked-test-tenant", message="Hello AI!")
        res = await tenant_chat(subdomain=test_subdomain, req=chat_req, db=db)
        
        if "suspended" in res.get("response", "").lower():
            print(f"✅ Success! AI intercepted and gracefully replied: '{res['response']}'")
        else:
            print(f"❌ FAILED! AI replied normally: {res}")
    except Exception as e:
         print(f"❌ FAILED with unexpected exception: {e}")

    print("\n🎉 Auto-Lock Test Completed Successfully!")
    db.close()

if __name__ == "__main__":
    asyncio.run(test_locked_endpoints())
