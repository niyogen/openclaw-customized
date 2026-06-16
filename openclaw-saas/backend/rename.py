import os

replacements = [
    ("OpenClaw Workspace", "Surf Claw Workspace"),
    ("OpenClaw Portal", "Surf Claw Portal"),
    ("OpenClaw Command Center", "Surf Claw Command Center"),
    ("OpenClaw SaaS API", "Surf Claw SaaS API"),
    ("OpenClaw Orchestrator API", "Surf Claw Orchestrator API"),
    ("admin@openclaw.com", "admin@surfclaw.com"),
    ("Connecting to OpenClaw WhatsApp service", "Connecting to Surf Claw WhatsApp service"),
    ("OpenClaw master terminal", "Surf Claw master terminal"),
    ("To use OpenClaw on WhatsApp:", "To use Surf Claw on WhatsApp:"),
    (">OpenClaw<", ">Surf Claw<"),
    ("> OpenClaw<", "> Surf Claw<"),
    ("OpenClaw is provisioning", "Surf Claw is provisioning"),
    ("OpenClaw on WhatsApp", "Surf Claw on WhatsApp"),
    ("master OpenClaw terminal", "master Surf Claw terminal")
]

files = [
    "../frontend/src/app/page.tsx",
    "../frontend/src/app/admin/page.tsx",
    "../frontend/src/app/webadmin/page.tsx",
    "../frontend/src/app/api/login/route.ts",
    "app/main.py"
]

for file_path in files:
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            content = f.read()
            
        for old, new in replacements:
            content = content.replace(old, new)
            
        with open(file_path, "w") as f:
            f.write(content)
        print(f"Updated {file_path}")
    else:
        print(f"Skipped {file_path} (not found)")

