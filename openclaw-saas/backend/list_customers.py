import os
os.environ["DATABASE_URL"] = "postgresql://postgres:SuperSecretPassword123@openclaw-saas-db.cmt466aga8u0.us-east-1.rds.amazonaws.com:5432/postgres"

from app.db.database import SessionLocal
from app.db import models

db = SessionLocal()
customers = db.query(models.Customer).all()
for c in customers:
    print(c.id, c.customer_name, c.subdomain)
