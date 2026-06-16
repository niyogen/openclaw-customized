from app.db.database import SessionLocal, engine
from sqlalchemy import text

def test_pool():
    db = SessionLocal()
    conn1 = db.connection().connection.cursor()
    print("Session started, got connection")
    
    db.execute(text("SET search_path TO 'tenant_itranga'"))
    print("Search path set to tenant_itranga")
    
    db.commit()
    print("Transaction committed, connection should be released to pool")
    
    # Now if we ask for a connection, do we get the SAME connection?
    db2 = SessionLocal()
    print("New session created")
    # Execute something to trigger connection checkout
    path = db2.execute(text("SHOW search_path")).scalar()
    print("New session search path:", path)
    db2.close()

if __name__ == "__main__":
    test_pool()
