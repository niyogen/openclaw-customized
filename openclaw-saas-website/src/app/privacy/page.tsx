"use client";

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-white/10 selection:text-white/80">
      <Navbar />

      <div className="pt-32 px-6 pb-20">
        <div className="max-w-3xl mx-auto bg-zinc-950 p-10 rounded-3xl border border-white/10 shadow-xl">
          <h1 className="text-4xl font-bold mb-8 text-white">Privacy Policy</h1>
          <div className="prose prose-slate max-w-none text-zinc-400 space-y-6">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">1. Information We Collect</h2>
              <p>We collect information you provide directly to us, such as when you create an account, subscribe to our service, or request support. This includes your name, email address, company name, and payment information.</p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">2. How We Use Information</h2>
              <p>We use the information we collect to provide, maintain, and improve our services, process transactions, send technical notices, and provide customer support.</p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">3. Data Security</h2>
              <p>We implement appropriate technical and organizational measures to protect your personal data against accidental or unlawful destruction, loss, alteration, or unauthorized disclosure.</p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
