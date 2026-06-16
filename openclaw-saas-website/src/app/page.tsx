"use client";

import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Home() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('yearly');

  const plans = [
    {
      name: 'Pro',
      price: { monthly: 29, quarterly: 26, yearly: 18 },
      description: 'For power users and small teams.',
      credits: '30,000 / mo',
      engines: 'OpenClaw',
      hardware: 'Shared Auto-Scaling Cluster',
      security: 'Secure Multi-Tenant Isolation',
      channels: '13+ messaging apps',
      extras: 'Web Terminal',
      buttonText: 'Choose Pro',
      buttonStyle: 'outline',
      popular: false,
    },
    {
      name: 'Max',
      price: { monthly: 99, quarterly: 89, yearly: 79 },
      description: 'Maximum performance and limits.',
      credits: '120,000 / mo',
      engines: 'OpenClaw',
      hardware: 'Shared Auto-Scaling Cluster',
      security: 'Secure Multi-Tenant Isolation',
      channels: '13+ messaging apps',
      extras: 'Web Terminal, Custom Ports',
      buttonText: 'Choose Max',
      buttonStyle: 'solid',
      popular: true,
    }
  ];

  const handlePayment = () => {
    window.location.href = "/pricing";
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-white/10 selection:text-white/80">
      {/* Navigation */}
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 px-6 overflow-hidden">
          <div className="absolute inset-0 top-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/40 via-black/0 to-black/0 pointer-events-none"></div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-white text-sm font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white text-black"></span>
              </span>
              FastClaw SaaS is now live
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1] text-white">
              Elevate your workflow with <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">
                Next-Gen Automation
              </span>
            </h1>

            <p className="text-lg md:text-xl text-zinc-500 mb-12 max-w-2xl mx-auto leading-relaxed">
              FastClaw provides continuous-presence AI agents designed to scale your operations instantly. Fast, secure, and native.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 rounded-full bg-white text-black hover:bg-zinc-200 font-semibold transition-all shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)] transform hover:-translate-y-1"
              >
                Start for $18/mo
              </button>
            </div>

            <div className="relative mt-12 max-w-5xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent blur-3xl -z-10 rounded-full"></div>
              <img
                src="/images/hero_dashboard.png"
                alt="FastClaw SaaS Dashboard Interface"
                className="w-full h-auto rounded-xl border border-white/10 shadow-2xl"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-6 relative bg-zinc-950 border-y border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Auto-Evolving AI Agents</h2>
              <p className="text-zinc-500 text-lg max-w-2xl mx-auto">Deploy intelligent, continuous-presence agents across your entire ecosystem.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-black p-8 rounded-3xl border border-white/10 hover:border-white/50 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-white/10 text-white text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Multi-Model Routing</h3>
                <p className="text-zinc-500 leading-relaxed">Dynamically route tasks to OpenAI, Anthropic, Gemini, or Grok based on complexity and cost-efficiency.</p>
              </div>


              {/* Feature 2 */}
              <div className="bg-black p-8 rounded-3xl border border-white/10 hover:border-emerald-500/50 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Hardware-Level Encryption</h3>
                <p className="text-zinc-500 leading-relaxed">All API keys and integrations are securely stored using AWS KMS encrypted vaults. Your data never leaks.</p>
              </div>

              {/* Feature 3 */}
              <div className="bg-black p-8 rounded-3xl border border-white/10 hover:border-sky-500/50 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Continuous Presence</h3>
                <p className="text-zinc-500 leading-relaxed">Agents live where you work. Native integrations for WhatsApp, Slack, Telegram, and Discord.</p>
              </div>
            </div>
          </div>
        </section>

        {/* User Journey Section */}
        <section className="py-24 px-6 relative bg-black overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-20">
              <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2 block">How it works</span>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Your journey to automation</h2>
              <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Get up and running with enterprise-grade AI agents in minutes, not months.</p>
            </div>

            <div className="relative">
              {/* Connecting line for desktop */}
              <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                {/* Step 1 */}
                <div className="relative flex flex-col items-center text-center group">
                  <div className="w-24 h-24 rounded-full bg-black border-2 border-white/20 flex items-center justify-center mb-6 relative z-10 group-hover:border-white/60 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]">
                    <span className="text-3xl font-extrabold text-white/50 group-hover:text-white transition-colors">1</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Choose a Plan</h3>
                  <p className="text-zinc-500 leading-relaxed text-sm">Select the tier that fits your needs. Start small or go big instantly.</p>
                </div>

                {/* Step 2 */}
                <div className="relative flex flex-col items-center text-center group">
                  <div className="w-24 h-24 rounded-full bg-black border-2 border-white/20 flex items-center justify-center mb-6 relative z-10 group-hover:border-emerald-500/60 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                    <span className="text-3xl font-extrabold text-emerald-500/50 group-hover:text-emerald-500 transition-colors">2</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Instant Provisioning</h3>
                  <p className="text-zinc-500 leading-relaxed text-sm">We automatically deploy your dedicated, isolated PostgreSQL schema in seconds.</p>
                </div>

                {/* Step 3 */}
                <div className="relative flex flex-col items-center text-center group">
                  <div className="w-24 h-24 rounded-full bg-black border-2 border-white/20 flex items-center justify-center mb-6 relative z-10 group-hover:border-sky-500/60 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_30px_rgba(14,165,233,0.15)]">
                    <span className="text-3xl font-extrabold text-sky-500/50 group-hover:text-sky-500 transition-colors">3</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Connect Apps</h3>
                  <p className="text-zinc-500 leading-relaxed text-sm">Securely link your OpenAI keys, WhatsApp, Telegram, or Slack via our dashboard.</p>
                </div>

                {/* Step 4 */}
                <div className="relative flex flex-col items-center text-center group">
                  <div className="w-24 h-24 rounded-full bg-black border-2 border-white/20 flex items-center justify-center mb-6 relative z-10 group-hover:border-indigo-500/60 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]">
                    <span className="text-3xl font-extrabold text-indigo-500/50 group-hover:text-indigo-500 transition-colors">4</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Go Live 24/7</h3>
                  <p className="text-zinc-500 leading-relaxed text-sm">Your AI agents wake up and start handling operations continuously without downtime.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">
                Simple, transparent pricing
              </h2>
              <p className="text-lg text-zinc-500 max-w-2xl mx-auto mb-10">
                Choose the plan that fits your needs. Scale as you grow.
              </p>

              <div className="inline-flex bg-white/5 p-1 rounded-full border border-white/10">
                <button
                  className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-black text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                  onClick={() => setBillingCycle('monthly')}
                >
                  Monthly
                </button>
                <button
                  className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${billingCycle === 'quarterly' ? 'bg-black text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                  onClick={() => setBillingCycle('quarterly')}
                >
                  Quarterly (-10%)
                </button>
                <button
                  className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-black text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                  onClick={() => setBillingCycle('yearly')}
                >
                  Yearly <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">-20%</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative bg-zinc-950 rounded-3xl p-8 transition-transform duration-300 hover:-translate-y-1 ${plan.popular ? 'border-2 border-white shadow-2xl shadow-white/10' : 'border border-white/10 shadow-sm'}`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-8 -translate-y-1/2">
                      <span className="bg-white text-black text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-zinc-500 text-sm mb-6 h-10">{plan.description}</p>

                  <div className="mb-8 flex items-baseline gap-1">
                    <span className="text-5xl font-extrabold text-white">${plan.price[billingCycle]}</span>
                    <span className="text-zinc-500 font-medium">/ mo</span>
                  </div>

                  <button
                    className={`w-full py-3.5 rounded-xl font-bold transition-all mb-8 flex justify-center items-center gap-2 ${plan.buttonStyle === 'solid' ? 'bg-white text-black hover:bg-zinc-200 ' : 'bg-transparent border border-white/20 text-zinc-300 hover:border-slate-400 hover:bg-black'}`}
                    onClick={handlePayment}
                  >
                    {plan.buttonText}
                  </button>

                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-white">Credits</p>
                        <p className="text-sm text-zinc-500">{plan.credits}</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-white">Engines</p>
                        <p className="text-sm text-zinc-500">{plan.engines}</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-white">Hardware</p>
                        <p className="text-sm text-zinc-500">{plan.hardware}</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-white">Security</p>
                        <p className="text-sm text-zinc-500">{plan.security}</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-white">Channels</p>
                        <p className="text-sm text-zinc-500">{plan.channels}</p>
                      </div>
                    </li>
                    {plan.extras !== '-' && (
                      <li className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-white">Extras</p>
                          <p className="text-sm text-zinc-500">{plan.extras}</p>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

