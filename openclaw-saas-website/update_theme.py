import os
import glob

def update_theme(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # If it's a light theme file currently:
    content = content.replace('bg-slate-50', 'bg-black')
    content = content.replace('bg-white', 'bg-zinc-950')
    content = content.replace('text-slate-900', 'text-white')
    content = content.replace('text-slate-800', 'text-zinc-200')
    content = content.replace('text-slate-700', 'text-zinc-300')
    content = content.replace('text-slate-600', 'text-zinc-400')
    content = content.replace('text-slate-500', 'text-zinc-500')
    content = content.replace('border-slate-200', 'border-white/10')
    content = content.replace('border-slate-300', 'border-white/20')
    content = content.replace('bg-slate-100', 'bg-white/5')
    content = content.replace('bg-[#FF4D4D]', 'bg-white text-black')
    content = content.replace('hover:bg-[#E64545]', 'hover:bg-zinc-200')
    content = content.replace('text-[#FF4D4D]', 'text-white')
    content = content.replace('shadow-md shadow-[#FF4D4D]/25', '')
    content = content.replace('shadow-lg shadow-[#FF4D4D]/30', '')
    content = content.replace('from-rose-100/40 via-slate-50/0 to-slate-50/0', 'from-white/10 via-black/0 to-black/0')
    content = content.replace('from-rose-100', 'from-white/20')
    content = content.replace('to-rose-400', 'to-zinc-500')
    content = content.replace('bg-white/80', 'bg-black/80')
    content = content.replace('selection:bg-[#FF4D4D]/30', 'selection:bg-white/30')
    content = content.replace('selection:text-[#FF4D4D]', 'selection:text-white')

    # If it's a dark theme file (like dashboard):
    content = content.replace('bg-slate-950', 'bg-black')
    content = content.replace('bg-slate-900', 'bg-zinc-950')
    content = content.replace('border-slate-800', 'border-white/10')
    content = content.replace('border-slate-700', 'border-white/20')
    content = content.replace('text-slate-100', 'text-white')
    content = content.replace('text-slate-200', 'text-zinc-200')
    content = content.replace('text-slate-300', 'text-zinc-300')
    content = content.replace('text-slate-400', 'text-zinc-400')
    content = content.replace('bg-indigo-600', 'bg-white text-black')
    content = content.replace('hover:bg-indigo-500', 'hover:bg-zinc-200')
    content = content.replace('text-indigo-400', 'text-white')
    content = content.replace('border-indigo-500/50', 'border-white/30')
    content = content.replace('from-indigo-500 to-purple-500', 'bg-white')
    content = content.replace('shadow-[0_0_15px_rgba(99,102,241,0.5)]', 'shadow-[0_0_15px_rgba(255,255,255,0.2)]')
    content = content.replace('bg-indigo-500/20', 'bg-white/10')
    content = content.replace('text-indigo-500', 'text-white')
    content = content.replace('border-indigo-500/30', 'border-white/20')
    content = content.replace('shadow-[0_0_10px_rgba(99,102,241,0.2)]', '')
    content = content.replace('bg-gradient-to-r from-indigo-500 to-purple-500', 'bg-white')
    content = content.replace('border-indigo-500', 'border-white')
    content = content.replace('shadow-indigo-500/20', '')
    content = content.replace('shadow-indigo-500/25', '')

    with open(filepath, 'w') as f:
        f.write(content)

tsx_files = glob.glob('src/app/**/*.tsx', recursive=True)
for file in tsx_files:
    update_theme(file)
    print(f"Updated {file}")

