from sqlalchemy import create_engine

DATABASE_URL = "postgresql://postgres:SuperSecretPassword123@openclaw-saas-db.cmt466aga8u0.us-east-1.rds.amazonaws.com:5432/postgres"
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    try:
        conn.execute("ALTER TABLE customers ADD COLUMN name_servers VARCHAR;")
        print("Column added successfully.")
    except Exception as e:
        print(e)
