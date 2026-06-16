import os
os.environ["DATABASE_URL"] = "postgresql://postgres:SuperSecretPassword123@openclaw-saas-db.cmt466aga8u0.us-east-1.rds.amazonaws.com:5432/postgres"

from app.db.database import SessionLocal, engine
from sqlalchemy import text

with engine.connect() as conn:
    # Get all customers first
    res = conn.execute(text("SELECT subdomain FROM customers"))
    subdomains = [row[0] for row in res]
    
    # Drop all tenant schemas
    for sub in subdomains:
        print(f"Dropping schema {sub}")
        try:
            conn.execute(text(f'DROP SCHEMA IF EXISTS "{sub}" CASCADE;'))
        except Exception as e:
            print(f"Failed to drop schema {sub}: {e}")
            
    # Delete all customers
    try:
        conn.execute(text("DELETE FROM orders;"))
        conn.execute(text("DELETE FROM customer_configs;"))
    except:
        pass
    
    conn.execute(text("DELETE FROM customers;"))
    conn.commit()

print("Wiped all customers, orders, configs and schemas.")
