import asyncio
from app.db.database import SessionLocal
from app.main import update_tenant_config, TenantConfig

async def main():
    subdomain = "testuser5f03"
    db = SessionLocal()
    config_req = TenantConfig(
        whatsapp_model="gemini",
        gemini_token="AIzaSyTestMockGeminiKey12345"
    )
    try:
        res = await update_tenant_config(subdomain=subdomain, config=config_req, db=db)
        print("Success:", res)
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
