"use client";

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function OnboardingContent() {
  const searchParams = useSearchParams();
  const initialStep = searchParams?.get('step') === 'apps' ? 2 : 1;
  const [step, setStep] = useState(initialStep);

  const [agentType, setAgentType] = useState('fastclaw');
  const [agentName, setAgentName] = useState('Clawdi');
  const [personality, setPersonality] = useState('friendly');

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-white font-sans py-12 px-4 selection:bg-white/10 selection:text-white/80">
      <div className="max-w-2xl mx-auto">
        
        {/* Step Indicator */}
        <div className="flex justify-center gap-2 mb-8">
          <div className={`h-1.5 w-8 rounded-full ${step >= 1 ? 'bg-white text-black' : 'bg-slate-200'}`}></div>
          <div className={`h-1.5 w-8 rounded-full ${step >= 2 ? 'bg-white text-black' : 'bg-slate-200'}`}></div>
          <div className={`h-1.5 w-8 rounded-full ${step >= 3 ? 'bg-white text-black' : 'bg-slate-200'}`}></div>
        </div>

        {step === 1 && (
          <div className="bg-zinc-950 p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white">Let's make your AI feel like yours</h1>
            </div>

            <div className="space-y-8">
              {/* Agent Type */}
              <div>
                <label className="block text-sm font-bold text-white mb-3">Agent Type</label>
                <div className="grid grid-cols-1 gap-4">
                  <div 
                    onClick={() => setAgentType('fastclaw')}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${agentType === 'fastclaw' ? 'border-white bg-red-50/30' : 'border-white/10 hover:border-white/20 bg-zinc-950'}`}
                  >
                    <div className="w-12 h-12 bg-white text-black rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-white/20">
                      <span className="text-white font-bold text-xl">O</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">FastClaw</h3>
                      <p className="text-xs text-zinc-500">AI agent with browser automation</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Name your assistant */}
              <div>
                <label className="block text-sm font-bold text-white mb-3">Name your assistant</label>
                <input 
                  type="text" 
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white transition-all text-sm"
                  placeholder="e.g. Clawdi"
                />
                <p className="text-xs text-zinc-400 mt-2">You can always change this later</p>
              </div>

              {/* Choose a personality */}
              <div>
                <label className="block text-sm font-bold text-white mb-3">Choose a personality</label>
                <div className="space-y-3">
                  {[
                    { id: 'friendly', icon: '😊', title: 'Friendly', desc: 'Warm, casual, and approachable' },
                    { id: 'professional', icon: '💼', title: 'Professional', desc: 'Polished, concise, and business-ready' },
                    { id: 'creative', icon: '🎨', title: 'Creative', desc: 'Playful, imaginative, and expressive' },
                    { id: 'concise', icon: '⚡', title: 'Concise', desc: 'Short, direct, no fluff' },
                  ].map(p => (
                    <div 
                      key={p.id}
                      onClick={() => setPersonality(p.id)}
                      className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${personality === p.id ? 'border-white bg-red-50/30' : 'border-white/10 hover:border-white/20 bg-zinc-950'}`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{p.icon}</span>
                        <div>
                          <h3 className="font-bold text-sm text-white">{p.title}</h3>
                          <p className="text-xs text-zinc-500">{p.desc}</p>
                        </div>
                      </div>
                      {personality === p.id && (
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Language and Timezone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-white mb-1">Preferred language</label>
                  <p className="text-xs text-zinc-400 mb-3">The language your assistant will speak</p>
                  <select className="w-full px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white text-sm appearance-none bg-zinc-950">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-white mb-1">Timezone</label>
                  <p className="text-xs text-zinc-400 mb-3 opacity-0">Spacer</p>
                  <select className="w-full px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white text-sm appearance-none bg-zinc-950">
                    <option>Asia/Colombo</option>
                    <option>America/New_York</option>
                    <option>Europe/London</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={() => setStep(2)}
                className="w-full py-3.5 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold shadow-md shadow-white/20 transition-all flex justify-center items-center gap-2"
              >
                Continue
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-zinc-950 p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">Connect your apps</h1>
              <p className="text-sm text-zinc-500">Give your AI superpowers by connecting your favorite apps</p>
            </div>

            <div className="space-y-4 mb-8">
              {[
                { name: 'Google Super', desc: 'Google Super App combines all Google services including Drive, Calendar, Gmail, Sheets, Analytics, Ads, and more...', icon: 'G' },
                { name: 'GitHub', desc: 'GitHub is a code hosting platform for version control and collaboration, offering Git-based repository management...', icon: 'GH' },
                { name: 'Notion', desc: 'Notion centralizes notes, docs, wikis, and tasks in a unified workspace, letting teams build custom workflows...', icon: 'N' },
              ].map(app => (
                <div key={app.name} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-white/10 bg-zinc-950">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 font-bold text-zinc-400 border border-white/10">
                      {app.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-sm text-white">{app.name}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-white/5 text-zinc-500 rounded-full">Recommended</span>
                      </div>
                      <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2 md:line-clamp-none">{app.desc}</p>
                    </div>
                  </div>
                  <button className="shrink-0 px-4 py-2 bg-white text-black hover:bg-zinc-200 text-sm font-bold rounded-lg flex items-center gap-2 transition-colors self-start md:self-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Connect
                  </button>
                </div>
              ))}
            </div>

            <p className="text-xs text-center text-zinc-400 mb-8 max-w-md mx-auto">
              You can connect and configure these anytime from the Connectors tab. OAuth sign-in happens after setup.
            </p>

            <div className="flex gap-4">
              <button 
                onClick={() => setStep(1)}
                className="px-6 py-3 border border-white/10 hover:bg-black text-zinc-300 rounded-xl font-bold transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
              <button 
                onClick={() => window.location.href = '/dashboard'}
                className="flex-1 py-3 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold shadow-md shadow-white/20 transition-all flex justify-center items-center gap-2"
              >
                Continue
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>}>
      <OnboardingContent />
    </Suspense>
  );
}
