"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

function SuccessContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Creating your FastClaw account...');
  
  useEffect(() => {
    // In a real application, if you use Stripe Webhooks, the account creation
    // would be handled entirely on your server.
    // However, we are simulating the process visually here for the user.

    const timer1 = setTimeout(() => {
      setStatus('Provisioning your workspace...');
    }, 1500);

    const timer2 = setTimeout(() => {
      setStatus('Account successfully created!');
      
      // Redirect to the dashboard
      setTimeout(() => {
        // Set a quick cookie so the user is logged in
        document.cookie = "fastclaw_portal_auth=true; path=/";
        document.cookie = "fastclaw_payment_done=true; path=/";
        window.location.href = "/dashboard";
      }, 1500);
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="bg-zinc-950 border border-white/10 rounded-2xl p-10 shadow-xl max-w-md w-full text-center mt-32">
      {status === 'Account successfully created!' ? (
        <div className="animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
          <p className="text-emerald-600 font-medium mb-6">{status}</p>
          <p className="text-zinc-500 text-sm">Redirecting you to the portal...</p>
        </div>
      ) : (
        <div className="animate-in fade-in duration-300">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-white border-t-transparent animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Processing...</h2>
          <p className="text-white font-medium">{status}</p>
          <p className="text-zinc-500 text-sm mt-6">Please do not close this window.</p>
        </div>
      )}
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-white/10 selection:text-white/80 flex flex-col items-center">
      <Navbar />

      <Suspense fallback={<div className="text-zinc-500 mt-32">Loading...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
