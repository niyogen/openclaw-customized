"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path ? 'text-white' : 'text-zinc-400 hover:text-white';
  };

  return (
    <nav className="fixed w-full z-50 top-0 transition-all duration-300 backdrop-blur-md bg-black/80 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded bg-white flex items-center justify-center font-bold text-black shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all">
            O
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            FastClaw
          </span>
        </Link>
        <div className="hidden md:flex gap-8 text-sm font-medium">
          <Link href="/" className={`${isActive('/')} transition-colors`}>Home</Link>
          <Link href="/openClaw" className={`${isActive('/openClaw')} transition-colors`}>OpenClaw</Link>
          <Link href="/pricing" className={`${isActive('/pricing')} transition-colors`}>Pricing</Link>
          <Link href="/about" className={`${isActive('/about')} transition-colors`}>About Us</Link>
          <Link href="/manual" className={`${isActive('/manual')} transition-colors`}>Manual</Link>
          <Link href="/contact" className={`${isActive('/contact')} transition-colors`}>Contact Us</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-5 py-2 rounded-full bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition-colors shadow-sm"
          >
            Sign up
          </Link>
        </div>
      </div>
    </nav>
  );
}
