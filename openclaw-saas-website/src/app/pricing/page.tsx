"use client";

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('yearly');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    // Safely parse URL parameters on the client to avoid Next.js Suspense boundary requirements
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'payment_required_for_current_month') {
      setErrorMessage("Please select a plan and complete your monthly subscription payment to access your dashboard.");
    } else if (params.get('error') === 'payment_cancelled') {
      setErrorMessage("Payment was cancelled. You must complete checkout to access the system.");
    }
    const emailParam = params.get('email');
    if (emailParam) {
      setUserEmail(emailParam);
    }
  }, []);

  const handlePlanSelection = async (planName: string) => {
    if (!userEmail) {
      // If not logged in, force them to Google login first
      window.location.href = '/api/auth/google';
      return;
    }

    setIsProcessing(planName);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: userEmail,
          companyName: userEmail.split('@')[0], // Use email prefix as default company name
          password: `GAuth_${Math.random().toString(36).slice(2, 12)}!`,
          plan: planName.toLowerCase(), 
          cycle: billingCycle 
        }),
      });
      
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setErrorMessage("Failed to initiate checkout. Please try again.");
        setIsProcessing(null);
      }
    } catch (e) {
      setErrorMessage("Network error. Please try again.");
      setIsProcessing(null);
    }
  };

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

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-white/10 selection:text-white/80">
      <Navbar />

      {errorMessage && (
        <div className="bg-amber-50 border-b border-amber-200 animate-in slide-in-from-top-2 duration-500">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3 text-amber-800">
              <svg className="w-6 h-6 shrink-0 mt-0.5 sm:mt-0 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="text-sm font-bold">Action Required: Active Subscription Needed</h3>
                <p className="text-sm text-amber-700 mt-0.5">{errorMessage}</p>
              </div>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-amber-600 hover:text-amber-800 transition-colors p-1 rounded-md hover:bg-amber-100">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <main className="py-24 px-6 relative max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">
            Simple, transparent pricing
          </h1>
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
                disabled={isProcessing !== null}
                className={`w-full py-3.5 rounded-xl font-bold transition-all mb-8 flex justify-center items-center gap-2 ${plan.buttonStyle === 'solid' ? 'bg-white text-black hover:bg-zinc-200  disabled:opacity-70' : 'bg-transparent border border-white/20 text-zinc-300 hover:border-slate-400 hover:bg-black disabled:opacity-70'}`}
                onClick={() => handlePlanSelection(plan.name)}
              >
                {isProcessing === plan.name ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  plan.buttonText
                )}
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

        <div className="mt-24 bg-zinc-950 rounded-3xl p-10 md:p-16 text-center border border-white/10">
          <h2 className="text-3xl font-bold text-white mb-4">Enterprise Custom Solution</h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-8">
            Need custom SSO, Audit logs, and 99.9% SLA? We've got you covered with dedicated deployments.
          </p>
          <a 
            href="/contact"
            className="inline-block px-8 py-4 bg-black text-zinc-100 rounded-xl font-bold hover:bg-white/5 transition-colors"
          >
            Contact Sales
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}
