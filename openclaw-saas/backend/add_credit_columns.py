from sqlalchemy import create_engine, text
import os

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:SuperSecretPassword123@openclaw-saas-db.cmt466aga8u0.us-east-1.rds.amazonaws.com:5432/postgres")
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE customers ADD COLUMN plan_type VARCHAR DEFAULT 'pro';"))
        conn.commit()
        print("plan_type added")
    except Exception as e:
        print("plan_type error:", e)
        
    try:
        conn.execute(text("ALTER TABLE customers ADD COLUMN monthly_credits_limit INTEGER DEFAULT 30000;"))
        conn.commit()
        print("monthly_credits_limit added")
    except Exception as e:
        print("monthly_credits_limit error:", e)

    try:
        conn.execute(text("ALTER TABLE customers ADD COLUMN credits_used INTEGER DEFAULT 0;"))
        conn.commit()
        print("credits_used added")
    except Exception as e:
        print("credits_used error:", e)
