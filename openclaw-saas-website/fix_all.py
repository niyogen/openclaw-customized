import os
import glob
import re

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Fix the double class issue 'bg-white text-black text-white' -> 'bg-white text-black'
    content = content.replace('bg-white text-black text-white', 'bg-white text-black')
    content = content.replace('text-black flex', 'text-black flex') # Just in case

    # Fix the bg/text of the root wrapper if needed
    # Ensure min-h-screen bg-black text-white
    content = content.replace('bg-zinc-950 text-white', 'bg-black text-zinc-100')
    content = content.replace('bg-black text-white', 'bg-black text-zinc-100')

    # Fix specific color issues caused by my naive regex
    content = content.replace('selection:text-white', 'selection:text-white/80')
    content = content.replace('bg-white text-black/10', 'bg-white/10 text-white')
    content = content.replace('text-black opacity-75', 'bg-white opacity-75')
    content = content.replace('text-black/30', 'bg-white/10')
    content = content.replace('from-white/10 via-black/0 to-black/0', 'from-zinc-800/40 via-black/0 to-black/0')
    content = content.replace('border-white/10 text-white', 'border-white/10 text-zinc-300')
    
    # Remove the embedded <nav>...</nav> and replace with <Navbar />
    nav_pattern = re.compile(r'<nav className="fixed w-full z-50 top-0.*?</nav>', re.DOTALL)
    
    if nav_pattern.search(content):
        content = nav_pattern.sub('<Navbar />', content)
        # Add import if missing
        if 'import Navbar from' not in content:
            # Add it after the last import
            imports_end = [m.end() for m in re.finditer(r'^import .*?;$', content, re.MULTILINE)]
            if imports_end:
                idx = imports_end[-1]
                content = content[:idx] + "\nimport Navbar from '@/components/Navbar';" + content[idx:]
            else:
                content = "import Navbar from '@/components/Navbar';\n" + content
    
    # Let's fix the Dashboard too since it has a different nav
    if 'dashboard' in filepath.lower():
        content = content.replace('bg-black text-zinc-100 flex flex-col font-sans relative', 'bg-black text-zinc-100 flex flex-col font-sans relative selection:bg-white/10')
        content = content.replace('bg-zinc-950 border-b border-white/10', 'bg-black border-b border-white/10')
        content = content.replace('bg-white/10/80', 'bg-black')

    with open(filepath, 'w') as f:
        f.write(content)

tsx_files = glob.glob('src/app/**/*.tsx', recursive=True)
for file in tsx_files:
    if 'layout.tsx' in file: continue # Skip layout
    fix_file(file)
    print(f"Fixed {file}")

