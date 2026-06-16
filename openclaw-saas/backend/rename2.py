import os

files = [
    "../frontend/src/app/page.tsx",
    "app/main.py"
]

for file_path in files:
    with open(file_path, "r") as f:
        content = f.read()
    
    content = content.replace("OpenClaw", "Surf Claw")
    
    with open(file_path, "w") as f:
        f.write(content)

