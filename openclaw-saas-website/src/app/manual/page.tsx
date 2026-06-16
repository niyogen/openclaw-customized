"use client";

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ManualPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-white/10 selection:text-white/80">
      <Navbar />

      <div className="pt-32 px-6 pb-20">
        <div className="max-w-4xl mx-auto bg-zinc-950 p-10 rounded-3xl border border-white/10 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h1 className="text-4xl font-bold text-white">FastClaw User Manual</h1>
            <a 
              href="/manual.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors text-sm font-medium border border-emerald-500/20 shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </a>
          </div>
          <p className="text-lg text-zinc-400 mb-10 border-b border-white/10 pb-6">
            Welcome to the FastClaw User Manual. This guide will help you understand how to navigate and utilize the FastClaw platform to its fullest potential.
          </p>

          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">1. Getting Started</h2>
              <div className="prose prose-slate prose-invert max-w-none text-zinc-300">
                <p>
                  To begin using FastClaw, you need to create an account. Navigate to the <strong>Sign Up</strong> page from the top navigation bar. Fill in your details and verify your email address. Once verified, you can log in to your dashboard.
                </p>
                <p className="mt-4">
                  After your first login, you will be guided through a quick onboarding process to set up your organization profile and select your preferred initial integrations.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">2. Navigating the Dashboard</h2>
              <div className="prose prose-slate prose-invert max-w-none text-zinc-300">
                <p>
                  The main dashboard is your central hub for monitoring agent activity and system health. It provides:
                </p>
                <div className="my-8 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent pointer-events-none"></div>
                  <img src="/images/manual/dashboard.png" alt="FastClaw Dashboard Overview" className="w-full h-auto" />
                </div>
                <ul className="list-disc pl-5 mt-4 space-y-2 text-zinc-400">
                  <li><strong>Overview:</strong> High-level metrics on tasks completed, active agents, and API usage.</li>
                  <li><strong>Active Agents:</strong> A live view of your currently deployed agents and their status.</li>
                  <li><strong>Recent Activity:</strong> An audit log of recent actions taken by your agents or team members.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">3. Configuring AI Agents</h2>
              <div className="prose prose-slate prose-invert max-w-none text-zinc-300">
                <p>
                  FastClaw allows you to deploy specialized AI agents. To configure a new agent:
                </p>
                <div className="my-8 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent pointer-events-none"></div>
                  <img src="/images/manual/agent_config.png" alt="FastClaw Agent Configuration" className="w-full h-auto" />
                </div>
                <ol className="list-decimal pl-5 mt-4 space-y-2 text-zinc-400">
                  <li>Go to the <strong>Agents</strong> tab in your dashboard.</li>
                  <li>Click <strong>Create New Agent</strong>.</li>
                  <li>Select the foundational model (e.g., OpenAI, Anthropic, Gemini).</li>
                  <li>Define the agent's persona, strict rules, and access permissions.</li>
                  <li>Click <strong>Deploy</strong> to instantly spin up the agent in your secure environment.</li>
                </ol>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">4. Integrations & Channels</h2>
              <div className="prose prose-slate prose-invert max-w-none text-zinc-300">
                <p>
                  Connect your AI agents to the platforms where you already work. FastClaw supports seamless integration with various messaging and productivity tools.
                </p>
                <div className="my-8 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent pointer-events-none"></div>
                  <img src="/images/manual/integrations.png" alt="FastClaw Integrations Page" className="w-full h-auto" />
                </div>
                <ul className="list-disc pl-5 mt-4 space-y-2 text-zinc-400">
                  <li><strong>Communication:</strong> Slack, Microsoft Teams, WhatsApp, Discord.</li>
                  <li><strong>Productivity:</strong> Google Workspace, Notion, Jira.</li>
                  <li><strong>Custom API:</strong> Connect to internal tools using our securely managed webhooks.</li>
                </ul>
                <p className="mt-4">
                  To set up a new integration, navigate to the <strong>Integrations</strong> page, select your desired platform, and follow the OAuth authorization flow. All credentials are encrypted using hardware-level security (AWS KMS).
                </p>
              </div>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">5. Billing & Subscription</h2>
              <div className="prose prose-slate prose-invert max-w-none text-zinc-300">
                <p>
                  Manage your subscription, view past invoices, and monitor your current billing cycle usage in the <strong>Billing</strong> section. FastClaw offers Pro and Max tiers to suit different scales of operation.
                </p>
                <p className="mt-2">
                  If you exceed your monthly credit limit, your agents will automatically pause to prevent unexpected charges unless you have enabled auto-scaling add-ons.
                </p>
              </div>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">6. Support</h2>
              <div className="prose prose-slate prose-invert max-w-none text-zinc-300">
                <p>
                  If you encounter any issues or have questions not covered in this manual, please visit our <Link href="/contact" className="text-emerald-500 hover:text-emerald-400 underline underline-offset-4 transition-colors">Contact Us</Link> page. Our support team is available 24/7 for Max tier subscribers.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
