import os
os.environ["DATABASE_URL"] = "postgresql://postgres:SuperSecretPassword123@openclaw-saas-db.cmt466aga8u0.us-east-1.rds.amazonaws.com:5432/postgres"

from app.db.database import SessionLocal
from app.db.models import CustomerConfig, Customer

db = SessionLocal()
config = db.query(CustomerConfig).join(Customer).filter(Customer.subdomain == 'singer').first()
print("Before:", config.discord_token)

val = ""
if isinstance(val, str) and val.endswith("***"):
    print("Skipped")
else:
    setattr(config, "discord_token", val)
    db.commit()
    print("Updated")

db.refresh(config)
print("After:", config.discord_token)
