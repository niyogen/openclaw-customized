"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ChatTab from './ChatTab';
import DocumentsTab from './DocumentsTab';
import { ActivityTab, SessionsTab, LiveLogsTab } from './ActivitySessionsLogs';
import OpenClawTab from './OpenClawTab';

const categories = ['All', 'Models', 'Communication', 'Productivity', 'Smart Home', 'System'];

const integrations = [
  {
    id: 'openai_api_key',
    name: 'OpenAI',
    category: 'Models',
    description: 'GPT-4, GPT-5, o1 models for advanced intelligence.',
    icon: (
      <div className="w-8 h-8 rounded bg-zinc-950 flex items-center justify-center">
        <svg className="w-6 h-6 text-black" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.073zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.5967 8.3829 14.6168 7.2144a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6762 8.1042v-5.6772a.79.79 0 0 0-.3927-.6813zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
        </svg>
      </div>
    ),
    fields: [{ label: 'OpenAI API Key', type: 'password', placeholder: 'sk-...' }]
  },
  {
    id: 'anthropic_token',
    name: 'Anthropic',
    category: 'Models',
    description: 'Claude Pro/Max + Opus models.',
    icon: (
      <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
    ),
    fields: [{ label: 'Anthropic Token', type: 'password', placeholder: 'sk-ant-...' }]
  },
  {
    id: 'gemini_token',
    name: 'Google Gemini',
    category: 'Models',
    description: 'Gemini 2.5 Pro/Flash.',
    icon: (
      <svg className="w-8 h-8 text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C12 2 12 11 21 12C12 13 12 22 12 22C12 22 12 13 3 12C12 11 12 2 12 2Z" /></svg>
    ),
    fields: [{ label: 'Gemini API Key', type: 'password', placeholder: 'AIzaSy...' }]
  },
  {
    id: 'xai_token',
    name: 'xAI Grok',
    category: 'Models',
    description: 'Grok 3 & 4 reasoning models.',
    icon: (
      <svg className="w-8 h-8 text-zinc-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>
    ),
    fields: [{ label: 'xAI Token', type: 'password', placeholder: 'xoxb-...' }]
  },

  {
    id: 'whatsapp_token',
    name: 'WhatsApp',
    category: 'Communication',
    description: 'QR pairing via Baileys for business messaging.',
    icon: (
      <svg className="w-8 h-8 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.418-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 3.825.001 6.938 3.113 6.938 6.938-.001 3.825-3.113 6.937-6.938 6.937z" /></svg>
    ),
    fields: [{ label: 'Session Token', type: 'password', placeholder: 'Enter active session token or Scan QR' }]
  },
  {
    id: 'telegram_token',
    name: 'Telegram',
    category: 'Communication',
    description: 'Bot API via grammY.',
    icon: (
      <svg className="w-8 h-8 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
    ),
    fields: [{ label: 'Bot Token', type: 'password', placeholder: '123456:ABC-DEF...' }]
  },
  {
    id: 'discord_token',
    name: 'Discord',
    category: 'Communication',
    description: 'Servers, channels & DMs.',
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
    ),
    fields: [{ label: 'Bot Token', type: 'password', placeholder: 'MTE...' }]
  },
  {
    id: 'slack_token',
    name: 'Slack',
    category: 'Communication',
    description: 'Workspace apps via Bolt.',
    icon: (
      <svg className="w-8 h-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
    ),
    fields: [{ label: 'Bot User OAuth Token', type: 'password', placeholder: 'xoxb-...' }]
  },
  {
    id: 'gmail_token',
    name: 'Gmail',
    category: 'Productivity',
    description: 'Send & read emails via Google API.',
    icon: (
      <svg className="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="currentColor"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" /></svg>
    ),
    fields: [{ label: 'App Password / Token', type: 'password', placeholder: 'Enter token' }]
  },
  {
    id: 'github_token',
    name: 'GitHub',
    category: 'Productivity',
    description: 'Code, issues, PRs.',
    icon: (
      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
    ),
    fields: [{ label: 'Personal Access Token', type: 'password', placeholder: 'ghp_...' }]
  },
  {
    id: 'notion_token',
    name: 'Notion',
    category: 'Productivity',
    description: 'Workspace & databases.',
    icon: (
      <svg className="w-8 h-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
    ),
    fields: [{ label: 'Integration Token', type: 'password', placeholder: 'secret_...' }]
  },
  {
    id: 'trello_token',
    name: 'Trello',
    category: 'Productivity',
    description: 'Kanban boards & cards.',
    icon: (
      <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19.6 3H4.4C3.6 3 3 3.6 3 4.4v15.2C3 20.4 3.6 21 4.4 21h15.2c.8 0 1.4-.6 1.4-1.4V4.4C21 3.6 20.4 3 19.6 3zM10.5 14c0 .3-.2.5-.5.5H5.5c-.3 0-.5-.2-.5-.5V5.5c0-.3.2-.5.5-.5h4.5c.3 0 .5.2.5.5V14zm8 3c0 .3-.2.5-.5.5h-4.5c-.3 0-.5-.2-.5-.5V5.5c0-.3.2-.5.5-.5h4.5c.3 0 .5.2.5.5V17z" /></svg>
    ),
    fields: [{ label: 'API Key & Token', type: 'password', placeholder: 'ATTA...' }]
  },
  {
    id: 'homeassistant_token',
    name: 'Home Assistant',
    category: 'Smart Home',
    description: 'Home automation hub.',
    icon: (
      <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
    ),
    fields: [{ label: 'Long-Lived Access Token', type: 'password', placeholder: 'eyJhbG...' }]
  },
  {
    id: 'hue_token',
    name: 'Philips Hue',
    category: 'Smart Home',
    description: 'Smart lighting.',
    icon: (
      <svg className="w-8 h-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
    ),
    fields: [{ label: 'Application Key', type: 'password', placeholder: 'Token...' }]
  },
  {
    id: 'webhook_url',
    name: 'Webhooks',
    category: 'System',
    description: 'External HTTP triggers.',
    icon: (
      <svg className="w-8 h-8 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
    ),
    fields: [{ label: 'Webhook URL', type: 'text', placeholder: 'https://...' }]
  }
];

export default function DashboardPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
  const [configured, setConfigured] = useState<Record<string, boolean>>({});
  const [tenantConfig, setTenantConfig] = useState<any>({});
  const [routingModel, setRoutingModel] = useState<string>("");
  const [whatsappReplyGroups, setWhatsappReplyGroups] = useState<boolean>(false);
  const [allowedNumbers, setAllowedNumbers] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>("Loading...");
  const [tenantSubdomain, setTenantSubdomain] = useState<string>("");

  const [activeTab, setActiveTab] = useState('dashboard');
  const [hasPaid, setHasPaid] = useState(false);
  const [hasCoupon, setHasCoupon] = useState(false);
  const [couponDaysRemaining, setCouponDaysRemaining] = useState<number | null>(null);
  const [couponHoursRemaining, setCouponHoursRemaining] = useState<number | null>(null);
  const [couponExpiresAt, setCouponExpiresAt] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('yearly');

  // ── Agent Builder State ──
  const [agents, setAgents] = useState<{id:string,name:string,persona:string,enabled:boolean,channel:string,model:string,messagesHandled:number}[]>([]);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentPersona, setNewAgentPersona] = useState('');
  const [newAgentChannel, setNewAgentChannel] = useState('WhatsApp');
  const [newAgentModel, setNewAgentModel] = useState('OpenAI (GPT-4)');

  // ── Skills State ──
  const [installedSkills, setInstalledSkills] = useState<string[]>([]);
  const [skillConfigModal, setSkillConfigModal] = useState<string | null>(null);
  const [skillCredentials, setSkillCredentials] = useState<Record<string, Record<string, string>>>({});
  const [skillCredInput, setSkillCredInput] = useState<Record<string, string>>({});
  const [skillSaving, setSkillSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  // Which skills need credentials and what fields they need
  const skillCredFields: Record<string, { label: string; key: string; type: string; placeholder: string; help?: string }[]> = {
    'gmail-payment-forwarder': [
      { label: 'Gmail Address', key: 'email', type: 'email', placeholder: 'you@gmail.com', help: 'Gmail account to monitor for payment notifications.' },
      { label: 'App Password', key: 'app_password', type: 'password', placeholder: '16-character Google App Password', help: 'Google App Password for IMAP access (2-Step Verification required).' },
      { label: 'WhatsApp Group JID', key: 'whatsapp_group_jid', type: 'text', placeholder: 'e.g. 120363234234@g.us', help: 'The WhatsApp group JID to forward notifications to. Get this JID from the WhatsApp live logs when a group message is received.' },
      { label: 'Gmail Search Query', key: 'search_query', type: 'text', placeholder: 'subject:(payment OR payments OR transfer OR transfers OR receive OR received OR paying)', help: 'Optional search query using Gmail search filters. Defaults to subject:(payment OR payments OR transfer OR transfers OR receive OR received OR paying).' },
    ],
    'gmail-reader': [
      { label: 'Gmail Address', key: 'email', type: 'email', placeholder: 'you@gmail.com', help: 'The Gmail account the agent will read and send from.' },
      { label: 'App Password', key: 'app_password', type: 'password', placeholder: '16-character Google App Password', help: 'Go to myaccount.google.com → Security → 2-Step Verification → App Passwords to generate one.' },
    ],
    'github-copilot': [
      { label: 'GitHub Personal Access Token', key: 'token', type: 'password', placeholder: 'ghp_xxxxxxxxxxxxxxxxxxxx', help: 'Go to github.com/settings/tokens → Generate new token (classic) with repo + workflow scopes.' },
      { label: 'Default Repository (optional)', key: 'repo', type: 'text', placeholder: 'username/repo-name' },
    ],
    'notion-db': [
      { label: 'Notion Integration Token', key: 'token', type: 'password', placeholder: 'secret_xxxxxxxxxxxxxxxxxxxx', help: 'Go to notion.so/my-integrations → New Integration to get your token.' },
    ],
    'home-controller': [
      { label: 'Home Assistant URL', key: 'url', type: 'text', placeholder: 'http://homeassistant.local:8123', help: 'The local or remote URL of your Home Assistant instance.' },
      { label: 'Long-Lived Access Token', key: 'token', type: 'password', placeholder: 'eyJ0eXAiOiJKV1Q...', help: 'In Home Assistant → Profile → Long-Lived Access Tokens → Create Token.' },
    ],
    'voice-tts': [
      { label: 'ElevenLabs API Key', key: 'api_key', type: 'password', placeholder: 'el_xxxxxxxxxxxxxxxxxxxxxxx', help: 'Go to elevenlabs.io → Profile → API Key.' },
    ],
    'calendar-sync': [
      { label: 'Google Calendar Email', key: 'email', type: 'email', placeholder: 'you@gmail.com', help: 'The Google account whose calendar the agent will manage.' },
      { label: 'Google App Password', key: 'app_password', type: 'password', placeholder: '16-character Google App Password' },
    ],
  };

  const skillsMarketplace = [
    { id: 'browser-automation', name: 'Browser Automation', desc: 'Browse the web, fill forms, scrape data from any site.', icon: '🌐', category: 'System', verified: true },
    { id: 'gmail-reader', name: 'Gmail Manager', desc: 'Read inbox, send emails, unsubscribe from lists.', icon: '📧', category: 'Productivity', verified: true },
    { id: 'gmail-payment-forwarder', name: 'Gmail Payment to WhatsApp Forwarder', desc: 'Monitor Gmail for payment/transfer emails, parse them using AI, and automatically post notifications to a WhatsApp group.', icon: '💸', category: 'Automation', verified: true },
    { id: 'github-copilot', name: 'GitHub Operator', desc: 'Create issues, open PRs, run CI loops autonomously.', icon: '🐙', category: 'Dev', verified: true },
    { id: 'calendar-sync', name: 'Calendar Sync', desc: 'Schedule meetings, resolve conflicts, daily briefings.', icon: '📅', category: 'Productivity', verified: true },
    { id: 'notion-db', name: 'Notion Databases', desc: 'Read/write pages and databases in your workspace.', icon: '📝', category: 'Productivity', verified: false },
    { id: 'home-controller', name: 'Home Assistant', desc: 'Control smart home devices and automations.', icon: '🏠', category: 'Smart Home', verified: true },
    { id: 'voice-tts', name: 'Voice & TTS', desc: 'Make calls, speak responses with ElevenLabs voices.', icon: '🎙️', category: 'Media', verified: false },
    { id: 'image-gen', name: 'Image Generator', desc: 'Generate, edit, and analyze images on demand.', icon: '🖼️', category: 'Media', verified: true },
    { id: 'shell-runner', name: 'Shell Runner', desc: 'Execute scripts, run terminal commands remotely.', icon: '⚡', category: 'System', verified: true },
  ];

  // ── Scheduler State ──
  const [schedules, setSchedules] = useState<{id:string,name:string,cron:string,task:string,enabled:boolean,lastRun:string,nextRun:string}[]>([]);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [newScheduleName, setNewScheduleName] = useState('');
  const [newScheduleCron, setNewScheduleCron] = useState('daily-morning');
  const [newScheduleTask, setNewScheduleTask] = useState('');

  const [convChannel, setConvChannel] = useState('All');
  const [conversations, setConversations] = useState<{id:string,channel:string,sender:string,message:string,reply:string,time:string,model:string}[]>([]);
  const [convLoading, setConvLoading] = useState(false);
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://openclaw.niyogen.com';

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

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleTabChange = (tab: string) => {
    if (!hasPaid && tab !== 'payment') {
      showToast("Please complete payment to access your dashboard.");
      setActiveTab('payment');
    } else {
      setActiveTab(tab);
    }
  };

  // WhatsApp QR State
  const [qrGenerating, setQrGenerating] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [pollingStatus, setPollingStatus] = useState<string>("");

  // Credit Tracking State
  const [creditsUsed, setCreditsUsed] = useState<number>(0);
  const [creditLimit, setCreditLimit] = useState<number>(30000);
  const creditPercentage = creditLimit > 0 ? Math.min(100, Math.round((creditsUsed / creditLimit) * 100)) : 0;

  useEffect(() => {
    // 1. Get the email — try URL param → cookie → localStorage (in that order)
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    // Check URL param first (set by OAuth callback redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const emailFromUrl = urlParams.get('email');
    const emailCookie = getCookie('fastclaw_customer_email');
    const emailFromStorage = localStorage.getItem('fc_email');

    const resolvedEmail = emailFromUrl || emailCookie || emailFromStorage;

    if (!resolvedEmail) {
      setCustomerName("Guest");
      setActiveTab('payment');
      return;
    }

    const email = decodeURIComponent(resolvedEmail);

    // Persist email in cookie + localStorage so future visits work
    document.cookie = `fastclaw_customer_email=${encodeURIComponent(email)}; path=/; max-age=86400`;
    localStorage.setItem('fc_email', email);

    // Clean URL if email was in query string
    if (emailFromUrl) {
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    }

    setCustomerName(email.split('@')[0]);

    // ── continueInit: called once we have the real subdomain ──
    const continueInit = (email: string, sub: string) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://openclaw.niyogen.com';

    // ── Load from localStorage immediately (fast cache) ──
    try {
      const savedSkills = localStorage.getItem(`fc_skills_${sub}`);
      if (savedSkills) setInstalledSkills(JSON.parse(savedSkills));
    } catch {}

    // ── Load agents from DB (survives redeploys & works cross-device) ──
    (async () => {
      try {
        const r = await fetch(`${backendUrl}/api/tenant/${sub}/agents/db`);
        if (r.ok) {
          const data = await r.json();
          if (Array.isArray(data) && data.length > 0) {
            setAgents(data);
          } else {
            // Fall back to localStorage for users who created agents before DB migration
            const saved = localStorage.getItem(`fc_agents_${sub}`);
            if (saved) setAgents(JSON.parse(saved));
          }
        }
      } catch {
        const saved = localStorage.getItem(`fc_agents_${sub}`);
        if (saved) try { setAgents(JSON.parse(saved)); } catch {}
      }
    })();

    // ── Load schedules from DB ──
    (async () => {
      try {
        const r = await fetch(`${backendUrl}/api/tenant/${sub}/schedules/db`);
        if (r.ok) {
          const data = await r.json();
          if (Array.isArray(data) && data.length > 0) {
            setSchedules(data);
          } else {
            const saved = localStorage.getItem(`fc_schedules_${sub}`);
            if (saved) setSchedules(JSON.parse(saved));
          }
        }
      } catch {
        const saved = localStorage.getItem(`fc_schedules_${sub}`);
        if (saved) try { setSchedules(JSON.parse(saved)); } catch {}
      }
    })();

    // ── Load skill credentials from DB (cross-device) ──
    (async () => {
      try {
        const r = await fetch(`${backendUrl}/api/tenant/${sub}/skill-creds`);
        if (r.ok) {
          const dbCreds = await r.json();
          // Merge DB creds (masked) with localStorage (actual values for local use)
          const localCreds = (() => { try { return JSON.parse(localStorage.getItem(`fc_skill_creds_${sub}`) || '{}'); } catch { return {}; } })();
          setSkillCredentials({...localCreds, ...dbCreds});
        }
      } catch {
        const saved = localStorage.getItem(`fc_skill_creds_${sub}`);
        if (saved) try { setSkillCredentials(JSON.parse(saved)); } catch {}
      }
    })();

    // ── Fetch real WhatsApp conversation log from backend ──
    setConvLoading(true);
    (async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://openclaw.niyogen.com';
        const logRes = await fetch(`${backendUrl}/api/tenant/${sub}/whatsapp/log`);
        if (logRes.ok) {
          const logData = await logRes.json();
          if (Array.isArray(logData) && logData.length > 0) {
            setConversations(logData.map((msg: any, i: number) => ({
              id: `msg-${i}`,
              channel: 'WhatsApp',
              sender: msg.from || msg.sender || 'Unknown',
              message: msg.body || msg.message || '',
              reply: msg.reply || msg.response || '',
              time: msg.timestamp || msg.time || '',
              model: msg.model || 'Agent',
            })));
          }
        }
      } catch {}
      setConvLoading(false);
    })();

    // 2. Fetch the real configuration and API credits from the backend
    const fetchConfig = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://openclaw.niyogen.com';
        const response = await fetch(`${backendUrl}/api/tenant/${sub}/config`);
        if (response.ok) {
          const data = await response.json();
          setTenantConfig(data);

          // Update credits usage
          if (data.credits_used !== undefined) setCreditsUsed(data.credits_used);
          if (data.monthly_credits_limit !== undefined) setCreditLimit(data.monthly_credits_limit);

          // Update configured integrations
          const newConfigured: Record<string, boolean> = {};
          if (data.whatsapp_token && data.whatsapp_token !== "") newConfigured['whatsapp_token'] = true;
          if (data.telegram_token && data.telegram_token !== "") newConfigured['telegram_token'] = true;
          if (data.discord_token && data.discord_token !== "") newConfigured['discord_token'] = true;
          if (data.slack_token && data.slack_token !== "") newConfigured['slack_token'] = true;
          if (data.gmail_token && data.gmail_token !== "") newConfigured['gmail_token'] = true;

          // Check live WhatsApp connection status
          try {
            const statusRes = await fetch(`${backendUrl}/api/tenant/${sub}/whatsapp/status`);
            if (statusRes.ok) {
              const statusData = await statusRes.json();
              if (statusData.state === 'connected') {
                newConfigured['whatsapp_token'] = true;
              }
            }
          } catch (err) {
            console.error("Failed to check live WhatsApp status:", err);
          }

          setConfigured(newConfigured);
        }
      } catch (err) {
        console.error("Failed to fetch tenant config:", err);
      }
    };
    // 3. Check payment status — coupon API first, then payment cookie
    const checkPaymentStatus = async () => {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://openclaw.niyogen.com';
      // Always check coupon live — never trust a stale cookie for coupon users
      try {
        const couponRes = await fetch(`${backendUrl}/api/coupon/check?email=${encodeURIComponent(email)}`);
        if (couponRes.ok) {
          const couponData = await couponRes.json();
          if (couponData.has_coupon === true) {
            // ✅ Active coupon — grant access and set cookie with matching expiry
            const expiresAt = couponData.expires_at ?? null;
            const cookieExpiry = expiresAt ? `; expires=${new Date(expiresAt).toUTCString()}` : '';
            document.cookie = `fastclaw_payment_done=true; path=/${cookieExpiry}`;
            document.cookie = `fastclaw_coupon_user=true; path=/${cookieExpiry}`;
            setHasPaid(true);
            setHasCoupon(true);
            setCouponExpiresAt(expiresAt);
            if (expiresAt) {
              const totalSeconds = Math.max(0, (new Date(expiresAt).getTime() - Date.now()) / 1000);
              setCouponDaysRemaining(Math.ceil(totalSeconds / 86400));
              setCouponHoursRemaining(Math.ceil(totalSeconds / 3600));
            } else {
              setCouponDaysRemaining(couponData.days_remaining ?? null);
              setCouponHoursRemaining(null);
            }
            setActiveTab('dashboard');
            return;
          } else {
            // ❌ Coupon expired or revoked — clear payment cookie if it was coupon-based
            const wasCouponUser = getCookie('fastclaw_coupon_user') === 'true';
            if (wasCouponUser) {
              // Wipe coupon cookies — sends user to payment wall
              document.cookie = 'fastclaw_payment_done=false; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
              document.cookie = 'fastclaw_coupon_user=false; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
              setHasPaid(false);
              setActiveTab('payment');
              return;
            }
          }
        }
      } catch {
        // Coupon API failed — fall through to cookie check (network error)
      }
      // No coupon — check payment cookie (for real paid users)
      const paymentCookie = getCookie('fastclaw_payment_done');
      if (paymentCookie === 'true') {
        setHasPaid(true);
        setHasCoupon(false);
        setActiveTab('dashboard');
        return;
      }
      setHasPaid(false);
      setActiveTab('payment');
    };

    checkPaymentStatus();
    fetchConfig();
    }; // end continueInit

    // ── Resolve real subdomain then start init ──
    (async () => {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://openclaw.niyogen.com';
      try {
        const lookupRes = await fetch(`${backendUrl}/api/resolve-tenant?email=${encodeURIComponent(email)}`);
        if (lookupRes.ok) {
          const lookupData = await lookupRes.json();
          const sub = lookupData.subdomain;
          setTenantSubdomain(sub);
          if (lookupData.error) showToast(`⚠️ ${lookupData.error}`);
          if (lookupData.customer_name) setCustomerName(lookupData.customer_name);
          continueInit(email, sub);
        } else {
          const sub = email.split('@')[0].toLowerCase();
          setTenantSubdomain(sub);
          continueInit(email, sub);
        }
      } catch {
        const sub = email.split('@')[0].toLowerCase();
        setTenantSubdomain(sub);
        continueInit(email, sub);
      }
    })();

  }, []);


  const filteredIntegrations = activeCategory === 'All'
    ? integrations
    : integrations.filter(i => i.category === activeCategory);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIntegration) {
      try {
        const formData = new FormData(e.target as HTMLFormElement);
        const tokenValue = formData.get(selectedIntegration.id) as string;
        
        const payload: Record<string, string> = {};
        
        // Save the token if provided
        if (tokenValue) {
          payload[selectedIntegration.id] = tokenValue;
        }
        
        // Save the routing model if selected
        if (selectedIntegration.category !== 'Models' && routingModel) {
          const modelKey = selectedIntegration.id.replace('_token', '_model').replace('_url', '_model');
          payload[modelKey] = routingModel;
        }

        // Save whatsapp specific config
        if (selectedIntegration.id === 'whatsapp_token') {
          payload['whatsapp_reply_groups'] = whatsappReplyGroups ? "true" : "false";
          payload['allowed_numbers'] = allowedNumbers.trim();
        }

        // Send to backend if there are fields to save
        if (Object.keys(payload).length > 0) {
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://claw.niyogen.com';
          const sub = tenantSubdomain || customerName.toLowerCase();
          
          const res = await fetch(`${backendUrl}/api/tenant/${sub}/config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          
          if (!res.ok) throw new Error('Failed to save config');
          
          // Update local config state so it reflects immediately
          setTenantConfig((prev: any) => ({ ...prev, ...payload }));
        }

        setConfigured(prev => ({ ...prev, [selectedIntegration.id]: true }));
        setSelectedIntegration(null);
        setRoutingModel("");
        showToast("Settings saved successfully!");
      } catch (err) {
        console.error("Error saving config:", err);
        showToast("Error saving settings.");
      }
    }
  };

  const handleRemove = async () => {
    if (selectedIntegration) {
      try {
        const payload: Record<string, string> = {
          [selectedIntegration.id]: ""
        };
        
        if (selectedIntegration.category !== 'Models') {
          const modelKey = selectedIntegration.id.replace('_token', '_model').replace('_url', '_model');
          payload[modelKey] = "";
        }

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://claw.niyogen.com';
        const sub = tenantSubdomain || customerName.toLowerCase();
        
        const res = await fetch(`${backendUrl}/api/tenant/${sub}/config`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (!res.ok) throw new Error('Failed to remove config');
        
        // Update local state
        setTenantConfig((prev: any) => ({ ...prev, ...payload }));
        setConfigured(prev => ({ ...prev, [selectedIntegration.id]: false }));
        setSelectedIntegration(null);
        setRoutingModel("");
        showToast("Integration removed successfully!");
      } catch (err) {
        console.error("Error removing config:", err);
        showToast("Error removing integration.");
      }
    }
  };

  const openConfig = (item: any) => {
    setSelectedIntegration(item);
    
    // Auto-select the routing model if previously saved
    if (item.category !== 'Models') {
      const modelKey = item.id.replace('_token', '_model').replace('_url', '_model');
      setRoutingModel(tenantConfig[modelKey] || "");
    } else {
      setRoutingModel("");
    }

    if (item.id === 'whatsapp_token') {
      setWhatsappReplyGroups(tenantConfig['whatsapp_reply_groups'] === true || tenantConfig['whatsapp_reply_groups'] === "true");
      setAllowedNumbers(tenantConfig['allowed_numbers'] || '');
    } else {
      setWhatsappReplyGroups(false);
      setAllowedNumbers('');
    }
    
    setQrGenerating(false);
    setQrCodeUrl(null);
  };

  const handleGenerateQR = async () => {
    setQrGenerating(true);
    setQrCodeUrl(null);
    setPollingStatus("Starting WhatsApp Agent...");

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://claw.niyogen.com';
      const sub = tenantSubdomain || customerName.toLowerCase();

      const res = await fetch(`${backendUrl}/api/tenant/${sub}/whatsapp/start`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to start');

      // Poll for status
      const poll = setInterval(async () => {
        try {
          const statusRes = await fetch(`${backendUrl}/api/tenant/${sub}/whatsapp/status`);
          const statusData = await statusRes.json();

          if (statusData.state === 'qr' && statusData.qr) {
            clearInterval(poll);
            setQrGenerating(false);
            setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(statusData.qr)}`);
            setPollingStatus("");
          } else if (statusData.state === 'connected') {
            clearInterval(poll);
            setQrGenerating(false);
            setPollingStatus("Successfully Connected!");
            setConfigured(prev => ({ ...prev, 'whatsapp_token': true }));
          } else {
            setPollingStatus(`Status: ${statusData.state}...`);
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000);

      // Stop polling after 2 minutes to prevent memory leaks
      setTimeout(() => clearInterval(poll), 120000);

    } catch (err) {
      console.error(err);
      setQrGenerating(false);
      setPollingStatus("Error connecting to WhatsApp backend.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans relative selection:bg-white/10">
      {/* Dashboard Navbar */}
      <nav className="w-full z-40 bg-black border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-tr bg-white flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(255,255,255,0.2)] text-xs">
              O
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              FastClaw Portal
            </span>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Logout
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Menu */}
        <aside className="w-64 bg-black border-r border-white/10 p-6 flex flex-col gap-2 shrink-0">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 mt-2">Menu</div>
          <button onClick={() => handleTabChange('dashboard')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-left ${activeTab === 'dashboard' ? 'bg-white text-black shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-zinc-950'}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            Dashboard
          </button>
          <button onClick={() => handleTabChange('agents')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-left ${activeTab === 'agents' ? 'bg-white text-black shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-zinc-950'}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            My Agents
          </button>
          <button onClick={() => handleTabChange('skills')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-left ${activeTab === 'skills' ? 'bg-white text-black shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-zinc-950'}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            Skills
          </button>
          <button onClick={() => handleTabChange('scheduler')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-left ${activeTab === 'scheduler' ? 'bg-white text-black shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-zinc-950'}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Scheduler
          </button>

          <div className="border-t border-white/10 my-2" />
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 px-4">Agent Tools</div>
          <button onClick={() => handleTabChange('chat')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-left ${activeTab === 'chat' ? 'bg-white text-black shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-zinc-950'}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            Chat
          </button>
          {tenantConfig?.openclaw_enabled && (
            <button onClick={() => handleTabChange('openclaw')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-left ${activeTab === 'openclaw' ? 'bg-white text-black shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-zinc-950'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              OpenClaw Playground
            </button>
          )}
          <button onClick={() => handleTabChange('documents')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-left ${activeTab === 'documents' ? 'bg-white text-black shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-zinc-950'}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Documents
          </button>
          <button onClick={() => handleTabChange('activity')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-left ${activeTab === 'activity' ? 'bg-white text-black shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-zinc-950'}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Activity
          </button>
          <button onClick={() => handleTabChange('sessions')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-left ${activeTab === 'sessions' ? 'bg-white text-black shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-zinc-950'}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            Sessions
          </button>
          <button onClick={() => handleTabChange('livelogs')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-left ${activeTab === 'livelogs' ? 'bg-white text-black shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-zinc-950'}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            Live Logs
          </button>
          <div className="border-t border-white/10 my-2" />
          <button onClick={() => handleTabChange('configuration')} className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium text-sm text-left ${activeTab === 'configuration' ? 'bg-white text-black shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-zinc-950'}`}>
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Integrations
            </div>
            {!hasPaid && <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
          </button>
          <button onClick={() => handleTabChange('payment')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-left ${activeTab === 'payment' ? 'bg-white text-black shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-zinc-950'}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            Billing
          </button>
          <button onClick={() => handleTabChange('help')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-left ${activeTab === 'help' ? 'bg-white text-black shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-zinc-950'}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Help & Manual
          </button>
        </aside>

        {/* Dashboard Content */}
        <div className="flex-1 z-10 bg-black/80 flex flex-col overflow-hidden">

            {/* ── NEW FULL-HEIGHT TABS ── */}
            {activeTab === 'chat' && hasPaid && (
              <div className="flex-1 overflow-hidden"><ChatTab subdomain={tenantSubdomain} backendUrl={BACKEND_URL} /></div>
            )}
            {activeTab === 'documents' && hasPaid && (
              <div className="flex-1 overflow-hidden"><DocumentsTab subdomain={tenantSubdomain} backendUrl={BACKEND_URL} /></div>
            )}
            {activeTab === 'activity' && hasPaid && (
              <div className="flex-1 overflow-hidden"><ActivityTab subdomain={tenantSubdomain} backendUrl={BACKEND_URL} /></div>
            )}
            {activeTab === 'sessions' && hasPaid && (
              <div className="flex-1 overflow-hidden"><SessionsTab subdomain={tenantSubdomain} backendUrl={BACKEND_URL} /></div>
            )}
            {activeTab === 'livelogs' && hasPaid && (
              <div className="flex-1 overflow-hidden"><LiveLogsTab subdomain={tenantSubdomain} backendUrl={BACKEND_URL} /></div>
            )}
            {activeTab === 'openclaw' && hasPaid && tenantConfig?.openclaw_enabled && (
              <div className="flex-1 overflow-hidden"><OpenClawTab subdomain={tenantSubdomain} backendUrl={BACKEND_URL} /></div>
            )}

            {/* ── EXISTING TABS ── */}
            {!['chat','activity','sessions','livelogs','documents','openclaw'].includes(activeTab) && (
            <div className="flex-1 overflow-y-auto p-6 md:p-12">
            <div className="max-w-6xl mx-auto">

            {activeTab === 'dashboard' && (
              <div className="animate-in fade-in duration-300">
                <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{customerName}'s Workspace Dashboard</h1>
                    <p className="text-zinc-400">Overview of your API usage and active services.</p>
                  </div>
                  <div className="flex items-center gap-3 bg-zinc-950/50 border border-white/10 px-4 py-2 rounded-full w-fit">
                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center font-bold text-sm ">
                      {customerName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider leading-none mb-1">Customer</span>
                      <span className="text-sm font-semibold text-zinc-200 leading-none">{customerName}</span>
                    </div>
                  </div>
                </div>

                {/* Credits Usage Progress Bar */}
                <div className="bg-zinc-950 border border-white/10 rounded-2xl p-6 mb-10 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full translate-x-10 -translate-y-20"></div>
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4 relative z-10">
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        API Credits Usage
                      </h2>
                      <p className="text-zinc-400 text-sm mt-1">Monthly billing cycle resets in 14 days</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-white">{creditsUsed.toLocaleString()}</span>
                      <span className="text-zinc-500 text-sm ml-1">/ {creditLimit.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="w-full bg-slate-800 rounded-full h-3 mb-2 relative z-10 overflow-hidden">
                    <div 
                      className={`h-3 rounded-full transition-all duration-1000 ease-out ${creditPercentage > 90 ? 'bg-red-500' : creditPercentage > 75 ? 'bg-amber-500' : 'bg-gradient-to-r bg-white'}`}
                      style={{ width: `${creditPercentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center relative z-10">
                    <span className="text-xs font-semibold text-zinc-500">{creditPercentage}% Used</span>
                    {creditPercentage > 90 ? (
                      <button className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors">Upgrade Plan →</button>
                    ) : (
                      <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Active</span>
                    )}
                  </div>
                </div>

                {/* Additional Dashboard Stats could go here */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-zinc-950 border border-white/10 rounded-2xl p-6">
                    <div className="text-zinc-400 text-sm font-medium mb-2">Active Integrations</div>
                    <div className="text-3xl font-bold text-white">{Object.values(configured).filter(Boolean).length}</div>
                  </div>
                  <div className="bg-zinc-950 border border-white/10 rounded-2xl p-6">
                    <div className="text-zinc-400 text-sm font-medium mb-2">Payment Status</div>
                    <div className={`text-xl font-bold mt-1 ${hasPaid ? (hasCoupon ? 'text-violet-400' : 'text-emerald-400') : 'text-amber-400'}`}>
                      {hasPaid ? (hasCoupon ? '🎟️ Coupon Active' : 'Paid & Active') : 'Payment Required'}
                    </div>
                    {hasCoupon && couponDaysRemaining !== null && (
                      <div className="text-xs text-violet-300 mt-1">
                        {couponDaysRemaining !== null && couponDaysRemaining <= 1 && couponHoursRemaining !== null
                          ? `${couponHoursRemaining} hour${couponHoursRemaining !== 1 ? 's' : ''} remaining`
                          : `${couponDaysRemaining} day${couponDaysRemaining !== 1 ? 's' : ''} remaining`}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'configuration' && (
              <div className="animate-in fade-in duration-300">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-white mb-2">Integrations & Agents</h1>
                  <p className="text-zinc-400">Configure your FastClaw integrations, models, and agents.</p>
                </div>
                
                {/* Category Filter */}
                <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-5 py-2 rounded-xl font-medium whitespace-nowrap transition-all duration-200 ${
                        activeCategory === cat 
                        ? 'bg-white text-black shadow-md ' 
                        : 'bg-zinc-950 text-zinc-400 hover:bg-slate-800 border border-white/10'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredIntegrations.map((item) => (
                    <div key={item.id} className="bg-zinc-950 border border-white/10 hover:border-white/30 transition-colors rounded-2xl p-6 flex flex-col shadow-sm group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full translate-x-10 -translate-y-10 group-hover:bg-zinc-200/20 transition-all"></div>
                      <div className="mb-4 relative z-10">
                        {item.icon}
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2 relative z-10">{item.name}</h3>
                      <p className="text-zinc-400 text-sm flex-1 relative z-10 mb-6">{item.description}</p>
                      
                      <div className="relative z-10 flex items-center justify-between">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          configured[item.id] ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-zinc-400 border border-white/20'
                        }`}>
                          {configured[item.id] ? 'Configured' : 'Not Setup'}
                        </span>
                        
                        <button 
                          onClick={() => openConfig(item)}
                          className="text-sm font-medium bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-lg transition-colors shadow-lg "
                        >
                          Configure
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="animate-in fade-in duration-300 max-w-2xl">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-white mb-2">Billing & Payment</h1>
                  <p className="text-zinc-400">Manage your subscription and billing details.</p>
                </div>

                <div className="bg-zinc-950 border border-white/10 rounded-2xl p-8 shadow-xl">
                  {hasPaid ? (
                    <div className="text-center py-8">
                      {hasCoupon ? (
                        // ── Coupon Access ──
                        <>
                          <div className="w-16 h-16 bg-violet-500/10 text-violet-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2">🎟️ Coupon Access Active</h3>
                          <p className="text-zinc-400 mb-2">Your account is activated via an admin coupon. All features including Configuration are available.</p>
                          {couponDaysRemaining !== null && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-sm font-semibold mb-6">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              {couponDaysRemaining !== null && couponDaysRemaining <= 1 && couponHoursRemaining !== null
                                ? `${couponHoursRemaining} hour${couponHoursRemaining !== 1 ? 's' : ''} remaining`
                                : `${couponDaysRemaining} day${couponDaysRemaining !== 1 ? 's' : ''} remaining`}
                              {couponExpiresAt && <span className="text-violet-400/60 font-normal">· expires {new Date(couponExpiresAt).toLocaleDateString()}</span>}
                            </div>
                          )}
                          <div className="block"></div>
                          <button
                            onClick={() => setActiveTab('configuration')}
                            className="px-6 py-3 rounded-xl bg-violet-600 text-white hover:bg-violet-500 font-semibold transition-all shadow-lg shadow-violet-500/20"
                          >
                            Go to Configuration
                          </button>
                        </>
                      ) : (
                        // ── Paid Access ──
                        <>
                          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2">Payment Successful</h3>
                          <p className="text-zinc-400 mb-6">Your account is fully activated. You can now access all features including Configuration.</p>
                          <button
                            onClick={() => setActiveTab('configuration')}
                            className="px-6 py-3 rounded-xl bg-white text-black hover:bg-zinc-200 font-semibold transition-all shadow-lg"
                          >
                            Go to Configuration
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-4 mb-8 p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/50 shadow-[0_0_40px_-10px_rgba(245,158,11,0.25)] relative overflow-hidden group animate-in fade-in zoom-in duration-500">
                        <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors"></div>
                        <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 shadow-inner relative z-10">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <div className="relative z-10">
                          <h4 className="text-amber-400 font-bold mb-1 tracking-wide uppercase text-sm">Action Required</h4>
                          <p className="text-base font-medium text-amber-100">
                            You need to complete a payment to unlock configuration features and start using FastClaw.
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-center mb-10">
                        <div className="inline-flex bg-zinc-950 p-1 rounded-full border border-white/10">
                          <button
                            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-white text-black shadow-md shadow-white/20' : 'text-zinc-400 hover:text-white'}`}
                            onClick={() => setBillingCycle('monthly')}
                          >
                            Monthly
                          </button>
                          <button
                            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${billingCycle === 'quarterly' ? 'bg-white text-black shadow-md shadow-white/20' : 'text-zinc-400 hover:text-white'}`}
                            onClick={() => setBillingCycle('quarterly')}
                          >
                            Quarterly (-10%)
                          </button>
                          <button
                            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-white text-black shadow-md shadow-white/20' : 'text-zinc-400 hover:text-white'}`}
                            onClick={() => setBillingCycle('yearly')}
                          >
                            Yearly <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/20">-20%</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        {plans.map((plan) => (
                          <div
                            key={plan.name}
                            className={`relative bg-zinc-950/50 backdrop-blur-sm rounded-3xl p-8 transition-all duration-300 ${plan.popular ? 'border-2 border-white shadow-[0_0_40px_-10px_rgba(255,77,77,0.3)]' : 'border border-white/10'}`}
                          >
                            {plan.popular && (
                              <div className="absolute top-0 right-8 -translate-y-1/2">
                                <span className="bg-white text-black text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider ">
                                  Most Popular
                                </span>
                              </div>
                            )}

                            <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                            <p className="text-zinc-400 text-sm mb-6 h-10">{plan.description}</p>

                            <div className="mb-8 flex items-baseline gap-1">
                              <span className="text-5xl font-extrabold text-white">${plan.price[billingCycle]}</span>
                              <span className="text-zinc-500 font-medium">/ mo</span>
                            </div>

                            <button
                              className={`w-full py-3.5 rounded-xl font-bold transition-all mb-8 ${plan.buttonStyle === 'solid' ? 'bg-white text-black hover:bg-zinc-200 shadow-lg shadow-white/25' : 'bg-transparent border border-white/20 text-zinc-300 hover:border-slate-500 hover:bg-slate-800'}`}
                              onClick={async (e) => {
                                const btn = e.currentTarget;
                                btn.innerText = "Redirecting to Secure Checkout...";
                                btn.disabled = true;
                                try {
                                  // Fetch customer email from cookie
                                  const getCookie = (name: string) => {
                                    const value = `; ${document.cookie}`;
                                    const parts = value.split(`; ${name}=`);
                                    if (parts.length === 2) return parts.pop()?.split(';').shift();
                                    return null;
                                  };
                                  const emailCookie = getCookie('fastclaw_customer_email');
                                  const email = emailCookie ? decodeURIComponent(emailCookie) : tenantSubdomain + '@fastclaw.com';

                                  const res = await fetch('/api/checkout', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      companyName: customerName || 'FastClaw User',
                                      email: email,
                                      plan: plan.name.toLowerCase().includes('max') ? 'max' : 'pro',
                                      cycle: billingCycle
                                    })
                                  });
                                  
                                  const data = await res.json();
                                  if (data.url) {
                                    window.location.href = data.url;
                                  } else {
                                    throw new Error(data.error || "Failed to create checkout session");
                                  }
                                } catch (err) {
                                  console.error("Checkout error:", err);
                                  alert("Payment gateway error. Please try again.");
                                  btn.innerText = plan.buttonText;
                                  btn.disabled = false;
                                }
                              }}
                            >
                              {plan.buttonText}
                            </button>

                            <ul className="space-y-4">
                              <li className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <div>
                                  <p className="text-sm font-medium text-zinc-200">Credits</p>
                                  <p className="text-sm text-zinc-500">{plan.credits}</p>
                                </div>
                              </li>
                              <li className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <div>
                                  <p className="text-sm font-medium text-zinc-200">Engines</p>
                                  <p className="text-sm text-zinc-500">{plan.engines}</p>
                                </div>
                              </li>
                              <li className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <div>
                                  <p className="text-sm font-medium text-zinc-200">Hardware</p>
                                  <p className="text-sm text-zinc-500">{plan.hardware}</p>
                                </div>
                              </li>
                              <li className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <div>
                                  <p className="text-sm font-medium text-zinc-200">Security</p>
                                  <p className="text-sm text-zinc-500">{plan.security}</p>
                                </div>
                              </li>
                              <li className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <div>
                                  <p className="text-sm font-medium text-zinc-200">Channels</p>
                                  <p className="text-sm text-zinc-500">{plan.channels}</p>
                                </div>
                              </li>
                              {plan.extras !== '-' && (
                                <li className="flex items-start gap-3">
                                  <svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <div>
                                    <p className="text-sm font-medium text-zinc-200">Extras</p>
                                    <p className="text-sm text-zinc-500">{plan.extras}</p>
                                  </div>
                                </li>
                              )}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══════════════ AGENTS TAB ══════════════ */}
            {activeTab === 'agents' && (
              <div className="animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">My Agents</h1>
                    <p className="text-zinc-400">Create and manage your AI agents. Each agent can have its own persona, channels, and skills.</p>
                  </div>
                  <button onClick={() => setShowAgentForm(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 transition-all shadow-lg">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    New Agent
                  </button>
                </div>

                {showAgentForm && (
                  <div className="bg-zinc-950 border border-white/20 rounded-2xl p-6 mb-8 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-5">Create New Agent</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1.5">Agent Name</label>
                        <input value={newAgentName} onChange={e => setNewAgentName(e.target.value)} className="w-full bg-black border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/30" placeholder="e.g. Jarvis, Molty, Nova..." />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1.5">Primary Channel</label>
                        <select value={newAgentChannel} onChange={e => setNewAgentChannel(e.target.value)} className="w-full bg-black border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-white/30">
                          {['WhatsApp','Telegram','Discord','Slack'].map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1.5">AI Model</label>
                        <select value={newAgentModel} onChange={e => setNewAgentModel(e.target.value)} className="w-full bg-black border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-white/30">
                          {['OpenAI (GPT-4)','Anthropic (Claude)','Google Gemini','xAI Grok'].map(m => <option key={m}>{m}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1.5">Persona / SOUL</label>
                        <input value={newAgentPersona} onChange={e => setNewAgentPersona(e.target.value)} className="w-full bg-black border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/30" placeholder="e.g. Friendly assistant who is concise..." />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-5">
                      <button onClick={() => setShowAgentForm(false)} className="px-5 py-2.5 rounded-xl border border-white/20 text-zinc-300 hover:bg-zinc-900 font-medium transition-all">Cancel</button>
                      <button onClick={async () => {
                        if (newAgentName) {
                          // Save to DB first, fall back to local on error
                          const agentPayload = { name: newAgentName, persona: newAgentPersona || 'Helpful assistant', enabled: true, channel: newAgentChannel, model: newAgentModel, messagesHandled: 0 };
                          let newAgent: any = { id: `agent-${Date.now()}`, ...agentPayload };
                          try {
                            const r = await fetch(`${BACKEND_URL}/api/tenant/${tenantSubdomain}/agents/db`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(agentPayload) });
                            if (r.ok) newAgent = await r.json();
                          } catch {}
                          setAgents(prev => {
                            const updated = [...prev, newAgent];
                            localStorage.setItem(`fc_agents_${tenantSubdomain}`, JSON.stringify(updated));
                            return updated;
                          });
                          setShowAgentForm(false); setNewAgentName(''); setNewAgentPersona('');
                          showToast(`Agent "${newAgentName}" created!`);
                        }
                      }} className="px-5 py-2.5 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 transition-all shadow-lg">
                        Create Agent
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {agents.map(agent => (
                    <div key={agent.id} className="bg-zinc-950 border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {agent.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-lg">{agent.name}</h3>
                            <p className="text-zinc-500 text-sm">{agent.persona}</p>
                          </div>
                        </div>
                        <button onClick={() => setAgents(prev => {
                          const updated = prev.map(a => a.id === agent.id ? {...a, enabled: !a.enabled} : a);
                          localStorage.setItem(`fc_agents_${tenantSubdomain}`, JSON.stringify(updated));
                          return updated;
                        })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${agent.enabled ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${agent.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-black/40 rounded-xl p-3 text-center">
                          <div className="text-xs text-zinc-500 mb-1">Channel</div>
                          <div className="text-sm font-semibold text-white">{agent.channel}</div>
                        </div>
                        <div className="bg-black/40 rounded-xl p-3 text-center">
                          <div className="text-xs text-zinc-500 mb-1">Model</div>
                          <div className="text-sm font-semibold text-white">{agent.model}</div>
                        </div>
                        <div className="bg-black/40 rounded-xl p-3 text-center">
                          <div className="text-xs text-zinc-500 mb-1">Messages</div>
                          <div className="text-sm font-semibold text-white">{agent.messagesHandled}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${agent.enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-500 border border-white/10'}`}>
                          {agent.enabled ? '● Online' : '○ Offline'}
                        </span>
                        <button onClick={() => { setAgents(prev => { const updated = prev.filter(a => a.id !== agent.id); localStorage.setItem(`fc_agents_${tenantSubdomain}`, JSON.stringify(updated)); return updated; }); showToast(`Agent "${agent.name}" deleted.`); }}
                          className="ml-auto text-xs text-zinc-600 hover:text-rose-400 transition-colors px-3 py-1 rounded-lg hover:bg-rose-500/10">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══════════════ SKILLS TAB ══════════════ */}
            {activeTab === 'skills' && (
              <div className="animate-in fade-in duration-300">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-white mb-2">Skills Marketplace</h1>
                  <p className="text-zinc-400">Install community skills to give your agent new superpowers. Browse the ClawHub library.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {skillsMarketplace.map(skill => {
                    const installed = installedSkills.includes(skill.id);
                    return (
                      <div key={skill.id} className={`bg-zinc-950 border rounded-2xl p-5 transition-all hover:border-white/30 group ${installed ? 'border-emerald-500/30' : 'border-white/10'}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{skill.icon}</span>
                            <div>
                              <h3 className="font-bold text-white text-sm">{skill.name}</h3>
                              <span className="text-xs text-zinc-500">{skill.category}</span>
                            </div>
                          </div>
                          {skill.verified && <span className="text-xs text-sky-400 bg-sky-400/10 border border-sky-400/20 px-2 py-0.5 rounded-full font-semibold">✓ Verified</span>}
                        </div>
                        <p className="text-zinc-400 text-sm mb-4 leading-relaxed">{skill.desc}</p>
                        <div className="flex gap-2 w-full">
                          {installed && skillCredFields[skill.id] && (
                            <button
                              onClick={() => {
                                setSkillCredInput(skillCredentials[skill.id] || {});
                                setSkillConfigModal(skill.id);
                              }}
                              className="flex-1 py-2 rounded-xl font-semibold text-sm transition-all bg-zinc-800 text-white border border-white/10 hover:bg-zinc-700"
                            >
                              Configure
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              if (installed) {
                                // Uninstall — remove from list and clear creds
                                setInstalledSkills(prev => { const u = prev.filter(s => s !== skill.id); localStorage.setItem(`fc_skills_${tenantSubdomain}`, JSON.stringify(u)); return u; });
                                setSkillCredentials(prev => { const u = {...prev}; delete u[skill.id]; localStorage.setItem(`fc_skill_creds_${tenantSubdomain}`, JSON.stringify(u)); return u; });
                                // Also sync with backend
                                try { await fetch(`${BACKEND_URL}/api/tenant/${tenantSubdomain}/skills/${skill.id}`, { method: 'DELETE' }); } catch {}
                                showToast(`"${skill.name}" uninstalled.`);
                              } else if (skillCredFields[skill.id]) {
                                // Needs credentials — open config modal
                                setSkillCredInput(skillCredentials[skill.id] || {});
                                setSkillConfigModal(skill.id);
                              } else {
                                // No credentials needed — install directly
                                setInstalledSkills(prev => { const u = [...prev, skill.id]; localStorage.setItem(`fc_skills_${tenantSubdomain}`, JSON.stringify(u)); return u; });
                                // Also sync with backend
                                try { await fetch(`${BACKEND_URL}/api/tenant/${tenantSubdomain}/skills/${skill.id}`, { method: 'POST' }); } catch {}
                                showToast(`"${skill.name}" installed!`);
                              }
                            }}
                            className={`py-2 rounded-xl font-semibold text-sm transition-all ${
                              installed
                                ? 'flex-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20'
                                : 'w-full bg-white text-black hover:bg-zinc-200 shadow-md'
                            }`}
                          >
                            {installed ? 'Uninstall' : 'Install Skill'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 p-4 bg-zinc-950 border border-white/10 rounded-2xl flex items-center gap-4">
                  <span className="text-2xl">🔒</span>
                  <div>
                    <p className="text-white font-semibold text-sm">All skills are scanned by NVIDIA SkillSpector</p>
                    <p className="text-zinc-500 text-xs mt-0.5">Every skill is verified for hidden instructions and agentic risks before appearing in this marketplace.</p>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════ SCHEDULER TAB ══════════════ */}
            {activeTab === 'scheduler' && (
              <div className="animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Heartbeat Scheduler</h1>
                    <p className="text-zinc-400">Set up proactive tasks your agent runs automatically — without you lifting a finger.</p>
                  </div>
                  <button onClick={() => setShowScheduleForm(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 transition-all shadow-lg">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    New Schedule
                  </button>
                </div>

                {showScheduleForm && (
                  <div className="bg-zinc-950 border border-white/20 rounded-2xl p-6 mb-8 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-5">Add Heartbeat Task</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1.5">Task Name</label>
                        <input value={newScheduleName} onChange={e => setNewScheduleName(e.target.value)} className="w-full bg-black border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/30" placeholder="e.g. Morning Briefing" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1.5">Schedule</label>
                        <select value={newScheduleCron} onChange={e => setNewScheduleCron(e.target.value)} className="w-full bg-black border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-white/30">
                          <option value="daily-morning">Every day at 8:00 AM</option>
                          <option value="daily-evening">Every day at 6:00 PM</option>
                          <option value="hourly">Every hour</option>
                          <option value="weekly-monday">Every Monday at 9:00 AM</option>
                          <option value="weekly-friday">Every Friday at 5:00 PM</option>
                          <option value="monthly">1st of every month</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-zinc-300 mb-1.5">What should the agent do?</label>
                        <textarea value={newScheduleTask} onChange={e => setNewScheduleTask(e.target.value)} rows={3} className="w-full bg-black border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none" placeholder="e.g. Check email, summarize calendar events, and send a briefing to WhatsApp." />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-5">
                      <button onClick={() => setShowScheduleForm(false)} className="px-5 py-2.5 rounded-xl border border-white/20 text-zinc-300 hover:bg-zinc-900 font-medium transition-all">Cancel</button>
                      <button onClick={async () => {
                        if (newScheduleName && newScheduleTask) {
                          const payload = { name: newScheduleName, cron_preset: newScheduleCron, task: newScheduleTask, enabled: true };
                          try {
                            const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
                            const res = await fetch(`${BACKEND_URL}/api/tenant/${tenantSubdomain}/schedules/db`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(payload)
                            });
                            if (res.ok) {
                              const ns = await res.json();
                              setSchedules(prev => { const u = [...prev, ns]; localStorage.setItem(`fc_schedules_${tenantSubdomain}`, JSON.stringify(u)); return u; });
                              showToast(`Schedule "${newScheduleName}" created!`);
                            } else {
                              showToast(`Error creating schedule`);
                            }
                          } catch (e) {
                            showToast(`Network error creating schedule`);
                          }
                          setShowScheduleForm(false); setNewScheduleName(''); setNewScheduleTask('');
                        }
                      }} className="px-5 py-2.5 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 transition-all shadow-lg">Save Schedule</button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {schedules.map(s => (
                    <div key={s.id} className="bg-zinc-950 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-white">{s.name}</h3>
                            <span className="text-xs text-zinc-500 bg-zinc-900 border border-white/10 px-2.5 py-0.5 rounded-full">{s.cron}</span>
                          </div>
                          <p className="text-zinc-400 text-sm mb-4 leading-relaxed">{s.task}</p>
                          <div className="flex gap-6 text-xs text-zinc-600">
                            <span>Last run: <span className="text-zinc-400">{s.lastRun}</span></span>
                            <span>Next run: <span className="text-zinc-400">{s.nextRun}</span></span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          <button onClick={async () => {
                            const newStatus = !s.enabled;
                            try {
                              const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
                              await fetch(`${BACKEND_URL}/api/tenant/${tenantSubdomain}/schedules/db/${s.id}`, {
                                method: 'PUT', headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify({ enabled: newStatus })
                              });
                              setSchedules(prev => { const u = prev.map(sc => sc.id === s.id ? {...sc, enabled: newStatus} : sc); localStorage.setItem(`fc_schedules_${tenantSubdomain}`, JSON.stringify(u)); return u; });
                            } catch (e) { console.error(e); }
                          }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${s.enabled ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${s.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                          <button onClick={async () => {
                            try {
                              const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
                              await fetch(`${BACKEND_URL}/api/tenant/${tenantSubdomain}/schedules/db/${s.id}`, { method: 'DELETE' });
                              setSchedules(prev => { const u = prev.filter(sc => sc.id !== s.id); localStorage.setItem(`fc_schedules_${tenantSubdomain}`, JSON.stringify(u)); return u; });
                              showToast('Schedule deleted.');
                            } catch (e) { console.error(e); }
                          }}
                            className="text-zinc-600 hover:text-rose-400 transition-colors p-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {schedules.length === 0 && (
                    <div className="text-center py-20 text-zinc-600">
                      <svg className="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <p className="font-medium">No schedules yet</p>
                      <p className="text-sm mt-1">Add your first heartbeat task to get started.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══════════════ CONVERSATIONS TAB ══════════════ */}
            {activeTab === 'conversations' && (
              <div className="animate-in fade-in duration-300">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-white mb-2">Conversation Logs</h1>
                  <p className="text-zinc-400">View all messages your agent handled across every connected channel.</p>
                </div>
                <div className="flex gap-2 mb-6 flex-wrap">
                  {['All', 'WhatsApp', 'Telegram', 'Discord', 'Slack'].map(ch => (
                    <button key={ch} onClick={() => setConvChannel(ch)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${convChannel === ch ? 'bg-white text-black shadow' : 'bg-zinc-950 text-zinc-400 border border-white/10 hover:border-white/30'}`}>
                      {ch}
                    </button>
                  ))}
                </div>
                {convLoading ? (
                  <div className="flex items-center justify-center py-20 gap-3 text-zinc-500">
                    <div className="w-5 h-5 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
                    Loading conversation history...
                  </div>
                ) : (
                  <div className="space-y-3">
                  {conversations.filter(c => convChannel === 'All' || c.channel === convChannel).map(c => (
                    <div key={c.id} className="bg-zinc-950 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${c.channel === 'WhatsApp' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : c.channel === 'Telegram' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : c.channel === 'Discord' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'}`}>
                          {c.channel}
                        </span>
                        <span className="text-xs text-zinc-600">{c.sender}</span>
                        <span className="ml-auto text-xs text-zinc-600">{c.time}</span>
                        <span className="text-xs text-zinc-700 bg-zinc-900 px-2 py-0.5 rounded-full border border-white/5">{c.model}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex gap-2 items-start">
                          <span className="text-xs font-bold text-zinc-600 w-10 shrink-0 pt-0.5">User</span>
                          <p className="text-sm text-zinc-200 bg-zinc-900 rounded-xl px-3 py-2 flex-1">{c.message}</p>
                        </div>
                        <div className="flex gap-2 items-start">
                          <span className="text-xs font-bold text-emerald-600 w-10 shrink-0 pt-0.5">Agent</span>
                          <p className="text-sm text-zinc-300 bg-emerald-950/30 border border-emerald-500/10 rounded-xl px-3 py-2 flex-1">{c.reply}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {conversations.filter(c => convChannel === 'All' || c.channel === convChannel).length === 0 && (
                    <div className="text-center py-20 text-zinc-600">
                      <svg className="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                      <p className="font-medium">No conversations yet</p>
                      <p className="text-sm mt-1 text-zinc-700">Connect WhatsApp or Telegram in <span className="text-zinc-500 font-medium">Integrations</span> to start receiving messages.</p>
                    </div>
                  )}
                  </div>
                )}
              </div>
            )}

            {/* ── Help & Manual ── */}
            {activeTab === 'help' && (
              <div className="animate-in fade-in duration-300 space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Help &amp; Manual</h1>
                  <p className="text-zinc-400">Step-by-step guides for every feature. Click a section to expand.</p>
                </div>

                {/* Quick Jump Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {([
                    {icon:'🤖',label:'Create Agent',desc:'Build your AI persona',tab:'agents'},
                    {icon:'⚡',label:'Install Skills',desc:'Add capabilities',tab:'skills'},
                    {icon:'📱',label:'Connect WhatsApp',desc:'Scan QR & go live',tab:'configuration'},
                    {icon:'🕐',label:'Auto-Schedule',desc:'Run tasks on timer',tab:'scheduler'},
                  ] as {icon:string;label:string;desc:string;tab:string}[]).map(item=>(
                    <button key={item.tab} onClick={()=>handleTabChange(item.tab)}
                      className="p-4 rounded-2xl bg-zinc-950 border border-white/10 hover:border-indigo-500/40 hover:bg-zinc-900 transition-all text-left group">
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <div className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">{item.label}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>

                {/* Accordion Sections */}
                <div className="space-y-2">

                  <details className="rounded-2xl bg-zinc-950 border border-white/10 overflow-hidden group">
                    <summary className="flex items-center gap-3 px-6 py-4 cursor-pointer hover:bg-zinc-900/60 transition-colors list-none select-none">
                      <span className="text-xl">🚀</span>
                      <span className="font-bold text-white flex-1">Getting Started</span>
                      <svg className="w-4 h-4 text-zinc-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                    </summary>
                    <div className="px-6 pb-6 pt-4 border-t border-white/5 space-y-3">
                      {[
                        {n:1,text:'Open your browser and go to',code:'https://claw.niyogen.com'},
                        {n:2,text:'Click the "Sign in with Google" button and choose your Google account.'},
                        {n:3,text:'Your private workspace is automatically created — with a dedicated database schema, isolated from all other customers.'},
                      ].map(s=>(
                        <div key={s.n} className="flex gap-3 items-start">
                          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{s.n}</span>
                          <p className="text-sm text-zinc-300">{s.text}{s.code && <code className="ml-1 bg-zinc-800 text-indigo-300 px-1.5 py-0.5 rounded text-xs">{s.code}</code>}</p>
                        </div>
                      ))}
                      <div className="flex gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 mt-2">
                        <span className="text-base">💡</span>
                        <p className="text-xs text-indigo-300">Each account gets its own <strong>dedicated PostgreSQL schema</strong> in the database. Your agents, skills, conversations, and integrations are stored in your private schema — completely isolated. No other customer can access your data.</p>
                      </div>
                    </div>
                  </details>

                  <details className="rounded-2xl bg-zinc-950 border border-white/10 overflow-hidden group">
                    <summary className="flex items-center gap-3 px-6 py-4 cursor-pointer hover:bg-zinc-900/60 transition-colors list-none select-none">
                      <span className="text-xl">🤖</span>
                      <span className="font-bold text-white flex-1">My Agents — Create & Manage</span>
                      <svg className="w-4 h-4 text-zinc-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                    </summary>
                    <div className="px-6 pb-6 pt-4 border-t border-white/5 space-y-3">
                      {[
                        {n:1,text:'Click "My Agents" in the left sidebar.'},
                        {n:2,text:'Click the "+ New Agent" button in the top right.'},
                        {n:3,text:'Fill in: Agent Name, Primary Channel, AI Model, and Persona/SOUL.'},
                        {n:4,text:'Click "Create Agent". Your agent appears as a card.'},
                      ].map(s=>(
                        <div key={s.n} className="flex gap-3 items-start">
                          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{s.n}</span>
                          <p className="text-sm text-zinc-300">{s.text}</p>
                        </div>
                      ))}
                      <div className="bg-zinc-900 rounded-xl p-3 mt-1">
                        <p className="text-xs text-zinc-500 mb-1 font-semibold">Example Persona / SOUL</p>
                        <p className="text-xs font-mono text-emerald-300">&quot;You are Aria, a friendly support agent for TechCorp. Keep replies under 3 sentences. Never discuss competitors.&quot;</p>
                      </div>
                      <div className="flex gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                        <span className="text-base">💡</span>
                        <p className="text-xs text-amber-300">Use the ✏️ icon to edit an agent, 🗑️ to delete. Deleting an agent does not delete its conversation history.</p>
                      </div>
                    </div>
                  </details>

                  <details className="rounded-2xl bg-zinc-950 border border-white/10 overflow-hidden group">
                    <summary className="flex items-center gap-3 px-6 py-4 cursor-pointer hover:bg-zinc-900/60 transition-colors list-none select-none">
                      <span className="text-xl">📧</span>
                      <span className="font-bold text-white flex-1">Gmail Manager — Credential Setup</span>
                      <svg className="w-4 h-4 text-zinc-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                    </summary>
                    <div className="px-6 pb-6 pt-4 border-t border-white/5 space-y-3">
                      {[
                        {n:1,text:'Go to "Skills" → click "Install Skill" on Gmail Manager.'},
                        {n:2,text:'A modal asks for your Gmail Address and App Password.'},
                        {n:3,text:'To get an App Password: visit',code:'myaccount.google.com/apppasswords'},
                        {n:4,text:'Select "Other" → name it "FastClaw" → click Generate. Copy the 16-character password.'},
                        {n:5,text:'Paste it into the App Password field → click "Save & Activate".'},
                      ].map(s=>(
                        <div key={s.n} className="flex gap-3 items-start">
                          <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{s.n}</span>
                          <p className="text-sm text-zinc-300">{s.text}{s.code && <code className="ml-1 bg-zinc-800 text-indigo-300 px-1.5 py-0.5 rounded text-xs">{s.code}</code>}</p>
                        </div>
                      ))}
                      <div className="flex gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                        <span className="text-base">⚠️</span>
                        <p className="text-xs text-red-300">You must have <strong>2-Step Verification enabled</strong> on your Google account before App Passwords appear.</p>
                      </div>
                    </div>
                  </details>

                  <details className="rounded-2xl bg-zinc-950 border border-white/10 overflow-hidden group">
                    <summary className="flex items-center gap-3 px-6 py-4 cursor-pointer hover:bg-zinc-900/60 transition-colors list-none select-none">
                      <span className="text-xl">⚡</span>
                      <span className="font-bold text-white flex-1">Other Skills — GitHub, Notion, Home Assistant, Voice</span>
                      <svg className="w-4 h-4 text-zinc-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                    </summary>
                    <div className="px-6 pb-6 pt-4 border-t border-white/5 space-y-3">
                      {[
                        {icon:'🐙',skill:'GitHub',where:'github.com/settings/tokens',how:'Generate new token (classic) → check repo + workflow scopes → copy token starting with ghp_'},
                        {icon:'📝',skill:'Notion',where:'notion.so/my-integrations',how:'New Integration → name it → copy token starting with secret_'},
                        {icon:'🏠',skill:'Home Assistant',where:'Your HA URL (e.g. homeassistant.local:8123)',how:'Profile page → Long-Lived Access Tokens → Create Token'},
                        {icon:'🎙️',skill:'Voice & TTS',where:'elevenlabs.io',how:'Sign in → Profile icon → API Key → Copy'},
                      ].map(s=>(
                        <div key={s.skill} className="bg-zinc-900 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-base">{s.icon}</span>
                            <span className="text-sm font-bold text-white">{s.skill}</span>
                          </div>
                          <p className="text-xs text-zinc-500 mb-1">Where: <code className="text-indigo-300">{s.where}</code></p>
                          <p className="text-xs text-zinc-400">{s.how}</p>
                        </div>
                      ))}
                    </div>
                  </details>

                  <details className="rounded-2xl bg-zinc-950 border border-white/10 overflow-hidden group">
                    <summary className="flex items-center gap-3 px-6 py-4 cursor-pointer hover:bg-zinc-900/60 transition-colors list-none select-none">
                      <span className="text-xl">🕐</span>
                      <span className="font-bold text-white flex-1">Heartbeat Scheduler — Auto Tasks</span>
                      <svg className="w-4 h-4 text-zinc-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                    </summary>
                    <div className="px-6 pb-6 pt-4 border-t border-white/5 space-y-3">
                      {[
                        {n:1,text:'Click "Scheduler" in the sidebar.'},
                        {n:2,text:'Click "+ New Schedule" in the top right.'},
                        {n:3,text:'Enter a Task Name (e.g. "Morning Email Check").'},
                        {n:4,text:'Choose a Schedule: Every day at 8:00 AM, Every hour, etc.'},
                        {n:5,text:'Describe the task in plain English — the agent will do it.'},
                        {n:6,text:'Click "Save Schedule". Use the toggle to pause/resume anytime.'},
                      ].map(s=>(
                        <div key={s.n} className="flex gap-3 items-start">
                          <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{s.n}</span>
                          <p className="text-sm text-zinc-300">{s.text}</p>
                        </div>
                      ))}
                      <div className="bg-zinc-900 rounded-xl p-3">
                        <p className="text-xs text-zinc-500 mb-1 font-semibold">Example Task</p>
                        <p className="text-xs font-mono text-emerald-300">&quot;Check my inbox and send me a WhatsApp summary of unread emails from today.&quot;</p>
                      </div>
                    </div>
                  </details>

                  <details className="rounded-2xl bg-zinc-950 border border-white/10 overflow-hidden group">
                    <summary className="flex items-center gap-3 px-6 py-4 cursor-pointer hover:bg-zinc-900/60 transition-colors list-none select-none">
                      <span className="text-xl">📱</span>
                      <span className="font-bold text-white flex-1">Connect WhatsApp — QR Pairing</span>
                      <svg className="w-4 h-4 text-zinc-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                    </summary>
                    <div className="px-6 pb-6 pt-4 border-t border-white/5 space-y-3">
                      {[
                        {n:1,text:'Go to "Integrations" → click the WhatsApp card.'},
                        {n:2,text:'Click "Start WhatsApp Session" and wait 5–10 seconds.'},
                        {n:3,text:'A QR code appears on screen.'},
                        {n:4,text:'On your phone: WhatsApp → Settings → Linked Devices → Link a Device.'},
                        {n:5,text:'Scan the QR code. Status turns Connected ✅.'},
                        {n:6,text:'Select an AI model from the dropdown → click Save.'},
                      ].map(s=>(
                        <div key={s.n} className="flex gap-3 items-start">
                          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{s.n}</span>
                          <p className="text-sm text-zinc-300">{s.text}</p>
                        </div>
                      ))}
                      <div className="flex gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3">
                        <span>💡</span>
                        <p className="text-xs text-indigo-300">If the QR code expires before you scan it, click Refresh QR Code and try again. The session stays linked until you unlink from your phone.</p>
                      </div>
                    </div>
                  </details>

                  <details className="rounded-2xl bg-zinc-950 border border-white/10 overflow-hidden group">
                    <summary className="flex items-center gap-3 px-6 py-4 cursor-pointer hover:bg-zinc-900/60 transition-colors list-none select-none">
                      <span className="text-xl">🔒</span>
                      <span className="font-bold text-white flex-1">Security — Whitelist Allowed Numbers</span>
                      <svg className="w-4 h-4 text-zinc-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                    </summary>
                    <div className="px-6 pb-6 pt-4 border-t border-white/5 space-y-3">
                      {[
                        {n:1,text:'Go to "Integrations" → click the WhatsApp card.'},
                        {n:2,text:'Scroll down to the "🔒 Allowed Phone Numbers" field.'},
                        {n:3,text:'Enter phone numbers with country code, comma-separated.'},
                        {n:4,text:'Click Save. Only those numbers will receive AI replies.'},
                      ].map(s=>(
                        <div key={s.n} className="flex gap-3 items-start">
                          <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{s.n}</span>
                          <p className="text-sm text-zinc-300">{s.text}</p>
                        </div>
                      ))}
                      <div className="bg-zinc-900 rounded-xl p-3">
                        <p className="text-xs text-zinc-500 mb-1 font-semibold">Example</p>
                        <p className="text-xs font-mono text-emerald-300">+94771234567, +14155552671, +919876543210</p>
                      </div>
                      <div className="flex gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                        <span>💡</span>
                        <p className="text-xs text-amber-300"><strong>Leave empty</strong> = anyone can message your agent. Fill it = only listed numbers get AI replies.</p>
                      </div>
                    </div>
                  </details>

                  <details className="rounded-2xl bg-zinc-950 border border-white/10 overflow-hidden group">
                    <summary className="flex items-center gap-3 px-6 py-4 cursor-pointer hover:bg-zinc-900/60 transition-colors list-none select-none">
                      <span className="text-xl">❓</span>
                      <span className="font-bold text-white flex-1">Troubleshooting — Common Issues</span>
                      <svg className="w-4 h-4 text-zinc-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                    </summary>
                    <div className="px-6 pb-6 pt-4 border-t border-white/5 space-y-3">
                      {[
                        {q:'Agent is not replying on WhatsApp',checks:['WhatsApp session is Connected (green status in Integrations)','An AI model is selected and saved','Your API key has remaining credits','The sender number is in the whitelist — or the whitelist is empty']},
                        {q:'Gmail skill says Authentication Failed',checks:['You are using an App Password — NOT your regular Gmail password','2-Step Verification is enabled on your Google account','The App Password was created specifically for FastClaw']},
                        {q:'Out of API Credits',checks:['Credits reset automatically on the 1st of each month','To get more immediately, upgrade your plan in Billing']},
                      ].map((item,i)=>(
                        <div key={i} className="bg-zinc-900 rounded-xl p-4">
                          <p className="text-sm font-bold text-white mb-2">❓ {item.q}</p>
                          <ul className="space-y-1">
                            {item.checks.map((c,j)=>(
                              <li key={j} className="flex items-start gap-2 text-xs text-zinc-400">
                                <span className="text-emerald-400 mt-0.5">✓</span>{c}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </details>

                </div>

                {/* Quick Reference */}
                <div className="p-6 rounded-2xl bg-zinc-950 border border-white/10">
                  <h3 className="text-base font-bold text-white mb-4">📋 Quick Reference</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {([
                      {l:'Portal',v:'https://claw.niyogen.com'},
                      {l:'Gmail App Passwords',v:'myaccount.google.com/apppasswords'},
                      {l:'GitHub Tokens',v:'github.com/settings/tokens'},
                      {l:'Notion Integrations',v:'notion.so/my-integrations'},
                      {l:'ElevenLabs API Key',v:'elevenlabs.io → Profile → API Key'},
                      {l:'Backend API',v:'https://openclaw.niyogen.com'},
                    ] as {l:string;v:string}[]).map(r=>(
                      <div key={r.l} className="flex flex-col">
                        <span className="text-zinc-500 text-xs">{r.l}</span>
                        <span className="font-mono text-indigo-300 text-xs mt-0.5">{r.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

      {/* Skill Credential Config Modal */}
      {skillConfigModal && (() => {
        const skill = skillsMarketplace.find(s => s.id === skillConfigModal)!;
        const fields = skillCredFields[skillConfigModal] || [];
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSkillConfigModal(null)} />
            <div className="bg-zinc-950 border border-white/20 rounded-2xl shadow-2xl w-full max-w-lg relative z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{skill.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-white">Configure {skill.name}</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Enter your credentials to activate this skill</p>
                  </div>
                </div>
                <button onClick={() => setSkillConfigModal(null)} className="p-2 rounded-lg hover:bg-zinc-900 transition-colors">
                  <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto">
                {fields.map((field, idx) => {
                  const isPassword = field.type === 'password';
                  const showPass = !!showPasswords[field.key];
                  return (
                    <div key={idx}>
                      <label className="block text-sm font-medium text-zinc-300 mb-1.5">{field.label}</label>
                      <div className="relative">
                        <input
                          type={isPassword ? (showPass ? 'text' : 'password') : field.type}
                          value={skillCredInput[field.key] || ''}
                          onChange={e => setSkillCredInput(prev => ({...prev, [field.key]: e.target.value}))}
                          className="w-full bg-black border border-white/20 rounded-lg pl-4 pr-16 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-white transition-all"
                          placeholder={field.placeholder}
                        />
                        {isPassword && (
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({...prev, [field.key]: !prev[field.key]}))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs font-bold px-2 py-1 rounded hover:bg-zinc-850 transition-colors"
                          >
                            {showPass ? 'HIDE' : 'SHOW'}
                          </button>
                        )}
                      </div>
                      {field.help && (
                        <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                          💡 {field.help}
                        </p>
                      )}
                    </div>
                  );
                })}
                <div className="pt-4 border-t border-white/10 flex gap-3">
                  <button onClick={() => setSkillConfigModal(null)} className="flex-1 px-4 py-2.5 rounded-lg border border-white/20 text-zinc-300 hover:bg-zinc-900 font-medium transition-colors">
                    Cancel
                  </button>
                  <button
                    disabled={skillSaving}
                    onClick={async () => {
                      setSkillSaving(true);
                      try {
                        // Save creds locally
                        const updatedCreds = {...skillCredentials, [skillConfigModal]: skillCredInput};
                        setSkillCredentials(updatedCreds);
                        localStorage.setItem(`fc_skill_creds_${tenantSubdomain}`, JSON.stringify(updatedCreds));

                        // Mark as installed
                        setInstalledSkills(prev => {
                          if (prev.includes(skillConfigModal)) return prev;
                          const u = [...prev, skillConfigModal];
                          localStorage.setItem(`fc_skills_${tenantSubdomain}`, JSON.stringify(u));
                          return u;
                        });

                        // Sync install to backend
                        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://openclaw.niyogen.com';
                        await fetch(`${backendUrl}/api/tenant/${tenantSubdomain}/skills/${skillConfigModal}`, { method: 'POST' }).catch(() => {});
                        // Save credentials to DB (cross-device persistence)
                        await fetch(`${backendUrl}/api/tenant/${tenantSubdomain}/skill-creds`, {
                          method: 'POST',
                          headers: {'Content-Type': 'application/json'},
                          body: JSON.stringify({ skill_id: skillConfigModal, credentials: skillCredInput }),
                        }).catch(() => {});

                        // For GitHub: test the connection immediately
                        if (skillConfigModal === 'github-copilot' && skillCredInput.token) {
                          const testRes = await fetch(`${backendUrl}/api/tenant/${tenantSubdomain}/skill/github`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              task: 'who am i',
                              github_token: skillCredInput.token,
                              repo: skillCredInput.repo || '',
                            }),
                          }).catch(() => null);
                          if (testRes?.ok) {
                            const testData = await testRes.json();
                            if (testData.status === 'success') {
                              showToast(`✅ GitHub connected! ${testData.result.split('\n')[1] || ''}`);
                              setSkillConfigModal(null);
                              return;
                            } else {
                              showToast(`⚠️ Saved but token check failed: ${testData.result.slice(0, 80)}`);
                              setSkillConfigModal(null);
                              return;
                            }
                          }
                        }

                        showToast(`✓ ${skill.name} connected!`);
                        setSkillConfigModal(null);
                      } finally {
                        setSkillSaving(false);
                      }
                    }}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-white text-black font-semibold hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {skillSaving ? <><div className="w-4 h-4 border-2 border-zinc-400 border-t-black rounded-full animate-spin" /> Connecting...</> : 'Save & Activate'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Configuration Modal */}
      {selectedIntegration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedIntegration(null)}></div>
          <div className="bg-zinc-950 border border-white/20 rounded-2xl shadow-2xl w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="scale-75 origin-left">{selectedIntegration.icon}</div>
                <h3 className="text-xl font-bold text-white">Configure {selectedIntegration.name}</h3>
              </div>
              <button onClick={() => setSelectedIntegration(null)} className="text-zinc-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto">
              {selectedIntegration.id === 'whatsapp_token' ? (
                <div className="flex flex-col items-center justify-center space-y-4 py-6 border border-white/10 rounded-xl bg-black/50 px-4">
                  {configured['whatsapp_token'] ? (
                    <div className="flex flex-col items-center text-center w-full animate-in fade-in duration-300">
                      <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(16,185,129,0.15)] border border-emerald-500/20">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="text-white font-semibold mb-2 text-base">WhatsApp Connected</h4>
                      <p className="text-xs text-zinc-400 mb-6 max-w-[280px] leading-relaxed">
                        Your WhatsApp account is active and connected. FastClaw is monitoring for inbound messages and forwarding payment alerts.
                      </p>
                      
                      <div className="w-full text-left bg-zinc-900/50 border border-white/5 rounded-xl p-4 mb-6 space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Allowed Sender Numbers</label>
                          <textarea
                            value={allowedNumbers}
                            onChange={(e) => setAllowedNumbers(e.target.value)}
                            placeholder="e.g. +61482078699, +61400234567"
                            rows={2}
                            className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 resize-none"
                          />
                          <p className="text-[10px] text-zinc-500 mt-1">Leave empty to allow all incoming messages. Separate with commas or newlines.</p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold text-zinc-300">Allow Group Messages</p>
                            <p className="text-[10px] text-zinc-500 mt-0.5">Let agent respond to group chats</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setWhatsappReplyGroups(!whatsappReplyGroups)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${whatsappReplyGroups ? 'bg-emerald-500' : 'bg-zinc-800'}`}
                          >
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${whatsappReplyGroups ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-3 w-full">
                        <button
                          type="button"
                          onClick={handleSave}
                          className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-white font-semibold transition-all text-sm border border-white/10"
                        >
                          Save Settings
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (confirm("Are you sure you want to disconnect WhatsApp? This will log out the session.")) {
                              try {
                                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://claw.niyogen.com';
                                const sub = tenantSubdomain || customerName.toLowerCase();
                                await fetch(`${backendUrl}/api/tenant/${sub}/whatsapp/start?reset=true`, { method: 'POST' });
                                setConfigured(prev => ({ ...prev, 'whatsapp_token': false }));
                                showToast("WhatsApp disconnected.");
                              } catch (e) {
                                console.error(e);
                              }
                            }
                          }}
                          className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold transition-all text-sm border border-rose-500/20"
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>
                  ) : qrCodeUrl ? (
                    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                      <div className="bg-zinc-950 p-3 rounded-2xl mb-4 shadow-[0_0_30px_rgba(37,211,102,0.15)] border border-white/10">
                        <img src={qrCodeUrl} alt="WhatsApp QR Code" className="w-48 h-48 rounded-lg" />
                      </div>
                      <p className="text-sm text-zinc-300 text-center max-w-[250px] font-medium">
                        Scan this QR code with your WhatsApp mobile app to connect.
                      </p>
                      <div className="flex flex-col items-center gap-2 mt-4 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          Waiting for scan...
                        </div>
                      </div>
                      {pollingStatus === "Successfully Connected!" && (
                        <div className="mt-4 font-bold text-green-400 text-sm">
                          {pollingStatus}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={handleGenerateQR}
                        className="mt-6 text-xs text-zinc-400 hover:text-white transition-colors underline underline-offset-4"
                      >
                        Refresh QR Code
                      </button>
                    </div>
                  ) : qrGenerating ? (
                    <div className="flex flex-col items-center py-10 animate-in fade-in duration-300">
                      <div className="relative w-16 h-16 mb-6">
                        <div className="absolute inset-0 border-4 border-[#25D366]/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-[#25D366] rounded-full border-t-transparent animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-6 h-6 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.418-.099.824z" /></svg>
                        </div>
                      </div>
                      <p className="text-sm text-zinc-300 font-medium">Requesting secure QR code...</p>
                      <p className="text-xs text-zinc-500 mt-2">{pollingStatus || "Connecting to Baileys engine"}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center py-4 animate-in fade-in duration-300">
                      <div className="w-20 h-20 bg-[#25D366]/10 text-[#25D366] rounded-full flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(37,211,102,0.1)]">
                        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.418-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 3.825.001 6.938 3.113 6.938 6.938-.001 3.825-3.113 6.937-6.938 6.937z" /></svg>
                      </div>
                      <h4 className="text-white font-semibold mb-2">Connect WhatsApp Business</h4>
                      <p className="text-sm text-zinc-400 mb-6 max-w-[280px] leading-relaxed">
                        Link your WhatsApp account seamlessly by scanning a generated QR code, just like WhatsApp Web.
                      </p>
                      <button
                        type="button"
                        onClick={handleGenerateQR}
                        className="px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#20b858] text-white font-semibold transition-all duration-200 shadow-lg shadow-[#25D366]/25 hover:shadow-[#25D366]/40 hover:-translate-y-0.5 flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                        Generate QR Code
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                selectedIntegration.fields.map((field: any, idx: number) => (
                  <div key={idx}>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">{field.label}</label>
                    <input
                      type={field.type}
                      name={selectedIntegration.id}
                      required={field.type !== 'text'} // Require passwords
                      className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-white transition-all"
                      placeholder={field.placeholder}
                    />
                  </div>
                ))
              )}

              {/* AI Routing Model Dropdown - only show if not a model itself */}
              {selectedIntegration.category !== 'Models' && (
                <div className="pt-4 border-t border-white/10 mt-2">
                  <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center justify-between">
                    <span>AI Routing Model</span>
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                  </label>
                  <select
                    value={routingModel}
                    onChange={(e) => setRoutingModel(e.target.value)}
                    className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-white transition-all appearance-none cursor-pointer"
                    required
                  >
                    <option value="">-- Select AI Assistant --</option>
                    <option value="openai">OpenAI (GPT-4)</option>
                    <option value="anthropic">Anthropic (Claude)</option>
                    <option value="gemini">Google Gemini</option>
                    <option value="xai">xAI Grok</option>
                  </select>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    Select which AI model should automatically process messages and actions for <span className="font-semibold text-white">{selectedIntegration.name}</span>. This routing configuration will be saved directly into your Customer Schema database.
                  </p>
                </div>
              )}

              {selectedIntegration.id === 'whatsapp_token' && (
                <div className="pt-4 border-t border-white/10 mt-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center h-5">
                      <input
                        id="whatsappReplyGroups"
                        type="checkbox"
                        checked={whatsappReplyGroups}
                        onChange={(e) => setWhatsappReplyGroups(e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 bg-zinc-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-950 transition-colors cursor-pointer"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="whatsappReplyGroups" className="text-sm font-medium text-zinc-300 cursor-pointer">
                        Reply to Group Messages
                      </label>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        If enabled, the AI will reply to all messages sent inside WhatsApp group chats.
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5 flex items-center gap-2">
                      🔒 Allowed Phone Numbers
                      <span className="text-xs font-normal text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Whitelist</span>
                    </label>
                    <textarea
                      value={allowedNumbers}
                      onChange={(e) => setAllowedNumbers(e.target.value)}
                      rows={3}
                      className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-white transition-all resize-none text-sm font-mono"
                      placeholder="+94771234567, +14155552671"
                    />
                    <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                      💡 Enter phone numbers (with country code) separated by commas. <strong className="text-zinc-300">Leave empty to allow everyone.</strong> Only listed numbers will get AI replies.
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedIntegration(null)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-white/20 text-zinc-300 hover:bg-slate-800 transition-colors font-medium"
                >
                  Cancel
                </button>
                {configured[selectedIntegration.id] && (
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 font-medium transition-colors"
                  >
                    Remove
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-lg bg-white text-black hover:bg-zinc-200 font-medium transition-colors shadow-lg shadow-indigo-600/20"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    {/* Toast Notification */}
      {toastMessage && (() => {
        const isError = toastMessage?.toLowerCase().includes('error');
        const isWarning = toastMessage?.toLowerCase().includes('please complete payment');
        
        return (
          <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className={`bg-zinc-950 border shadow-[0_10px_40px_-10px_rgba(245,158,11,0.3)] rounded-xl p-4 flex items-center gap-3 pr-6 ${isError ? 'border-red-500/30 shadow-[0_10px_40px_-10px_rgba(239,68,68,0.3)]' : isWarning ? 'border-amber-500/30 shadow-[0_10px_40px_-10px_rgba(245,158,11,0.3)]' : 'border-emerald-500/30 shadow-[0_10px_40px_-10px_rgba(16,185,129,0.3)]'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isError ? 'bg-red-500/10 text-red-500' : isWarning ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                {isError ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                ) : isWarning ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-0.5">{isError ? 'Error' : isWarning ? 'Action Required' : 'Success'}</h4>
                <p className="text-sm text-zinc-300">{toastMessage}</p>
              </div>
            <button 
              onClick={() => setToastMessage(null)}
              className="absolute top-2 right-2 text-zinc-500 hover:text-zinc-300"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
        );
      })()}
            </div>
            </div>
            )}
        </div>
      </div>
    </div>
  );
}
