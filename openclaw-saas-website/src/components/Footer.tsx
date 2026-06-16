import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-12 px-6 bg-zinc-950 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-white text-black flex items-center justify-center font-bold text-xs">
            O
          </div>
          <span className="text-lg font-bold text-white">
            FastClaw
          </span>
        </div>
        <p className="text-zinc-500 text-sm">
          © {new Date().getFullYear()} <a href="https://www.niyogen.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors underline underline-offset-2">Niyogen</a>. All rights reserved.
        </p>
        <div className="flex gap-4">
          <Link href="/privacy" className="text-zinc-500 hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="text-zinc-500 hover:text-white transition-colors">Terms & Conditions</Link>
          <Link href="/manual" className="text-zinc-500 hover:text-white transition-colors">Manual</Link>
        </div>
      </div>
    </footer>
  );
}
