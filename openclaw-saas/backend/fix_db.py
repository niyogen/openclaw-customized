import asyncio
import os
from sqlalchemy import create_engine, text

async def main():
    db_url = os.environ.get("DATABASE_URL", "postgresql://postgres:SuperSecretPassword123@openclaw-saas-db.cmt466aga8u0.us-east-1.rds.amazonaws.com:5432/postgres")
    engine = create_engine(db_url)
    
    with engine.connect() as conn:
        print("Adding hermes_token column...")
        try:
            conn.execute(text("ALTER TABLE customer_configs ADD COLUMN hermes_token VARCHAR;"))
            conn.commit()
            print("Successfully added hermes_token.")
        except Exception as e:
            print(f"Error (might already exist): {e}")

if __name__ == "__main__":
    asyncio.run(main())
