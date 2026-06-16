import sys

content = open("app/main.py").read()

new_cron_task = """
async def _run_scheduled_task(subdomain: str, schedule_id: str, task: str):
    \"\"\"Execute a scheduled task by calling the tenant chat endpoint.\"\"\"
    from sqlalchemy.orm import sessionmaker
    from .db.database import engine
    SessionLocal2 = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal2()
    try:
        backend_url = os.getenv("BACKEND_URL", "http://localhost:8000")
        async with _httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{backend_url}/api/tenant/{subdomain}/chat",
                json={"message": task, "session_id": f"scheduler-{schedule_id}"}
            )
            if resp.status_code == 200:
                data = resp.json()
                msg = data.get("response")
                if msg:
                    # Look up allowed numbers
                    import os
                    cfg = db.query(models.CustomerConfig).join(models.Customer).filter(models.Customer.subdomain == subdomain).first()
                    if cfg and cfg.allowed_numbers:
                        numbers = [n.strip().replace('+', '') for n in cfg.allowed_numbers.split(',')]
                        # find worker port
                        port_file = os.path.join(os.path.dirname(__file__), "whatsapp", "sessions", f"wa_{subdomain}_port.txt")
                        if os.path.exists(port_file):
                            port = open(port_file).read().strip()
                            for num in numbers:
                                try:
                                    await client.post(f"http://127.0.0.1:{port}/send", json={"to": num, "message": msg})
                                except:
                                    pass

        now = datetime.now(timezone.utc).isoformat()
        row = db.query(models.TenantSchedule).filter(models.TenantSchedule.id == schedule_id).first()
        if row:
            row.last_run = now
            db.commit()
        _log_activity(subdomain, "tool", f"Scheduled task ran: {task[:60]}", "system")
    except Exception as e:
        _log_activity(subdomain, "error", f"Scheduler error [{schedule_id}]: {str(e)}", "system")
    finally:
        db.close()
"""

# Replace the old `_run_scheduled_task` function.
import re
pattern = re.compile(r'async def _run_scheduled_task.*?finally:\n        db\.close\(\)\n', re.DOTALL)
if pattern.search(content):
    content = pattern.sub(new_cron_task, content)
    open("app/main.py", "w").write(content)
    print("Patched main.py")
else:
    print("Could not find _run_scheduled_task")
