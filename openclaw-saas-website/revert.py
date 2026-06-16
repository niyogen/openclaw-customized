import os

def replace_in_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    new_content = content.replace('OpenClaw', 'FastClaw')
    new_content = new_content.replace('openclaw', 'fastclaw')
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Reverted {filepath}")

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.tsx', '.ts', '.css')):
            replace_in_file(os.path.join(root, file))

print("Revert Done")
