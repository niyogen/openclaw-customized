import os
os.environ["DATABASE_URL"] = "postgresql://postgres:SuperSecretPassword123@openclaw-saas-db.cmt466aga8u0.us-east-1.rds.amazonaws.com:5432/postgres"

from app.db.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE customer_configs ADD COLUMN github_model VARCHAR;"))
        conn.execute(text("ALTER TABLE customer_configs ADD COLUMN notion_model VARCHAR;"))
        conn.execute(text("ALTER TABLE customer_configs ADD COLUMN trello_model VARCHAR;"))
        conn.execute(text("ALTER TABLE customer_configs ADD COLUMN homeassistant_model VARCHAR;"))
        conn.execute(text("ALTER TABLE customer_configs ADD COLUMN hue_model VARCHAR;"))
        conn.execute(text("ALTER TABLE customer_configs ADD COLUMN webhook_model VARCHAR;"))
        conn.commit()
        print("Successfully added additional AI model routing columns.")
    except Exception as e:
        print("Migration failed or columns already exist:", e)
