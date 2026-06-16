"use client";

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-white/10 selection:text-white/80">
      <Navbar />

      <div className="pt-32 px-6 pb-20">
        <div className="max-w-3xl mx-auto bg-zinc-950 p-10 rounded-3xl border border-white/10 shadow-xl">
          <h1 className="text-4xl font-bold mb-6 text-white">About Us</h1>
          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-zinc-300 leading-relaxed mb-6">
              At FastClaw by Niyogen, our mission is to empower businesses with the most advanced, intuitive, and highly scalable cloud management and automation tools on the market.
            </p>
            <p className="text-zinc-400 leading-relaxed mb-6">
              Founded with a vision to simplify complex technological operations, FastClaw provides a unified dashboard where you can oversee everything your company needs—without the hassle. We believe that technology should be a multiplier for your business, not a bottleneck.
            </p>
            <h2 className="text-2xl font-bold mt-12 mb-4 text-white">Our Vision</h2>
            <p className="text-zinc-400 leading-relaxed">
              To create a seamless ecosystem where businesses of all sizes can operate smoothly, automate their mundane tasks, and focus exclusively on what really matters: growth and innovation.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
