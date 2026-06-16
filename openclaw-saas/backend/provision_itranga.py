#!/usr/bin/env python3
"""Provision itranga customer directly in RDS + create tenant schema."""
import os
os.environ["DATABASE_URL"] = "postgresql://postgres:SuperSecretPassword123@openclaw-saas-db.cmt466aga8u0.us-east-1.rds.amazonaws.com:5432/postgres"

import sys
sys.path.insert(0, "/home/ranga/code/pragith/cs/openclaw-saas/backend")

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.environ["DATABASE_URL"]
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

SUBDOMAIN = "itranga"
CUSTOMER_NAME = "itranga"
EMAIL = "itranga@gmail.com"

try:
    # 1. Check existing
    existing = db.execute(text("SELECT id FROM customers WHERE subdomain = :s"), {"s": SUBDOMAIN}).fetchone()
    if existing:
        print(f"✅ Customer '{SUBDOMAIN}' already exists with id={existing[0]}")
    else:
        # 2. Insert customer
        result = db.execute(text("""
            INSERT INTO customers (customer_name, subdomain, aws_task_arn, is_active, plan_type, monthly_credits_limit, credits_used)
            VALUES (:name, :sub, 'shared-instance', true, 'pro', 30000, 0)
            RETURNING id
        """), {"name": CUSTOMER_NAME, "sub": SUBDOMAIN})
        customer_id = result.fetchone()[0]
        db.commit()
        print(f"✅ Customer created — id={customer_id}, subdomain={SUBDOMAIN}")

        # 3. Insert customer config
        db.execute(text("""
            INSERT INTO customer_configs (customer_id)
            VALUES (:cid)
        """), {"cid": customer_id})
        db.commit()
        print(f"✅ CustomerConfig created")

        # 4. Create tenant schema
        db.execute(text(f'CREATE SCHEMA IF NOT EXISTS "tenant_{SUBDOMAIN}"'))
        db.commit()
        print(f"✅ Schema tenant_{SUBDOMAIN} created")

    # 5. Store SSM credentials
    import boto3
    ssm = boto3.client("ssm", region_name="us-east-1")
    
    for name, value in [
        (f"/fastclaw/customers/{SUBDOMAIN}/ADMIN_EMAIL", EMAIL),
        (f"/fastclaw/customers/{SUBDOMAIN}/ADMIN_PASSWORD", "OpenClaw@2025!"),
    ]:
        try:
            ssm.put_parameter(Name=name, Value=value, Type="SecureString", Overwrite=True)
            print(f"✅ SSM param set: {name}")
        except Exception as e:
            print(f"⚠️  SSM error (non-fatal): {e}")

    print("\n🎉 Done! itranga is now provisioned.")
    print(f"   Login: {EMAIL}")
    print(f"   Subdomain: {SUBDOMAIN}")
    print(f"   Backend: https://openclaw.niyogen.com/api/tenant/{SUBDOMAIN}/config")

except Exception as e:
    db.rollback()
    print(f"❌ Error: {e}")
    raise
finally:
    db.close()
