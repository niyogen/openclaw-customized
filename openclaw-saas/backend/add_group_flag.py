import asyncio
from app.db.database import engine
from sqlalchemy import text

def add_column():
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE customer_configs ADD COLUMN whatsapp_reply_groups BOOLEAN DEFAULT FALSE;"))
            conn.commit()
            print("Successfully added whatsapp_reply_groups column!")
    except Exception as e:
        print("Error adding column:", e)

if __name__ == "__main__":
    add_column()
