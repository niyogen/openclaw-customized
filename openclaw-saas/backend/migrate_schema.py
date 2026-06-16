import os
os.environ["DATABASE_URL"] = "postgresql://postgres:SuperSecretPassword123@openclaw-saas-db.cmt466aga8u0.us-east-1.rds.amazonaws.com:5432/postgres"

from app.db.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE customer_configs ADD COLUMN whatsapp_model VARCHAR;"))
        conn.execute(text("ALTER TABLE customer_configs ADD COLUMN telegram_model VARCHAR;"))
        conn.execute(text("ALTER TABLE customer_configs ADD COLUMN discord_model VARCHAR;"))
        conn.execute(text("ALTER TABLE customer_configs ADD COLUMN slack_model VARCHAR;"))
        conn.execute(text("ALTER TABLE customer_configs ADD COLUMN gmail_model VARCHAR;"))
        conn.commit()
        print("Successfully added AI model routing columns.")
    except Exception as e:
        print("Migration failed or columns already exist:", e)
