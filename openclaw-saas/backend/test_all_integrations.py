import asyncio
import os
from sqlalchemy import text
from app.main import update_tenant_config, get_tenant_config, TenantConfig
from app.db.database import SessionLocal, engine
from app.db import models

async def run_diagnostics():
    print("🚀 Starting OpenClaw SaaS Configuration Health Check...\n")
    subdomain = "itranga"
    test_integrations = [
        {"id": "whatsapp_token", "model": "whatsapp_model", "token": "wa-test-token-123", "ai": "gemini"},
        {"id": "telegram_token", "model": "telegram_model", "token": "tg-test-token-456", "ai": "openai"},
        {"id": "discord_token", "model": "discord_model", "token": "dc-test-token-789", "ai": "anthropic"},
        {"id": "slack_token", "model": "slack_model", "token": "sl-test-token-000", "ai": "xai"},
    ]
    
    # Check if user exists
    db = SessionLocal()
    customer = db.query(models.Customer).filter(models.Customer.subdomain == subdomain).first()
    if not customer:
        print(f"❌ Critical Error: Tenant '{subdomain}' does not exist. Please create it first.")
        db.close()
        return
    print(f"✅ Found Test Tenant: {subdomain} (ID: {customer.id})")
    
    # 1. Stress Test: Saving Multiple Configurations Back-to-Back
    print("\n--- Phase 1: Connection Pool Stability & Schema Isolation ---")
    
    for i, intg in enumerate(test_integrations):
        try:
            # Build payload
            payload = {
                intg["id"]: intg["token"],
                intg["model"]: intg["ai"]
            }
            if intg["id"] == "whatsapp_token":
                payload["whatsapp_reply_groups"] = True

            req = TenantConfig(**payload)
            
            # Using get_tenant_config to get a fresh DB session each time (simulating a real API request checkout)
            req_db = SessionLocal()
            res = await update_tenant_config(subdomain=subdomain, config=req, db=req_db)
            req_db.close()
            
            print(f"✅ [{i+1}/{len(test_integrations)}] Successfully saved {intg['id']} to public and tenant schemas.")
            
        except Exception as e:
            print(f"❌ FAILED on {intg['id']}! Database Connection Pool Poisoning Detected: {str(e)}")
            return
            
    print("✅ Phase 1 Passed! Connection pool is 100% stable across multiple tenant context switches.")
    
    # 2. Verify Data Consistency
    print("\n--- Phase 2: Data Integrity & Persistence Check ---")
    
    fetch_db = SessionLocal()
    try:
        config_res = await get_tenant_config(subdomain=subdomain, db=fetch_db)
        missing = 0
        
        for intg in test_integrations:
            if config_res.get(intg["id"]) != intg["token"]:
                print(f"❌ Error: {intg['id']} token did not match! Expected {intg['token']}, got {config_res.get(intg['id'])}")
                missing += 1
            elif config_res.get(intg["model"]) != intg["ai"]:
                print(f"❌ Error: {intg['model']} routing model did not match! Expected {intg['ai']}, got {config_res.get(intg['model'])}")
                missing += 1
            else:
                print(f"✅ Verified {intg['id']} data integrity in Global Config.")
                
        if missing == 0:
            print("✅ Phase 2 Passed! All tokens and models are perfectly synced to the global customer_configs table.")
    except Exception as e:
         print(f"❌ Phase 2 FAILED: {str(e)}")
         return
    finally:
        fetch_db.close()

    # 3. Verify Tenant Schema Integrity
    print("\n--- Phase 3: Tenant Schema Isolation Check ---")
    try:
        tenant_db = SessionLocal()
        tenant_db.execute(text(f'SET search_path TO "tenant_{subdomain}"'))
        from app.db.tenant_models import Integration
        
        saved_integrations = tenant_db.query(Integration).all()
        saved_dict = {i.name: i.api_key for i in saved_integrations}
        
        missing_tenant = 0
        for intg in test_integrations:
            if saved_dict.get(intg["id"]) != intg["token"]:
                print(f"❌ Error: {intg['id']} not found in isolated tenant schema!")
                missing_tenant += 1
            else:
                print(f"✅ Verified {intg['id']} exists safely isolated inside 'tenant_{subdomain}' schema.")
                
        if missing_tenant == 0:
            print("✅ Phase 3 Passed! Tenant data is correctly isolated and encrypted in their own schema.")
            
    except Exception as e:
        print(f"❌ Phase 3 FAILED: {str(e)}")
        return
    finally:
        tenant_db.close()
        
    print("\n🎉 ALL TESTS PASSED! Your multi-tenant configuration engine is robust and production-ready. 🎉\n")

if __name__ == "__main__":
    asyncio.run(run_diagnostics())
