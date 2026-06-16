import asyncio
from app.db.database import engine
from sqlalchemy import text

def update_schema():
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE customers ADD COLUMN is_active BOOLEAN DEFAULT TRUE;"))
            conn.execute(text("ALTER TABLE customers ADD COLUMN stripe_customer_id VARCHAR;"))
            conn.commit()
            print("Successfully added is_active and stripe_customer_id columns!")
    except Exception as e:
        print("Error updating schema:", e)

if __name__ == "__main__":
    update_schema()
