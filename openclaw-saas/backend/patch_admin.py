import sys

content = open("app/main.py").read()

new_endpoints = """
@app.get("/api/admin/customers", dependencies=[Depends(require_admin)])
async def list_customers(db: Session = Depends(get_db)):
    customers = db.query(models.Customer).order_by(models.Customer.created_at.desc()).all()
    return {"customers": [
        {
            "id": c.id,
            "customer_name": c.customer_name,
            "subdomain": c.subdomain,
            "plan_type": c.plan_type,
            "is_active": c.is_active,
            "created_at": c.created_at.isoformat() if c.created_at else None
        }
        for c in customers
    ]}

logs_client = boto3.client('logs', region_name='us-east-1')

@app.get("/api/admin/logs", dependencies=[Depends(require_admin)])
async def get_ecs_logs(limit: int = 100):
    try:
        response = logs_client.filter_log_events(
            logGroupName='/ecs/openclaw-backend',
            limit=limit,
            interleaved=True
        )
        events = response.get('events', [])
        return {"logs": [{"timestamp": e['timestamp'], "message": e['message']} for e in events]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
"""

if "@app.get(\"/api/admin/customers\"" not in content:
    idx = content.find("@app.get(\"/api/resolve-tenant\")")
    if idx != -1:
        content = content[:idx] + new_endpoints + "\n" + content[idx:]
        open("app/main.py", "w").write(content)
        print("Patched main.py")
    else:
        print("Anchor not found")
