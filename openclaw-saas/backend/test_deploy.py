from app.db.database import SessionLocal, engine
from app.db import models
from app.main import InstallRequest, deploy_fastclaw
import asyncio

async def main():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    req = InstallRequest(customer_name="TestUser", subdomain="testuser", admin_email="test@fastclaw.com", admin_password="mock")
    try:
        res = await deploy_fastclaw(req, db)
        print("Provisioned:", res)
    except Exception as e:
        print("Error deploying:", e)
    finally:
        db.close()

asyncio.run(main())
