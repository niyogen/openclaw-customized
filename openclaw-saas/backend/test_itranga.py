from app.db.database import SessionLocal
from sqlalchemy import text
db = SessionLocal()
try:
    db.execute(text('SET search_path TO "tenant_itranga"'))
    from app.db.tenant_models import Integration
    res = db.query(Integration).all()
    print("Found integrations:", res)
except Exception as e:
    print("Error:", e)
finally:
    db.close()
