from app.db.database import SessionLocal
from app.db.models import Order

db = SessionLocal()
order = db.query(Order).filter(Order.id == 7).first()
if order:
    print(f"Order ID: {order.id}, Company: {order.company_name}, Email: {order.email}, Status: {order.status}, Amount: {order.amount}")
else:
    print("Order not found.")
