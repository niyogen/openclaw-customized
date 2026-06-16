import os
import glob
import re

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Fix bad replacements
    content = content.replace('selection:bg-white bg-white/10 selection:text-white/80', 'selection:bg-white/10 selection:text-white/80')
    content = content.replace('bg-white bg-white opacity-75', 'bg-white opacity-75')
    content = content.replace('bg-white text-black hover:bg-zinc-200 text-white', 'bg-white text-black hover:bg-zinc-200')
    content = content.replace('bg-white text-black flex items-center justify-center font-bold text-white', 'bg-white text-black flex items-center justify-center font-bold')
    content = content.replace('bg-white text-black text-white', 'bg-white text-black')
    content = content.replace('bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition-colors', 'bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition-colors')
    content = content.replace('text-transparent bg-clip-text bg-gradient-to-r from-[#FF4D4D] to-zinc-500', 'text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500')
    content = content.replace('border border-[#FF4D4D]/20', 'border border-white/20')
    content = content.replace('shadow-[0_0_40px_-10px_rgba(255,77,77,0.6)]', 'shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)]')
    content = content.replace('hover:shadow-[0_0_60px_-15px_rgba(255,77,77,0.8)]', 'hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)]')
    content = content.replace('from-[#FF4D4D]/10', 'from-white/10')
    content = content.replace('from-[#FF4D4D]/5', 'from-white/5')
    content = content.replace('bg-[#FF4D4D]/10', 'bg-white/10')
    content = content.replace('text-[#FF4D4D]', 'text-white')
    content = content.replace('border-[#FF4D4D]', 'border-white')
    content = content.replace('border-[#FF4D4D]/30', 'border-white/30')
    content = content.replace('border-[#FF4D4D]/50', 'border-white/50')
    content = content.replace('ring-[#FF4D4D]', 'ring-white')
    content = content.replace('shadow-[#FF4D4D]', 'shadow-white')
    content = content.replace('shadow-[#FF4D4D]/25', 'shadow-white/10')
    content = content.replace('shadow-[#FF4D4D]/30', 'shadow-white/10')
    content = content.replace('bg-[#FF4D4D]', 'bg-white text-black')
    
    # Fix instances where bg-white text-black was replaced twice
    content = content.replace('bg-white text-black/10 text-white text-sm', 'bg-white/10 text-white text-sm')
    
    with open(filepath, 'w') as f:
        f.write(content)

for file in glob.glob('src/app/**/*.tsx', recursive=True):
    fix_file(file)

