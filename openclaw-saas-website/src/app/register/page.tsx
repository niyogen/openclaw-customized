"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function RegisterPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate registration processing
    setTimeout(() => {
      document.cookie = `fastclaw_customer_email=${encodeURIComponent(email)}; path=/`;
      // Redirect to customer dashboard
      window.location.href = "/dashboard";
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-white/10 selection:text-white/80 flex flex-col items-center">
      <Navbar />

      <div className="w-full max-w-md mt-32 px-6 pb-20">
        <div className="text-center mb-10">
          <div className="w-12 h-12 mx-auto rounded-lg bg-white text-black flex items-center justify-center font-bold  mb-6 text-xl">
            O
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create an Account</h1>
          <p className="text-zinc-500">Join FastClaw and start automating today.</p>
        </div>

        <div className="bg-zinc-950 border border-white/10 rounded-2xl p-8 shadow-xl">
          <button
            type="button"
            onClick={() => { window.location.href = '/api/auth/google?origin=signup'; }}
            className="w-full rounded-lg border border-white/10 bg-zinc-950 px-4 py-3 text-sm font-semibold text-zinc-300 shadow-sm transition-all hover:bg-black hover:border-white/20 mb-6"
          >
            <div className="flex items-center justify-center gap-3">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign up with Google
            </div>
          </button>

          <div className="flex items-center mb-6">
            <div className="flex-1 border-t border-white/10"></div>
            <span className="px-4 text-xs text-zinc-500 font-medium uppercase tracking-wider">Or register with email</span>
            <div className="flex-1 border-t border-white/10"></div>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Full Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-950 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white transition-all shadow-sm"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white transition-all shadow-sm"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Password</label>
              <input 
                type="password" 
                required
                className="w-full bg-zinc-950 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white transition-all shadow-sm"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 rounded-lg font-bold transition-all flex items-center justify-center gap-2 bg-white text-black hover:bg-zinc-200  disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </>
              ) : (
                'Create Account'
              )}
            </button>
            
            <div className="text-center mt-4">
              <span className="text-zinc-500 text-sm">Already have an account? </span>
              <Link href="/login" className="text-white hover:text-[#E64545] text-sm font-medium transition-colors">
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
