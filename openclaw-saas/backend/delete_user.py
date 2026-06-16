"""
Delete all data for a specific email from the live OpenClaw database.
Usage:
  DATABASE_URL="postgresql://..." python delete_user.py itranga@gmail.com
  DATABASE_URL="postgresql://..." python delete_user.py itranga@gmail.com --confirm
"""
import sys
import os
from sqlalchemy import create_engine, text

EMAIL = sys.argv[1] if len(sys.argv) > 1 else None
CONFIRM = "--confirm" in sys.argv

if not EMAIL:
    print("Usage: python delete_user.py <email> [--confirm]")
    sys.exit(1)

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL env var not set.")
    sys.exit(1)

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    # ── Find customer by subdomain derived from email OR by order email ──
    email_lower = EMAIL.lower().strip()

    # 1. Orders
    orders = conn.execute(text("SELECT id, company_name, email, status FROM orders WHERE email = :e"), {"e": email_lower}).fetchall()

    # 2. Coupons
    coupons = conn.execute(text("SELECT id, user_email, days, expires_at, is_active FROM coupons WHERE user_email = :e"), {"e": email_lower}).fetchall()

    # 3. Customer — subdomain is often derived from the part before @
    subdomain_guess = email_lower.split("@")[0]
    customers = conn.execute(text("SELECT id, customer_name, subdomain, is_active FROM customers WHERE subdomain = :s"), {"s": subdomain_guess}).fetchall()
    customer_ids = [r[0] for r in customers]

    # 4. Customer configs
    configs = []
    if customer_ids:
        configs = conn.execute(text("SELECT id, customer_id FROM customer_configs WHERE customer_id = ANY(:ids)"), {"ids": customer_ids}).fetchall()

    # ── Print summary ──
    print(f"\n{'='*60}")
    print(f"  Records found for: {email_lower}")
    print(f"{'='*60}")
    print(f"  Orders        : {len(orders)}")
    for o in orders:
        print(f"    └─ id={o[0]} company={o[1]} status={o[3]}")
    print(f"  Coupons       : {len(coupons)}")
    for c in coupons:
        print(f"    └─ id={c[0]} days={c[2]} active={c[4]} expires={c[3]}")
    print(f"  Customers     : {len(customers)}")
    for cu in customers:
        print(f"    └─ id={cu[0]} name={cu[1]} subdomain={cu[2]} active={cu[3]}")
    print(f"  CustomerConfigs: {len(configs)}")
    for cfg in configs:
        print(f"    └─ id={cfg[0]} customer_id={cfg[1]}")
    print(f"{'='*60}")

    total = len(orders) + len(coupons) + len(customers) + len(configs)
    if total == 0:
        print("\n  No records found. Nothing to delete.")
        sys.exit(0)

    if not CONFIRM:
        print("\n  ⚠️  DRY RUN — no changes made.")
        print("  Re-run with --confirm to actually delete:\n")
        print(f"    DATABASE_URL=\"...\" python delete_user.py {EMAIL} --confirm\n")
        sys.exit(0)

    # ── Execute deletes ──
    print("\n  🗑️  Deleting...")

    if configs:
        conn.execute(text("DELETE FROM customer_configs WHERE customer_id = ANY(:ids)"), {"ids": customer_ids})
        print(f"    ✓ Deleted {len(configs)} customer_config(s)")

    if customers:
        conn.execute(text("DELETE FROM customers WHERE id = ANY(:ids)"), {"ids": customer_ids})
        print(f"    ✓ Deleted {len(customers)} customer(s)")

    if orders:
        conn.execute(text("DELETE FROM orders WHERE email = :e"), {"e": email_lower})
        print(f"    ✓ Deleted {len(orders)} order(s)")

    if coupons:
        conn.execute(text("DELETE FROM coupons WHERE user_email = :e"), {"e": email_lower})
        print(f"    ✓ Deleted {len(coupons)} coupon(s)")

    conn.commit()
    print(f"\n  ✅ Done! All data for {email_lower} deleted from live DB.\n")
