import os
import re

def replace_in_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    new_content = content.replace('FastClaw', 'OpenClaw')
    
    # Optional: replace fastclaw.niyogen.com with claw.niyogen.com
    new_content = new_content.replace('fastclaw.niyogen.com', 'claw.niyogen.com')
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.tsx', '.ts', '.css')):
            replace_in_file(os.path.join(root, file))

print("Done")
