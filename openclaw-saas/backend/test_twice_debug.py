import asyncio
from app.db.database import SessionLocal
from app.main import update_tenant_config, TenantConfig
from sqlalchemy import text

async def main():
    subdomain = "itranga"
    
    print("Attempt 1: Saving key 'sk-first'")
    db1 = SessionLocal()
    try:
        req1 = TenantConfig(openai_api_key="sk-first")
        res1 = await update_tenant_config(subdomain=subdomain, config=req1, db=db1)
        print("Success 1:", res1)
    except Exception as e:
        print("Error 1:", e)
    finally:
        print("db1 search_path before close:", db1.execute(text("SHOW search_path")).scalar())
        db1.close()

    print("Attempt 2: Saving key 'sk-second'")
    db2 = SessionLocal()
    print("db2 search_path before start:", db2.execute(text("SHOW search_path")).scalar())
    try:
        req2 = TenantConfig(openai_api_key="sk-second")
        res2 = await update_tenant_config(subdomain=subdomain, config=req2, db=db2)
        print("Success 2:", res2)
    except Exception as e:
        print("Error 2:", e)
    finally:
        db2.close()

if __name__ == "__main__":
    asyncio.run(main())
