import asyncio
from app.db.database import SessionLocal, engine
from app.db import models
from app.main import deploy_fastclaw, InstallRequest, update_tenant_config, TenantConfig
from sqlalchemy.orm import Session
import os

async def main():
    print("Testing User Creation Flow...")
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # 1. Create User
    subdomain = "testuser" + os.urandom(2).hex()
    print(f"Provisioning tenant schema: tenant_{subdomain}...")
    req = InstallRequest(
        customer_name="Test Company",
        subdomain=subdomain,
        admin_email=f"test@{subdomain}.com",
        admin_password="mockpassword"
    )
    
    try:
        res = await deploy_fastclaw(req, db)
        print("Deploy result:", res)
    except Exception as e:
        print("Deploy failed:", e)
        return

    # 2. Update Configuration (Set Gemini Key for WhatsApp)
    print("Updating configuration for Gemini and WhatsApp...")
    config_req = TenantConfig(
        whatsapp_model="gemini",
        gemini_token="AIzaSyTestMockGeminiKey12345"
    )
    
    try:
        config_res = await update_tenant_config(subdomain=subdomain, config=config_req, db=db)
        print("Config update result:", config_res)
    except Exception as e:
        print("Config update failed:", e)
        return

    # 3. Verify in Tenant DB
    print(f"Verifying in tenant_{subdomain} schema...")
    from sqlalchemy import text
    try:
        db.execute(text(f'SET search_path TO "tenant_{subdomain}"'))
        from app.db.tenant_models import Integration
        integrations = db.query(Integration).all()
        for i in integrations:
            print(f"Found Integration: name={i.name}, api_key={i.api_key}")
    except Exception as e:
        print("Verification failed:", e)
    finally:
        db.execute(text('SET search_path TO public'))
        db.close()
    
    print("Test Complete!")

if __name__ == "__main__":
    asyncio.run(main())
