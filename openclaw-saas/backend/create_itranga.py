from app.db.database import SessionLocal
from app.main import InstallRequest, deploy_fastclaw
import asyncio

async def main():
    db = SessionLocal()
    req = InstallRequest(customer_name="Itranga", subdomain="itranga", admin_email="itranga@gmail.com", admin_password="mock")
    try:
        res = await deploy_fastclaw(req, db)
        print("Provisioned:", res)
    except Exception as e:
        print("Error:", e)
    db.close()

asyncio.run(main())
