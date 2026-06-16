import asyncio
from app.db.database import SessionLocal, engine
from sqlalchemy import text

def test():
    db = SessionLocal()
    print("Initial:", db.execute(text("SHOW search_path")).scalar())
    
    db.execute(text("SET search_path TO 'tenant_itranga'"))
    db.commit()
    print("After set:", db.execute(text("SHOW search_path")).scalar())
    
    db.execute(text("SET search_path TO public"))
    db.commit()
    print("After reset:", db.execute(text("SHOW search_path")).scalar())
    
    db.close()

if __name__ == "__main__":
    test()
