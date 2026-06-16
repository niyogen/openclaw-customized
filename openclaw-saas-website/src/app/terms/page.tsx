"use client";

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-white/10 selection:text-white/80">
      <Navbar />

      <div className="pt-32 px-6 pb-20">
        <div className="max-w-3xl mx-auto bg-zinc-950 p-10 rounded-3xl border border-white/10 shadow-xl">
          <h1 className="text-4xl font-bold mb-8 text-white">Terms & Conditions</h1>
          <div className="prose prose-slate max-w-none text-zinc-400 space-y-6">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
              <p>By accessing and using FastClaw by Niyogen, you accept and agree to be bound by the terms and provision of this agreement.</p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">2. Description of Service</h2>
              <p>FastClaw provides a suite of cloud management tools, billed on a subscription basis. You are responsible for maintaining the confidentiality of your account and password.</p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">3. Billing and Cancellation</h2>
              <p>You agree to pay all fees associated with your subscription. You may cancel your subscription at any time, but no refunds will be provided for partial months of service.</p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
