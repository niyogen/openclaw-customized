import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function OpenClawPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-white/10 selection:text-white/80">
      <Head>
        <title>OpenClaw Architecture | Niyogen</title>
        <meta name="description" content="Discover the next-generation OpenClaw architecture designed by Niyogen for maximum automation and scalability." />
      </Head>

      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
        <div className="absolute inset-0 top-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/40 via-black/0 to-black/0 pointer-events-none"></div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white border border-white/20 text-white text-sm font-semibold mb-8 tracking-wide">
            Introducing OpenClaw Architecture
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1] text-white">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">
              Enterprise AI, Simplified.
            </span>
          </h1>
          
          <p className="text-lg md:text-2xl text-zinc-500 mb-12 max-w-3xl mx-auto leading-relaxed">
            We are using <a href="https://openclaw.ai/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">OpenClaw</a> to create a Platform powered by Engines that isolates, protects, and scales your AI operations effortlessly across all messaging platforms.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/pricing"
              className="px-8 py-4 rounded-full bg-white text-black hover:bg-zinc-200 font-bold transition-all  transform hover:-translate-y-1 text-lg"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 px-6 relative bg-zinc-950 border-y border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <div className="w-16 h-16 rounded-3xl bg-white/10 text-white text-white flex items-center justify-center mb-8">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Schema-per-Tenant Isolation</h2>
              <p className="text-lg text-zinc-500 leading-relaxed mb-8">
                Traditional multi-tenant systems mix data in a single massive table. <a href="https://openclaw.ai/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">OpenClaw</a> provisions a completely separate PostgreSQL schema for every single customer. If one schema is compromised, it is impossible to pivot to another. Total data sovereignty.
              </p>
              <ul className="space-y-4 text-zinc-400">
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Dedicated database instances per user
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Zero cross-contamination risk
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Instant provisioning within 5 seconds
                </li>
              </ul>
            </div>
            <div className="bg-black rounded-3xl border border-white/10 shadow-xl relative overflow-hidden group">
              <img 
                src="/images/server_vault.png" 
                alt="Hardware Level Encryption Server Vault" 
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 bg-black p-8 rounded-3xl border border-white/10 shadow-xl relative overflow-hidden group flex items-center justify-center min-h-[300px]">
               <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
               <div className="relative z-10 grid grid-cols-2 gap-4 w-full">
                 <div className="bg-zinc-950 border border-white/10 shadow-sm rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-white/30 transition-colors">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-12 h-12 mb-3" alt="WhatsApp" />
                    <span className="text-white font-medium text-sm">WhatsApp</span>
                 </div>
                 <div className="bg-zinc-950 border border-white/10 shadow-sm rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-white/30 transition-colors">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg" className="w-12 h-12 mb-3" alt="Telegram" />
                    <span className="text-white font-medium text-sm">Telegram</span>
                 </div>
                 <div className="bg-zinc-950 border border-white/10 shadow-sm rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-white/30 transition-colors">
                    <img src="https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png" className="w-12 h-12 mb-3" alt="Discord" />
                    <span className="text-white font-medium text-sm">Discord</span>
                 </div>
                 <div className="bg-zinc-950 border border-white/10 shadow-sm rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-white/30 transition-colors">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg" className="w-12 h-12 mb-3" alt="Slack" />
                    <span className="text-white font-medium text-sm">Slack</span>
                 </div>
               </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="w-16 h-16 rounded-3xl bg-white/10 text-white text-white flex items-center justify-center mb-8">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Omnichannel Workers</h2>
              <p className="text-lg text-zinc-500 leading-relaxed mb-8">
                <a href="https://openclaw.ai/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">OpenClaw</a> uses Baileys Engine for WhatsApp WebSockets and hooks natively into Telegram, Discord, and Slack APIs. This ensures your AI agent has a permanent, un-interruptible presence in your communication channels without needing hacky browser extensions.
              </p>
              <ul className="space-y-4 text-zinc-400">
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Native WebSocket Connections
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Session continuity and auto-reconnection
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Real-time QR Pairing System
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to scale your intelligence?</h2>
          <p className="text-xl text-zinc-500 mb-10">Deploy your first continuous-presence agent today.</p>
          <Link href="/pricing" className="inline-block px-10 py-5 rounded-full bg-white text-black font-bold text-lg hover:bg-zinc-200 transition-colors shadow-lg shadow-white/25">
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
