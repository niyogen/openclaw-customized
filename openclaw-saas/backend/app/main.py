from fastapi import FastAPI, HTTPException, Depends, Request, Header, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import boto3
import uuid
import re
import os
import math
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import text

from .db.database import SessionLocal, engine, get_db
from .db import models

# Create database tables (In production, use Alembic for migrations)
models.Base.metadata.create_all(bind=engine)

# ── Safe startup migrations ───────────────────────────────────────────────────
try:
    from sqlalchemy import text as _text
    with engine.connect() as _conn:
        _conn.execute(_text("ALTER TABLE customer_configs ADD COLUMN IF NOT EXISTS allowed_numbers TEXT"))
        _conn.commit()
except Exception:
    pass  # Column may already exist or DB unavailable at boot
# ─────────────────────────────────────────────────────────────────────────────

subdomain_prefix = os.getenv("SUBDOMAIN")
app = FastAPI(title="Surf Claw SaaS API")

@app.get("/")
async def root():
    return {"message": "Surf Claw Orchestrator API"}

from fastapi.responses import HTMLResponse



@app.get("/{subdomain_prefix}", response_class=HTMLResponse)
async def tenant_root(subdomain_prefix: str):
        html_content = """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>__SUBDOMAIN__ | Surf Claw Workspace</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
            <script src="https://unpkg.com/lucide@latest"></script>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                body {{ font-family: 'Inter', sans-serif; }}
                [x-cloak] {{ display: none !important; }}
            </style>
        </head>
        <body class="bg-slate-50 text-slate-800 antialiased selection:bg-indigo-500 selection:text-white" x-data="tenantDashboard()" x-init="init()">
            
            <!-- Login Screen -->
            <template x-if="!isAuthenticated">
                <main class="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center">
                    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
                    
                    <div class="relative w-full max-w-md p-8 m-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl overflow-hidden group">
                        <div class="absolute -inset-2 bg-gradient-to-tr from-indigo-500 to-cyan-400 opacity-20 blur-xl group-hover:opacity-40 transition duration-700"></div>
                        <div class="relative z-10">
                            <div class="flex justify-center mb-6">
                                <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                    <i data-lucide="cloud-lightning" class="w-8 h-8 text-white"></i>
                                </div>
                            </div>
                            <h1 class="text-3xl font-bold text-center text-white mb-2">Welcome Back</h1>
                            <p class="text-center text-slate-300 mb-8 text-sm">Sign in to manage your <span class="capitalize font-semibold text-white">__SUBDOMAIN__</span> workspace.</p>
                            
                            <form @submit.prevent="login" class="space-y-5">
                                <div>
                                    <label class="block text-sm font-medium text-slate-200 mb-1.5 ml-1">Email Address</label>
                                    <div class="relative">
                                        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <i data-lucide="mail" class="w-5 h-5 text-slate-400"></i>
                                        </div>
                                        <input type="email" x-model="loginEmail" required class="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" placeholder="admin@surfclaw.com">
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-200 mb-1.5 ml-1">Password</label>
                                    <div class="relative">
                                        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <i data-lucide="lock" class="w-5 h-5 text-slate-400"></i>
                                        </div>
                                        <input type="password" x-model="loginPassword" required class="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" placeholder="••••••••">
                                    </div>
                                </div>
                                
                                <div x-show="loginError" x-collapse>
                                    <div class="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-200 text-sm">
                                        <i data-lucide="alert-circle" class="w-4 h-4 shrink-0"></i>
                                        <span x-text="loginError"></span>
                                    </div>
                                </div>

                                <button type="submit" class="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
                                    <span>Sign In to Workspace</span>
                                    <i data-lucide="arrow-right" class="w-4 h-4"></i>
                                </button>
                            </form>
                        </div>
                    </div>
                </main>
            </template>

            <!-- Dashboard Screen -->
            <template x-if="isAuthenticated">
                <div class="flex h-screen overflow-hidden bg-slate-50">
                    
                    <!-- Sidebar (Desktop) -->
                    <aside class="hidden md:flex flex-col w-72 bg-slate-900 text-slate-300 transition-all duration-300 z-20">
                        <div class="h-20 flex items-center px-8 bg-slate-950/50 border-b border-slate-800">
                            <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center mr-3 shadow-lg shadow-indigo-500/20">
                                <i data-lucide="cloud-lightning" class="w-5 h-5 text-white"></i>
                            </div>
                            <span class="text-xl font-bold text-white tracking-tight">Surf Claw</span>
                        </div>
                        
                        <div class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                            <div class="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Workspace</div>
                            <a href="#" @click.prevent="currentTab='chat'; $nextTick(()=>{{ scrollChat(); lucide.createIcons(); }})" :class="currentTab==='chat' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'" class="flex items-center px-4 py-2.5 rounded-xl transition-colors">
                                <i data-lucide="message-square" class="w-5 h-5 mr-3"></i><span class="font-medium">Chat</span>
                            </a>
                            <a href="#" @click.prevent="currentTab='activity'; loadActivity();" :class="currentTab==='activity' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'" class="flex items-center px-4 py-2.5 rounded-xl transition-colors">
                                <i data-lucide="zap" class="w-5 h-5 mr-3"></i><span class="font-medium">Activity</span>
                            </a>
                            <a href="#" @click.prevent="currentTab='sessions'; loadSessions();" :class="currentTab==='sessions' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'" class="flex items-center px-4 py-2.5 rounded-xl transition-colors">
                                <i data-lucide="layers" class="w-5 h-5 mr-3"></i><span class="font-medium">Sessions</span>
                            </a>
                            <div class="px-3 mt-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Config</div>
                            <a href="#" @click.prevent="currentTab='integrations'" :class="currentTab==='integrations' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'" class="flex items-center px-4 py-2.5 rounded-xl transition-colors">
                                <i data-lucide="blocks" class="w-5 h-5 mr-3"></i><span class="font-medium">Integrations</span>
                            </a>
                            <a href="#" @click.prevent="currentTab='cron'; loadCronJobs(); $nextTick(()=>lucide.createIcons())" :class="currentTab==='cron' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'" class="flex items-center px-4 py-2.5 rounded-xl transition-colors">
                                <i data-lucide="clock" class="w-5 h-5 mr-3"></i><span class="font-medium">Cron Jobs</span>
                            </a>
                            <a href="#" @click.prevent="currentTab='logs'" :class="currentTab==='logs' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'" class="flex items-center px-4 py-2.5 rounded-xl transition-colors">
                                <i data-lucide="scroll-text" class="w-5 h-5 mr-3"></i><span class="font-medium">Logs</span>
                            </a>
                        </div>
                        
                        <div class="p-4 border-t border-slate-800 bg-slate-900">
                            <div class="flex items-center p-3 rounded-xl bg-slate-800/50">
                                <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-white font-semibold">
                                    <span class="uppercase" x-text="'__SUBDOMAIN__'.charAt(0)"></span>
                                </div>
                                <div class="ml-3 overflow-hidden">
                                    <p class="text-sm font-medium text-white truncate capitalize">__SUBDOMAIN__</p>
                                    <p class="text-xs text-slate-400 truncate">Admin Account</p>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <!-- Main Content -->
                    <div class="flex flex-col flex-1 overflow-hidden relative">
                        <!-- Mobile Header -->
                        <header class="md:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-slate-200 z-10">
                            <div class="flex items-center">
                                <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center mr-2">
                                    <i data-lucide="cloud-lightning" class="w-5 h-5 text-white"></i>
                                </div>
                                <span class="font-bold text-slate-900">Surf Claw</span>
                            </div>
                            <button @click="logout" class="p-2 text-slate-500 bg-slate-100 rounded-lg">
                                <i data-lucide="log-out" class="w-5 h-5"></i>
                            </button>
                        </header>

                        <!-- Desktop Top Header -->
                        <header class="hidden md:flex items-center justify-between h-20 px-8 bg-white/80 backdrop-blur-md border-b border-slate-200 z-10 sticky top-0">
                            <h2 class="text-xl font-semibold text-slate-800 capitalize">__SUBDOMAIN__ Dashboard</h2>
                            <button @click="logout" class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                <i data-lucide="log-out" class="w-4 h-4"></i>
                                Sign Out
                            </button>
                        </header>

                        <!-- Scrollable Content Area -->
                        <main class="flex-1 overflow-hidden bg-slate-50 flex flex-col">

                            <!-- CHAT TAB -->
                            <div x-show="currentTab==='chat'" class="flex flex-col h-full" style="display:none">
                                <!-- Chat header -->
                                <div class="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
                                    <div>
                                        <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                                            <i data-lucide="bot" class="w-5 h-5 text-indigo-500"></i> AI Agent Chat
                                        </h3>
                                        <p class="text-xs text-slate-500 mt-0.5">Talk to your configured AI agent directly</p>
                                    </div>
                                    <button @click="clearChat()" class="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> New session
                                    </button>
                                </div>
                                <!-- Messages -->
                                <div id="chat-messages" class="flex-1 overflow-y-auto p-6 space-y-4">
                                    <template x-if="chatMessages.length===0">
                                        <div class="flex flex-col items-center justify-center h-full text-center py-16">
                                            <div class="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                                                <i data-lucide="bot" class="w-8 h-8 text-indigo-500"></i>
                                            </div>
                                            <h4 class="text-slate-800 font-semibold text-lg">Your AI Agent</h4>
                                            <p class="text-slate-500 text-sm mt-2 max-w-xs">Send a message to start chatting. Your agent uses the AI model configured in Integrations.</p>
                                            <div class="flex flex-wrap gap-2 mt-6 justify-center">
                                                <template x-for="s in chatSuggestions" :key="s">
                                                    <button @click="sendChat(s)" x-text="s" class="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-all shadow-sm"></button>
                                                </template>
                                            </div>
                                        </div>
                                    </template>
                                    <template x-for="msg in chatMessages" :key="msg.id">
                                        <div :class="msg.role==='user' ? 'flex justify-end' : 'flex justify-start'">
                                            <div :class="msg.role==='user' ? 'bg-indigo-600 text-white rounded-2xl rounded-br-sm max-w-lg' : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-bl-sm max-w-lg shadow-sm'" class="px-4 py-3 text-sm leading-relaxed">
                                                <template x-if="msg.role==='assistant' && msg.tool">
                                                    <div class="flex items-center gap-2 text-xs text-indigo-500 mb-2 font-semibold bg-indigo-50 px-2 py-1 rounded-lg">
                                                        <i data-lucide="wrench" class="w-3 h-3"></i>
                                                        <span x-text="'🔧 ' + msg.tool"></span>
                                                    </div>
                                                </template>
                                                <p x-text="msg.content" class="whitespace-pre-wrap"></p>
                                                <p :class="msg.role==='user' ? 'text-indigo-200' : 'text-slate-400'" class="text-[10px] mt-1.5" x-text="msg.time"></p>
                                            </div>
                                        </div>
                                    </template>
                                    <template x-if="chatLoading">
                                        <div class="flex justify-start">
                                            <div class="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                                                <div class="flex gap-1 items-center h-5">
                                                    <span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay:0ms"></span>
                                                    <span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay:150ms"></span>
                                                    <span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay:300ms"></span>
                                                </div>
                                            </div>
                                        </div>
                                    </template>
                                    <div id="chat-bottom"></div>
                                </div>
                                <!-- Input -->
                                <div class="px-6 py-4 bg-white border-t border-slate-200 shrink-0">
                                    <div class="flex gap-3 items-end bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                                        <textarea x-model="chatInput" @keydown.enter.prevent="if(!$event.shiftKey) sendChat(chatInput)" placeholder="Message your AI agent… (Enter to send, Shift+Enter for new line)" rows="1" :disabled="chatLoading" class="flex-1 bg-transparent border-none resize-none text-sm text-slate-800 placeholder-slate-400 focus:outline-none max-h-32" style="min-height:24px"
                                            @input="$el.style.height='auto'; $el.style.height=Math.min($el.scrollHeight,128)+'px'"></textarea>
                                        <button @click="sendChat(chatInput)" :disabled="chatLoading || !chatInput.trim()" class="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white flex items-center justify-center transition-colors shrink-0">
                                            <i data-lucide="send" class="w-4 h-4"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- ACTIVITY TAB -->
                            <div x-show="currentTab==='activity'" class="flex flex-col h-full overflow-y-auto p-6" style="display:none">
                                <div class="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 class="text-2xl font-bold text-slate-900">Live Activity</h3>
                                        <p class="text-slate-500 text-sm mt-1">Real-time feed of agent tool calls and channel events</p>
                                    </div>
                                    <button @click="loadActivity()" class="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                                        <i data-lucide="refresh-cw" class="w-4 h-4"></i> Refresh
                                    </button>
                                </div>
                                <div class="space-y-3">
                                    <template x-if="activityFeed.length===0">
                                        <div class="flex flex-col items-center justify-center py-20 text-center">
                                            <i data-lucide="zap" class="w-12 h-12 text-slate-300 mb-4"></i>
                                            <h4 class="text-slate-600 font-medium">No activity yet</h4>
                                            <p class="text-slate-400 text-sm mt-1">Activity appears here as your agent processes messages.</p>
                                        </div>
                                    </template>
                                    <template x-for="ev in activityFeed" :key="ev.id">
                                        <div class="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-start gap-3 shadow-sm">
                                            <div :class="ev.type==='error' ? 'bg-red-100 text-red-500' : ev.type==='tool' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'" class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                                                <i :data-lucide="ev.type==='error' ? 'alert-circle' : ev.type==='tool' ? 'wrench' : 'check'" class="w-4 h-4"></i>
                                            </div>
                                            <div class="flex-1 min-w-0">
                                                <p class="text-sm font-medium text-slate-800" x-text="ev.summary"></p>
                                                <p class="text-xs text-slate-400 mt-0.5" x-text="ev.time"></p>
                                            </div>
                                            <span :class="ev.channel==='whatsapp' ? 'bg-green-100 text-green-700' : ev.channel==='telegram' ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600'" class="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase" x-text="ev.channel"></span>
                                        </div>
                                    </template>
                                </div>
                            </div>

                            <!-- SESSIONS TAB -->
                            <div x-show="currentTab==='sessions'" class="flex flex-col h-full overflow-y-auto p-6" style="display:none">
                                <div class="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 class="text-2xl font-bold text-slate-900">Sessions</h3>
                                        <p class="text-slate-500 text-sm mt-1">Active and recent AI agent conversations</p>
                                    </div>
                                    <button @click="loadSessions()" class="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                                        <i data-lucide="refresh-cw" class="w-4 h-4"></i> Refresh
                                    </button>
                                </div>
                                <template x-if="sessions.length===0">
                                    <div class="flex flex-col items-center justify-center py-20 text-center">
                                        <i data-lucide="layers" class="w-12 h-12 text-slate-300 mb-4"></i>
                                        <h4 class="text-slate-600 font-medium">No sessions yet</h4>
                                        <p class="text-slate-400 text-sm mt-1">Sessions appear here when users message your agent.</p>
                                    </div>
                                </template>
                                <div class="space-y-3">
                                    <template x-for="sess in sessions" :key="sess.id">
                                        <div class="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer" @click="openTranscript(sess.id)">
                                            <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm" x-text="(sess.sender||'?').charAt(0).toUpperCase()"></div>
                                            <div class="flex-1 min-w-0">
                                                <p class="font-semibold text-slate-800 text-sm" x-text="sess.sender || 'Unknown'"></p>
                                                <p class="text-xs text-slate-500 truncate" x-text="sess.last_message || 'No messages'"></p>
                                            </div>
                                            <div class="text-right shrink-0">
                                                <span :class="sess.channel==='whatsapp' ? 'bg-green-100 text-green-700' : 'bg-sky-100 text-sky-700'" class="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase" x-text="sess.channel"></span>
                                                <p class="text-xs text-slate-400 mt-1" x-text="sess.last_active"></p>
                                            </div>
                                        </div>
                                    </template>
                                </div>
                            </div>

                            <!-- CRON JOBS TAB -->
                            <div x-show="currentTab==='cron'" class="flex flex-col h-full overflow-y-auto p-6" style="display:none">
                                <div class="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 class="text-2xl font-bold text-slate-900">Cron Jobs</h3>
                                        <p class="text-slate-500 text-sm mt-1">Schedule automated tasks — daily reports, reminders, data sync</p>
                                    </div>
                                    <button @click="showCronForm=!showCronForm; $nextTick(()=>lucide.createIcons())" class="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors">
                                        <i data-lucide="plus" class="w-4 h-4"></i> New Job
                                    </button>
                                </div>

                                <!-- Create form -->
                                <div x-show="showCronForm" class="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 mb-6" style="display:none">
                                    <h4 class="font-semibold text-slate-800 mb-4">Schedule New Job</h4>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Job Name</label>
                                            <input x-model="newCron.name" placeholder="Daily WhatsApp Summary" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
                                        </div>
                                        <div>
                                            <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Schedule (Cron)</label>
                                            <input x-model="newCron.schedule" placeholder="0 9 * * * (9am daily)" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
                                        </div>
                                        <div>
                                            <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Channel</label>
                                            <select x-model="newCron.channel" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none">
                                                <option value="whatsapp">WhatsApp</option>
                                                <option value="telegram">Telegram</option>
                                                <option value="slack">Slack</option>
                                                <option value="discord">Discord</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label class="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Message / Prompt</label>
                                            <input x-model="newCron.message" placeholder="Send a daily WhatsApp summary of tasks" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
                                        </div>
                                    </div>
                                    <div class="flex gap-3 mt-4">
                                        <button @click="saveCronJob()" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors">Save Job</button>
                                        <button @click="showCronForm=false" class="px-5 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                                    </div>
                                    <!-- Quick presets -->
                                    <div class="mt-4 pt-4 border-t border-indigo-200">
                                        <p class="text-xs text-slate-500 font-medium mb-2">Quick presets:</p>
                                        <div class="flex flex-wrap gap-2">
                                            <template x-for="p in cronPresets" :key="p.label">
                                                <button @click="newCron.schedule=p.cron; newCron.name=p.label" x-text="p.label" class="px-3 py-1 bg-white border border-indigo-200 text-indigo-600 text-xs font-medium rounded-lg hover:bg-indigo-100 transition-colors"></button>
                                            </template>
                                        </div>
                                    </div>
                                </div>

                                <!-- Jobs list -->
                                <template x-if="cronJobs.length===0 && !showCronForm">
                                    <div class="flex flex-col items-center justify-center py-16 text-center">
                                        <i data-lucide="clock" class="w-12 h-12 text-slate-300 mb-4"></i>
                                        <h4 class="text-slate-600 font-medium">No scheduled jobs</h4>
                                        <p class="text-slate-400 text-sm mt-1">Click "New Job" to schedule your first automated task.</p>
                                    </div>
                                </template>
                                <div class="space-y-3">
                                    <template x-for="job in cronJobs" :key="job.id">
                                        <div class="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
                                            <div :class="job.enabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'" class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                                                <i data-lucide="clock" class="w-5 h-5"></i>
                                            </div>
                                            <div class="flex-1 min-w-0">
                                                <p class="font-semibold text-slate-800 text-sm" x-text="job.name"></p>
                                                <p class="text-xs text-slate-500 font-mono" x-text="job.schedule + ' · ' + job.channel"></p>
                                                <p class="text-xs text-slate-400 truncate mt-0.5" x-text="job.message"></p>
                                            </div>
                                            <div class="flex items-center gap-2 shrink-0">
                                                <button @click="toggleCronJob(job.id)" :class="job.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'" class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors" x-text="job.enabled ? 'Active' : 'Paused'"></button>
                                                <button @click="deleteCronJob(job.id)" class="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </template>
                                </div>
                            </div>

                            <!-- INTEGRATIONS + LOGS in scrollable wrapper -->
                            <div x-show="currentTab==='integrations' || currentTab==='logs'" class="flex-1 overflow-y-auto p-4 md:p-8">
                            <div class="max-w-4xl mx-auto space-y-8 pb-12">
                                
                                <!-- Integrations Tab -->
                                <div x-show="currentTab === 'integrations'" x-transition.opacity.duration.300ms>
                                    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                                        <div>
                                            <h3 class="text-2xl font-bold text-slate-900">App Integrations</h3>
                                            <p class="text-slate-500 mt-1">Connect your LLMs, chat apps, and smart home devices to Surf Claw.</p>
                                        </div>
                                    </div>

                                <!-- Alerts -->
                                <div x-show="error" x-collapse x-cloak>
                                    <div class="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3 shadow-sm mb-6">
                                        <i data-lucide="alert-triangle" class="w-5 h-5 shrink-0 mt-0.5"></i>
                                        <div class="flex-1">
                                            <h4 class="text-sm font-semibold">Error saving configuration</h4>
                                            <p class="text-sm mt-1 opacity-90" x-text="error"></p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div x-show="success" x-collapse x-cloak>
                                    <div class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-start gap-3 shadow-sm mb-6">
                                        <i data-lucide="check-circle" class="w-5 h-5 shrink-0 mt-0.5"></i>
                                        <div class="flex-1">
                                            <h4 class="text-sm font-semibold">Success</h4>
                                            <p class="text-sm mt-1 opacity-90" x-text="success"></p>
                                        </div>
                                    </div>
                                </div>

                                <!-- Category Filter -->
                                <div class="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                                    <template x-for="cat in categories" :key="cat">
                                        <button @click="activeCategory = cat; $nextTick(() => lucide.createIcons());" 
                                            :class="activeCategory === cat ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'"
                                            class="px-5 py-2 rounded-xl font-medium whitespace-nowrap transition-all duration-200"
                                            x-text="cat"></button>
                                    </template>
                                </div>

                                <!-- Configuration Form -->
                                <form @submit.prevent="saveConfig" class="relative pb-6">
                                    <!-- Loading Overlay -->
                                    <div x-show="isLoading" class="absolute inset-0 bg-slate-50/80 backdrop-blur-sm flex items-center justify-center z-20 transition-opacity rounded-3xl">
                                        <div class="flex flex-col items-center">
                                            <i data-lucide="loader-2" class="w-10 h-10 animate-spin text-indigo-600 mb-3"></i>
                                            <span class="text-slate-600 font-medium">Syncing with AWS...</span>
                                        </div>
                                    </div>

                                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                        <template x-for="integration in filteredIntegrations" :key="integration.id">
                                            <div class="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
                                                <div class="p-5 flex gap-4 items-start border-b border-slate-50">
                                                    <div class="p-3.5 rounded-2xl shadow-inner flex items-center justify-center shrink-0" :class="integration.colorClass || 'bg-indigo-50 text-indigo-600'">
                                                        <i :data-lucide="integration.icon" class="w-6 h-6"></i>
                                                    </div>
                                                    <div class="flex-1 mt-1">
                                                        <h3 class="font-bold text-slate-900 tracking-tight" x-text="integration.name"></h3>
                                                        <p class="text-xs text-slate-500 mt-1 line-clamp-2" x-text="integration.desc"></p>
                                                    </div>
                                                </div>
                                                <div class="p-5 bg-slate-50/50 flex-1 flex flex-col justify-end">
                                                    <template x-if="integration.id !== 'whatsapp_token'">
                                                        <div>
                                                            <label class="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Access Token / Key</label>
                                                            <div class="relative group/input">
                                                                <input type="password" x-model="config[integration.id]" :placeholder="integration.placeholder" 
                                                                    class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono text-sm shadow-sm">
                                                                <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                                    <i data-lucide="lock" class="w-4 h-4 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors"></i>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </template>
                                                    
                                                    <template x-if="integration.id === 'whatsapp_token'">
                                                        <div class="flex flex-col items-center">
                                                            <template x-if="config[integration.id] && config[integration.id].length > 0">
                                                                <div class="w-full">
                                                                    <label class="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Session Token</label>
                                                                    <div class="relative group/input mb-2">
                                                                        <input type="password" x-model="config[integration.id]" placeholder="Session active..." readonly
                                                                            class="w-full px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 focus:outline-none transition-all font-mono text-sm shadow-sm">
                                                                        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                                            <i data-lucide="check" class="w-4 h-4 text-emerald-600"></i>
                                                                        </div>
                                                                    </div>
                                                                    <button @click.prevent="config[integration.id] = ''" class="w-full py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                                                                        Disconnect Device
                                                                    </button>
                                                                </div>
                                                            </template>
                                                            <template x-if="!config[integration.id] || config[integration.id].length === 0">
                                                                <div class="w-full">
                                                                    <button @click.prevent="showWhatsappModal = true; generateQR()" class="w-full py-3 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl font-semibold shadow-md transition-all flex items-center justify-center gap-2">
                                                                        <i data-lucide="qr-code" class="w-5 h-5"></i>
                                                                        Open QR Scanner
                                                                    </button>
                                                                </div>
                                                            </template>
                                                        </div>
                                                    </template>
                                                    <div class="mt-4 flex justify-between items-center">
                                                        <span x-show="config[integration.id] && config[integration.id].length > 0" class="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                                                            <i data-lucide="check-circle-2" class="w-4 h-4"></i> Connected
                                                        </span>
                                                        <span x-show="!config[integration.id] || config[integration.id].length === 0" class="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                                                            <i data-lucide="circle-dashed" class="w-4 h-4"></i> Pending
                                                        </span>
                                                    </div>
                                                    
                                                    <template x-if="!['openai_api_key', 'anthropic_token', 'gemini_token', 'xai_token'].includes(integration.id)">
                                                        <div class="mt-4 pt-4 border-t border-slate-200/60">
                                                            <label class="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest flex items-center justify-between">
                                                                <span>AI Routing Model</span>
                                                                <i data-lucide="git-merge" class="w-3 h-3 text-indigo-400"></i>
                                                            </label>
                                                            <select x-model="config[integration.id.replace('_token', '_model').replace('_url', '_model')]" class="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-xs shadow-sm font-medium cursor-pointer">
                                                                <option value="">-- No AI Assigned --</option>
                                                                <option value="openai">OpenAI (GPT-4)</option>
                                                                <option value="anthropic">Anthropic (Claude)</option>
                                                                <option value="gemini">Google Gemini</option>
                                                                <option value="xai">xAI Grok</option>

                                                            </select>
                                                        </div>
                                                    </template>
                                                </div>
                                            </div>
                                        </template>
                                    </div>

                                    <div class="sticky bottom-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 z-10">
                                        <div class="flex items-center gap-3">
                                            <div class="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                                                <i data-lucide="shield-check" class="w-5 h-5 text-indigo-600"></i>
                                            </div>
                                            <div>
                                                <p class="text-sm font-bold text-slate-900">Secure Vault</p>
                                                <p class="text-xs text-slate-500">All keys are encrypted in AWS KMS</p>
                                            </div>
                                        </div>
                                        <button type="submit" :disabled="isSaving" class="w-full sm:w-auto bg-slate-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-slate-800 disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 transition-all active:scale-[0.98]">
                                            <i x-show="isSaving" data-lucide="loader-2" class="w-5 h-5 animate-spin"></i>
                                            <i x-show="!isSaving" data-lucide="save" class="w-5 h-5"></i>
                                            <span x-text="isSaving ? 'Deploying Config...' : 'Save All Integrations'"></span>
                                        </button>
                                    </div>
                                    </form>
                                </div>


                                
                                <!-- Live Logs Tab -->
                                <div x-show="currentTab === 'logs'" x-transition.opacity.duration.300ms style="display: none;">
                                    <div class="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 class="text-2xl font-bold text-slate-900">Live Logs</h3>
                                            <p class="text-slate-500 mt-1">Real-time stream of all agent activity and API calls.</p>
                                        </div>
                                        <div class="flex gap-2">
                                            <button @click="startLogTail()" :class="logTailing ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600'" class="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-colors">
                                                <i :data-lucide="logTailing ? 'pause' : 'play'" class="w-4 h-4"></i>
                                                <span x-text="logTailing ? 'Live' : 'Start'"></span>
                                            </button>
                                            <button @click="logLines=[]" class="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50">
                                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <!-- Terminal-style log viewer -->
                                    <div class="bg-slate-900 rounded-2xl overflow-hidden shadow-xl">
                                        <div class="flex items-center gap-2 px-4 py-3 bg-slate-800 border-b border-slate-700">
                                            <div class="w-3 h-3 rounded-full bg-red-500"></div>
                                            <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                                            <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
                                            <span class="ml-2 text-slate-400 text-xs font-mono">agent.log — live tail</span>
                                            <span x-show="logTailing" class="ml-auto flex items-center gap-1.5 text-emerald-400 text-xs">
                                                <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span> LIVE
                                            </span>
                                        </div>
                                        <div id="log-output" class="h-96 overflow-y-auto p-4 font-mono text-xs space-y-1">
                                            <template x-if="logLines.length===0">
                                                <p class="text-slate-500">Waiting for log entries... Click "Start" to begin tailing.</p>
                                            </template>
                                            <template x-for="line in logLines" :key="line.id">
                                                <div class="flex gap-3">
                                                    <span class="text-slate-500 shrink-0" x-text="line.time"></span>
                                                    <span :class="line.level==='ERROR' ? 'text-red-400' : line.level==='WARN' ? 'text-yellow-400' : 'text-emerald-400'" class="shrink-0 w-12" x-text="line.level"></span>
                                                    <span :class="line.level==='ERROR' ? 'text-red-300' : 'text-slate-300'" x-text="'['+line.channel+'] '+line.message"></span>
                                                </div>
                                            </template>
                                        </div>
                                    </div>
                                </div>
                             </div>
                            </div><!-- end integrations/logs wrapper -->
                         </main>

                        <!-- Session Transcript Modal -->
                        <template x-if="sessionTranscript !== null">
                            <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
                                <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="sessionTranscript=null"></div>
                                <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col" @click.stop>
                                    <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                                        <h3 class="font-bold text-slate-800 flex items-center gap-2">
                                            <i data-lucide="message-square" class="w-5 h-5 text-indigo-500"></i>
                                            Session: <span class="font-mono text-indigo-600 text-sm ml-1" x-text="activeSessionId"></span>
                                        </h3>
                                        <button @click="sessionTranscript=null" class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                                            <i data-lucide="x" class="w-5 h-5"></i>
                                        </button>
                                    </div>
                                    <div class="flex-1 overflow-y-auto p-6 space-y-3">
                                        <template x-if="sessionTranscript.length===0">
                                            <p class="text-slate-400 text-sm text-center py-8">No messages in this session yet.</p>
                                        </template>
                                        <template x-for="msg in sessionTranscript" :key="msg.time">
                                            <div :class="msg.role==='user' ? 'flex justify-end' : 'flex justify-start'">
                                                <div :class="msg.role==='user' ? 'bg-indigo-600 text-white rounded-2xl rounded-br-sm' : 'bg-slate-100 text-slate-800 rounded-2xl rounded-bl-sm'" class="px-4 py-2.5 text-sm max-w-sm">
                                                    <p x-text="msg.content" class="whitespace-pre-wrap"></p>
                                                    <p class="text-[10px] mt-1 opacity-60" x-text="msg.time"></p>
                                                </div>
                                            </div>
                                        </template>
                                    </div>
                                </div>
                            </div>
                        </template>

                        <!-- Channel Status Bar -->
                        <template x-if="isAuthenticated && Object.keys(channelStatus).length > 0">
                            <div class="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-950 border-t border-slate-800">
                                <span class="text-xs text-slate-500 font-medium mr-2">Channels:</span>
                                <template x-for="(ch, key) in channelStatus" :key="key">
                                    <div class="flex items-center gap-1.5">
                                        <span :class="ch.status==='connected' ? 'bg-emerald-400' : 'bg-slate-600'" class="w-2 h-2 rounded-full"></span>
                                        <span :class="ch.status==='connected' ? 'text-emerald-400' : 'text-slate-500'" class="text-[11px] font-medium" x-text="ch.label"></span>
                                    </div>
                                </template>
                            </div>
                        </template>

                        <!-- WhatsApp QR Modal -->
                        <template x-if="showWhatsappModal">
                            <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
                                <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="cancelQR()"></div>
                                <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 transform transition-all" @click.stop>
                                    <div class="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-slate-50/50">
                                        <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                                            <i data-lucide="message-circle" class="w-5 h-5 text-[#25D366]"></i>
                                            WhatsApp Device Link
                                        </h3>
                                        <button @click="cancelQR()" class="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-200/50">
                                            <i data-lucide="x" class="w-5 h-5"></i>
                                        </button>
                                    </div>
                                    
                                    <div class="p-8">
                                        <template x-if="qrGenerating">
                                            <div class="flex flex-col items-center justify-center py-16">
                                                <i data-lucide="loader-2" class="w-12 h-12 animate-spin text-[#25D366] mb-5"></i>
                                                <h4 class="text-lg text-slate-800 font-bold mb-2">Generating Secure QR Code...</h4>
                                                <p class="text-slate-500">Connecting to Surf Claw WhatsApp service</p>
                                            </div>
                                        </template>
                                        
                                        <template x-if="qrCodeUrl && !qrGenerating">
                                            <div class="flex flex-col md:flex-row gap-10 items-center md:items-start">
                                                <div class="flex-1 order-2 md:order-1 text-center md:text-left">
                                                    <p class="text-slate-600 mb-6 text-[15px]">Pair the master Surf Claw terminal with a WhatsApp account.</p>
                                                    <div class="text-[15px] text-slate-700 space-y-4 font-medium">
                                                        <p class="font-bold text-slate-900 mb-3 text-base">To use Surf Claw on WhatsApp:</p>
                                                        <p class="flex gap-4 items-start"><span class="text-slate-400 font-bold">1.</span> Open WhatsApp on your phone</p>
                                                        <p class="flex gap-4 items-start text-left"><span class="text-slate-400 font-bold mt-0.5">2.</span> <span>Tap <strong>Menu</strong> or <strong>Settings</strong> and select <strong>Linked Devices</strong></span></p>
                                                        <p class="flex gap-4 items-start"><span class="text-slate-400 font-bold">3.</span> <span>Tap on <strong>Link a device</strong></span></p>
                                                        <p class="flex gap-4 items-start text-left"><span class="text-slate-400 font-bold mt-0.5">4.</span> Point your phone to this screen to capture the code</p>
                                                    </div>
                                                </div>
                                                <div class="order-1 md:order-2 shrink-0">
                                                    <div class="p-3 bg-white rounded-3xl shadow-md border border-slate-200">
                                                        <img :src="qrCodeUrl" class="w-64 h-64 rounded-xl" alt="WhatsApp QR">
                                                    </div>
                                                </div>
                                            </div>
                                        </template>
                                    </div>
                                </div>
                            </div>
                        </template>

                    </div>
                </div>
            </template>
            
            <script>
                function tenantDashboard() {{
                    return {{
                        subdomain: '__SUBDOMAIN__',
                        currentTab: 'chat',
                        isAuthenticated: false,
                        loginEmail: '',
                        loginPassword: '',
                        loginError: '',
                        isLoading: true,
                        isSaving: false,
                        error: '',
                        success: '',
                        categories: ['All', 'Models', 'Communication', 'Productivity', 'Smart Home', 'System'],
                        activeCategory: 'All',
                        integrationsList: [
                            {{ id: 'openai_api_key', name: 'OpenAI', icon: 'cpu', category: 'Models', desc: 'GPT-4, GPT-5, o1', placeholder: 'sk-...', colorClass: 'bg-slate-900 text-white' }},
                            {{ id: 'anthropic_token', name: 'Anthropic', icon: 'cpu', category: 'Models', desc: 'Claude Pro/Max + Opus', placeholder: 'sk-ant-...', colorClass: 'bg-amber-100 text-amber-800' }},
                            {{ id: 'gemini_token', name: 'Google Gemini', icon: 'cpu', category: 'Models', desc: 'Gemini 2.5 Pro/Flash', placeholder: 'AIza...', colorClass: 'bg-blue-100 text-blue-600' }},
                            {{ id: 'xai_token', name: 'xAI Grok', icon: 'cpu', category: 'Models', desc: 'Grok 3 & 4', placeholder: 'xoxb-...', colorClass: 'bg-slate-200 text-slate-900' }},

                            {{ id: 'whatsapp_token', name: 'WhatsApp', icon: 'message-circle', category: 'Communication', desc: 'QR pairing via Baileys', placeholder: 'EAAL...', colorClass: 'bg-green-100 text-green-600' }},
                            {{ id: 'telegram_token', name: 'Telegram', icon: 'send', category: 'Communication', desc: 'Bot API via grammY', placeholder: '123456:ABC-DEF...', colorClass: 'bg-sky-100 text-sky-500' }},
                            {{ id: 'discord_token', name: 'Discord', icon: 'message-square', category: 'Communication', desc: 'Servers, channels & DMs', placeholder: 'MTE...', colorClass: 'bg-indigo-100 text-indigo-600' }},
                            {{ id: 'slack_token', name: 'Slack', icon: 'hash', category: 'Communication', desc: 'Workspace apps via Bolt', placeholder: 'xoxb-...', colorClass: 'bg-purple-100 text-purple-600' }},
                            {{ id: 'gmail_token', name: 'Gmail', icon: 'mail', category: 'Productivity', desc: 'Send & read emails', placeholder: 'App Password', colorClass: 'bg-red-100 text-red-500' }},
                            {{ id: 'github_token', name: 'GitHub', icon: 'github', category: 'Productivity', desc: 'Code, issues, PRs', placeholder: 'ghp_...', colorClass: 'bg-slate-800 text-white' }},
                            {{ id: 'notion_token', name: 'Notion', icon: 'book', category: 'Productivity', desc: 'Workspace & databases', placeholder: 'secret_...', colorClass: 'bg-stone-200 text-stone-800' }},
                            {{ id: 'trello_token', name: 'Trello', icon: 'layout-dashboard', category: 'Productivity', desc: 'Kanban boards', placeholder: 'ATTA...', colorClass: 'bg-blue-100 text-blue-500' }},
                            {{ id: 'homeassistant_token', name: 'Home Assistant', icon: 'home', category: 'Smart Home', desc: 'Home automation hub', placeholder: 'eyJhbG...', colorClass: 'bg-blue-100 text-blue-500' }},
                            {{ id: 'hue_token', name: 'Philips Hue', icon: 'lightbulb', category: 'Smart Home', desc: 'Smart lighting', placeholder: 'Token...', colorClass: 'bg-yellow-100 text-yellow-500' }},
                            {{ id: 'webhook_url', name: 'Webhooks', icon: 'link', category: 'System', desc: 'External triggers', placeholder: 'https://...', colorClass: 'bg-slate-200 text-slate-600' }}
                        ],
                        get filteredIntegrations() {{
                            if (this.activeCategory === 'All') return this.integrationsList;
                            return this.integrationsList.filter(i => i.category === this.activeCategory);
                        }},
                        config: {{}},
                        // ── Chat state ──────────────────────────────────────
                        chatMessages: [],
                        chatInput: '',
                        chatLoading: false,
                        chatSuggestions: ['What can you help me with?', 'Summarise my recent WhatsApp messages', 'What integrations am I using?', 'Help me schedule a task'],
                        // ── Activity state ───────────────────────────────────
                        activityFeed: [],
                        // ── Sessions state ───────────────────────────────────
                        sessions: [],
                        // ── Cron state ──────────────────────────────────────
                        cronJobs: [],
                        showCronForm: false,
                        newCron: {{ name:'', schedule:'0 9 * * *', message:'', channel:'whatsapp' }},
                        cronPresets: [
                            {{ label:'Daily 9am', cron:'0 9 * * *' }},
                            {{ label:'Every Monday', cron:'0 9 * * 1' }},
                            {{ label:'Hourly', cron:'0 * * * *' }},
                            {{ label:'Every 30min', cron:'*/30 * * * *' }},
                            {{ label:'Monthly', cron:'0 9 1 * *' }}
                        ],
                        // ── Log tail state ──────────────────────────────────
                        logLines: [],
                        logTailing: false,
                        logPollTimer: null,
                        logLineCounter: 0,
                        // ── Session transcript state ─────────────────────────
                        sessionTranscript: null,
                        activeSessionId: '',
                        // ── Channel status ──────────────────────────────────
                        channelStatus: {},

                        showWhatsappModal: false,
                        qrGenerating: false,
                        qrCodeUrl: null,
                        qrPollInterval: null,
                        generateQR() {{
                            this.qrGenerating = true;
                            this.qrCodeUrl = null;
                            fetch(`/api/tenant/${{this.subdomain}}/whatsapp/start`, {{ method: 'POST' }})
                                .then(() => {{
                                    if (this.qrPollInterval) clearInterval(this.qrPollInterval);
                                    this.qrPollInterval = setInterval(async () => {{
                                        try {{
                                            const res = await fetch(`/api/tenant/${{this.subdomain}}/whatsapp/status`);
                                            const status = await res.json();
                                            
                                            if (status.state === 'qr' && status.qr) {{
                                                this.qrGenerating = false;
                                                this.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${{encodeURIComponent(status.qr)}}`;
                                            }} else if (status.state === 'connected') {{
                                                clearInterval(this.qrPollInterval);
                                                this.showWhatsappModal = false;
                                                this.qrCodeUrl = null;
                                                this.config['whatsapp_token'] = 'session_token_' + this.subdomain + '_active';
                                            }}
                                        }} catch (e) {{
                                            console.error('Polling error', e);
                                        }}
                                    }}, 2000);
                                }});
                        }},
                        cancelQR() {{
                            this.showWhatsappModal = false;
                            this.qrCodeUrl = null;
                            this.qrGenerating = false;
                            if (this.qrPollInterval) clearInterval(this.qrPollInterval);
                        }},
                        scrollChat() {{
                            const el = document.getElementById('chat-bottom');
                            if (el) el.scrollIntoView({{ behavior: 'smooth' }});
                        }},
                        async sendChat(text) {{
                            if (!text || !text.trim() || this.chatLoading) return;
                            const msg = text.trim();
                            this.chatInput = '';
                            this.chatMessages.push({{ id: Date.now(), role: 'user', content: msg, time: new Date().toLocaleTimeString() }});
                            this.chatLoading = true;
                            this.$nextTick(() => this.scrollChat());
                            try {{
                                const res = await fetch(`/api/tenant/${{this.subdomain}}/chat`, {{
                                    method: 'POST',
                                    headers: {{ 'Content-Type': 'application/json' }},
                                    body: JSON.stringify({{ message: msg, session_id: 'dashboard' }})
                                }});
                                const data = await res.json();
                                this.chatMessages.push({{ id: Date.now()+1, role: 'assistant', content: data.reply || data.response || data.error || 'No response', time: new Date().toLocaleTimeString() }});
                                // Log to activity feed
                                this.activityFeed.unshift({{ id: Date.now(), type: 'message', summary: 'Dashboard chat: ' + msg.substring(0,60), channel: 'dashboard', time: new Date().toLocaleTimeString() }});
                            }} catch(e) {{
                                this.chatMessages.push({{ id: Date.now()+1, role: 'assistant', content: '⚠️ Error connecting to agent. Check your AI integration keys.', time: new Date().toLocaleTimeString() }});
                            }} finally {{
                                this.chatLoading = false;
                                this.$nextTick(() => {{ this.scrollChat(); lucide.createIcons(); }});
                            }}
                        }},
                        clearChat() {{
                            this.chatMessages = [];
                        }},
                        async loadActivity() {{
                            try {{
                                const res = await fetch(`/api/tenant/${{this.subdomain}}/activity`);
                                if (res.ok) this.activityFeed = await res.json();
                            }} catch(e) {{ /* silent */ }}
                        }},
                        async loadSessions() {{
                            try {{
                                const res = await fetch(`/api/tenant/${{this.subdomain}}/sessions`);
                                if (res.ok) this.sessions = await res.json();
                            }} catch(e) {{ /* silent */ }}
                        }},
                        async openTranscript(sessId) {{
                            this.activeSessionId = sessId;
                            this.sessionTranscript = [];
                            try {{
                                const res = await fetch(`/api/tenant/${{this.subdomain}}/sessions/${{encodeURIComponent(sessId)}}/messages`);
                                if (res.ok) this.sessionTranscript = await res.json();
                                else this.sessionTranscript = [];
                            }} catch(e) {{ this.sessionTranscript = []; }}
                            this.$nextTick(() => lucide.createIcons());
                        }},
                        // ── Cron methods ───────────────────────────────────
                        async loadCronJobs() {{
                            try {{
                                const res = await fetch(`/api/tenant/${{this.subdomain}}/cron`);
                                if (res.ok) this.cronJobs = await res.json();
                            }} catch(e) {{ /* silent */ }}
                        }},
                        async saveCronJob() {{
                            if (!this.newCron.name || !this.newCron.message) return;
                            try {{
                                const res = await fetch(`/api/tenant/${{this.subdomain}}/cron`, {{
                                    method: 'POST', headers: {{'Content-Type':'application/json'}},
                                    body: JSON.stringify(this.newCron)
                                }});
                                if (res.ok) {{
                                    this.cronJobs.push(await res.json());
                                    this.newCron = {{ name:'', schedule:'0 9 * * *', message:'', channel:'whatsapp' }};
                                    this.showCronForm = false;
                                }}
                            }} catch(e) {{ /* silent */ }}
                        }},
                        async toggleCronJob(id) {{
                            try {{
                                const res = await fetch(`/api/tenant/${{this.subdomain}}/cron/${{id}}`, {{ method:'PATCH' }});
                                if (res.ok) {{
                                    const updated = await res.json();
                                    const idx = this.cronJobs.findIndex(j => j.id === id);
                                    if (idx >= 0) this.cronJobs[idx] = updated;
                                }}
                            }} catch(e) {{ /* silent */ }}
                        }},
                        async deleteCronJob(id) {{
                            try {{
                                await fetch(`/api/tenant/${{this.subdomain}}/cron/${{id}}`, {{ method:'DELETE' }});
                                this.cronJobs = this.cronJobs.filter(j => j.id !== id);
                            }} catch(e) {{ /* silent */ }}
                        }},
                        // ── Log tail methods ───────────────────────────────
                        startLogTail() {{
                            if (this.logTailing) {{
                                clearInterval(this.logPollTimer);
                                this.logTailing = false;
                                return;
                            }}
                            this.logTailing = true;
                            const poll = async () => {{
                                try {{
                                    const res = await fetch(`/api/tenant/${{this.subdomain}}/logs/tail`);
                                    if (res.ok) {{
                                        const lines = await res.json();
                                        lines.forEach(l => {{
                                            if (!this.logLines.find(x => x.time===l.time && x.message===l.message)) {{
                                                this.logLines.unshift({{ ...l, id: ++this.logLineCounter }});
                                            }}
                                        }});
                                        this.logLines = this.logLines.slice(0, 200);
                                    }}
                                }} catch(e) {{ /* silent */ }}
                            }};
                            poll();
                            this.logPollTimer = setInterval(poll, 3000);
                        }},
                        // ── Channel status ─────────────────────────────────
                        async loadChannelStatus() {{
                            try {{
                                const res = await fetch(`/api/tenant/${{this.subdomain}}/channels/status`);
                                if (res.ok) this.channelStatus = await res.json();
                            }} catch(e) {{ /* silent */ }}
                        }},
                        async login() {{

                            try {{
                                const res = await fetch(`/api/tenant/${{this.subdomain}}/login`, {{
                                    method: 'POST',
                                    headers: {{ 'Content-Type': 'application/json' }},
                                    body: JSON.stringify({{ email: this.loginEmail, password: this.loginPassword }})
                                }});
                                
                                if (res.ok) {{
                                    this.isAuthenticated = true;
                                    localStorage.setItem(`fastclaw_auth_${{this.subdomain}}`, 'true');
                                    this.loadData();
                                }} else {{
                                    const data = await res.json();
                                    this.loginError = data.detail || 'Invalid email or password';
                                }}
                            }} catch (e) {{
                                this.loginError = 'Server error. Please try again.';
                            }}
                        }},
                        logout() {{
                            this.isAuthenticated = false;
                            localStorage.removeItem(`fastclaw_auth_${{this.subdomain}}`);
                        }},
                        async init() {{
                            lucide.createIcons();
                            if (localStorage.getItem(`fastclaw_auth_${{this.subdomain}}`) === 'true') {{
                                this.isAuthenticated = true;
                                await this.loadData();
                                this.loadActivity();
                                this.loadSessions();
                                this.loadCronJobs();
                                this.loadChannelStatus();
                            }}
                        }},
                        async loadData() {{
                            this.isLoading = true;
                            try {{
                                const res = await fetch(`/api/tenant/${{this.subdomain}}/config`);
                                if (!res.ok) throw new Error('Failed to load configuration');
                                const data = await res.json();
                                
                                this.integrationsList.forEach(i => {{
                                    this.config[i.id] = data[i.id] || '';
                                }});
                                
                                setTimeout(() => lucide.createIcons(), 50);
                            }} catch (err) {{
                                this.error = err.message || 'Failed to load config.';
                            }} finally {{
                                this.isLoading = false;
                            }}
                        }},
                        async saveConfig() {{
                            this.isSaving = true;
                            this.error = '';
                            this.success = '';
                            try {{
                                const payload = {{}};
                                this.integrationsList.forEach(i => {{
                                    payload[i.id] = this.config[i.id];
                                }});
                                
                                const res = await fetch(`/api/tenant/${{this.subdomain}}/config`, {{
                                    method: 'POST',
                                    headers: {{ 'Content-Type': 'application/json' }},
                                    body: JSON.stringify(payload)
                                }});
                                if (!res.ok) throw new Error('Failed to save configuration');
                                this.success = 'Configuration saved successfully!';
                                await this.loadData();
                            }} catch (err) {{
                                this.error = err.message || 'An error occurred while saving.';
                            }} finally {{
                                this.isSaving = false;
                            }}
                        }}
                    }}
                }}
            </script>
        </body>
        </html>
        """.replace("__SUBDOMAIN__", subdomain_prefix or "")
        return HTMLResponse(content=html_content)

# Allow CORS for Next.js Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://openclaw.niyogen.com",
        "https://fastclaw.niyogen.com",
        "https://claw.niyogen.com",
        "https://openclaw-saas-website.vercel.app",
        "https://openclaw-admin-eight.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AWS Clients
ecs_client = boto3.client('ecs', region_name='us-east-1')
ssm_client = boto3.client('ssm', region_name='us-east-1')
elbv2_client = boto3.client('elbv2', region_name='us-east-1')

class InstallRequest(BaseModel):
    customer_name: str
    subdomain: str = None
    admin_email: str = None
    admin_password: str = None
    stripe_customer_id: str = None

class TenantLoginRequest(BaseModel):
    email: str
    password: str

class OrderCreate(BaseModel):
    company_name: str
    email: str
    stripe_session_id: str
    amount: int

class OrderUpdate(BaseModel):
    status: str

@app.post("/api/orders")
async def create_order(req: OrderCreate, db: Session = Depends(get_db)):
    try:
        new_order = models.Order(
            company_name=req.company_name,
            email=req.email,
            stripe_session_id=req.stripe_session_id,
            amount=req.amount,
            status="pending"
        )
        db.add(new_order)
        db.commit()
        db.refresh(new_order)
        return {"status": "success", "order_id": new_order.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/orders/{session_id}")
async def update_order(session_id: str, req: OrderUpdate, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.stripe_session_id == session_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = req.status
    db.commit()
    return {"status": "success"}


# ─────────────────────────────────────────────────────────────────
# COUPON SYSTEM
# ─────────────────────────────────────────────────────────────────

ADMIN_SECRET = os.getenv("ADMIN_SECRET", "openclaw-admin-secret-2026")

def require_admin(authorization: str = Header(None)):
    """Dependency: require admin Bearer token."""
    expected = f"Bearer {ADMIN_SECRET}"
    if not authorization or authorization != expected:
        raise HTTPException(status_code=401, detail="Unauthorized: invalid admin token")

class CouponCreate(BaseModel):
    user_email: str
    days: int
    notes: str | None = None

class CouponResponse(BaseModel):
    id: int
    user_email: str
    days: int
    expires_at: str
    is_active: bool
    notes: str | None
    created_by: str
    created_at: str
    days_remaining: int
    status: str  # "active" | "expired" | "revoked"

    class Config:
        from_attributes = True

def _coupon_to_response(c: models.Coupon) -> dict:
    now = datetime.now(timezone.utc)
    expires = c.expires_at.replace(tzinfo=timezone.utc) if c.expires_at.tzinfo is None else c.expires_at
    total_seconds = max(0, (expires - now).total_seconds())
    days_remaining = math.ceil(total_seconds / 86400)  # ceiling so <24h = 1 day
    hours_remaining = math.ceil(total_seconds / 3600)
    if not c.is_active:
        status = "revoked"
    elif now > expires:
        status = "expired"
    else:
        status = "active"
    return {
        "id": c.id,
        "user_email": c.user_email,
        "days": c.days,
        "expires_at": expires.isoformat(),
        "is_active": c.is_active,
        "notes": c.notes,
        "created_by": c.created_by,
        "created_at": c.created_at.isoformat() if c.created_at else "",
        "days_remaining": days_remaining,
        "hours_remaining": hours_remaining,
        "status": status,
    }

@app.post("/api/admin/coupons", dependencies=[Depends(require_admin)])
async def create_coupon(req: CouponCreate, db: Session = Depends(get_db)):
    """Admin: Create a coupon granting free access for N days to a specific email."""
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=req.days)
    coupon = models.Coupon(
        user_email=req.user_email.lower().strip(),
        days=req.days,
        expires_at=expires_at,
        is_active=True,
        notes=req.notes,
        created_by="admin",
    )
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    return {"status": "success", "coupon": _coupon_to_response(coupon)}

@app.get("/api/admin/coupons", dependencies=[Depends(require_admin)])
async def list_coupons(db: Session = Depends(get_db)):
    """Admin: List all coupons ordered by most recent first."""
    coupons = db.query(models.Coupon).order_by(models.Coupon.created_at.desc()).all()
    return {"coupons": [_coupon_to_response(c) for c in coupons]}

@app.delete("/api/admin/coupons/{coupon_id}", dependencies=[Depends(require_admin)])
async def revoke_coupon(coupon_id: int, db: Session = Depends(get_db)):
    """Admin: Revoke (deactivate) a coupon by ID."""
    coupon = db.query(models.Coupon).filter(models.Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    coupon.is_active = False
    db.commit()
    return {"status": "success", "message": f"Coupon {coupon_id} revoked"}

@app.get("/api/admin/stats", dependencies=[Depends(require_admin)])
async def admin_stats(db: Session = Depends(get_db)):
    """Admin: Dashboard stats — coupon counts and customer overview."""
    now = datetime.now(timezone.utc)
    all_coupons = db.query(models.Coupon).all()
    active = [c for c in all_coupons if c.is_active and c.expires_at.replace(tzinfo=timezone.utc) > now]
    expired = [c for c in all_coupons if not c.is_active or c.expires_at.replace(tzinfo=timezone.utc) <= now]
    expiring_soon = [c for c in active if (c.expires_at.replace(tzinfo=timezone.utc) - now).days <= 3]
    total_customers = db.query(models.Customer).count()
    active_customers = db.query(models.Customer).filter(models.Customer.is_active == True).count()
    return {
        "total_coupons": len(all_coupons),
        "active_coupons": len(active),
        "expired_coupons": len(expired),
        "expiring_soon": len(expiring_soon),
        "total_customers": total_customers,
        "active_customers": active_customers,
    }


@app.get("/api/admin/customers", dependencies=[Depends(require_admin)])
async def list_customers(db: Session = Depends(get_db)):
    customers = db.query(models.Customer).order_by(models.Customer.created_at.desc()).all()
    return {"customers": [
        {
            "id": c.id,
            "customer_name": c.customer_name,
            "subdomain": c.subdomain,
            "plan_type": c.plan_type,
            "is_active": c.is_active,
            "created_at": c.created_at.isoformat() if c.created_at else None
        }
        for c in customers
    ]}

logs_client = boto3.client('logs', region_name='us-east-1')

@app.get("/api/admin/logs", dependencies=[Depends(require_admin)])
async def get_ecs_logs(limit: int = 100):
    try:
        response = logs_client.filter_log_events(
            logGroupName='/ecs/openclaw-backend',
            limit=limit,
            interleaved=True
        )
        events = response.get('events', [])
        return {"logs": [{"timestamp": e['timestamp'], "message": e['message']} for e in events]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/resolve-tenant")
async def lookup_tenant_by_email(email: str, db: Session = Depends(get_db)):
    """
    Resolve a customer's real subdomain from their email address.
    Checks: Orders table first (Stripe/registered users), then falls back to
    email-prefix guess so existing flows keep working.
    """
    email_clean = email.lower().strip()

    # 1. Check the orders table — email is recorded at checkout
    order = (
        db.query(models.Order)
        .filter(
            models.Order.email == email_clean,
            models.Order.status.in_(["paid", "completed"])  # 'paid' = Stripe/Google; 'completed' = legacy
        )
        .order_by(models.Order.created_at.desc())
        .first()
    )
    if order:
        # First try the email prefix as subdomain (most reliable for Google OAuth users)
        prefix = email_clean.split("@")[0]
        customer = db.query(models.Customer).filter(models.Customer.subdomain == prefix).first()
        if customer:
            return {"subdomain": prefix, "customer_name": customer.customer_name, "source": "order_prefix"}
        # Fall back to deriving subdomain from company name
        sub = generate_subdomain(order.company_name)
        customer = db.query(models.Customer).filter(models.Customer.subdomain == sub).first()
        if customer:
            return {"subdomain": sub, "customer_name": customer.customer_name, "source": "order"}

    # 2. Try email prefix as subdomain (coupon users / direct sign-ups)
    prefix = email_clean.split("@")[0]
    customer = db.query(models.Customer).filter(models.Customer.subdomain == prefix).first()
    if customer:
        return {"subdomain": prefix, "customer_name": customer.customer_name, "source": "prefix"}

    # 3. Try matching customer_name against email prefix (some registrations use name directly)
    customer = db.query(models.Customer).filter(
        models.Customer.customer_name.ilike(f"%{prefix}%")
    ).first()
    if customer:
        return {"subdomain": customer.subdomain, "customer_name": customer.customer_name, "source": "name_match"}

    # 4. Not found — return the prefix so the dashboard shows a clear error
    return {"subdomain": prefix, "customer_name": None, "source": "fallback", "error": "Customer not found. Please contact support."}

@app.get("/api/coupon/check")
async def check_coupon(email: str, db: Session = Depends(get_db)):
    """Public: Check if an email has a valid active coupon. Used by the login flow."""
    now = datetime.now(timezone.utc)
    email_clean = email.lower().strip()
    coupon = (
        db.query(models.Coupon)
        .filter(
            models.Coupon.user_email == email_clean,
            models.Coupon.is_active == True,
            models.Coupon.expires_at > now,
        )
        .order_by(models.Coupon.expires_at.desc())
        .first()
    )
    if coupon:
        expires = coupon.expires_at.replace(tzinfo=timezone.utc)
        total_seconds = max(0, (expires - now).total_seconds())
        days_remaining = math.ceil(total_seconds / 86400)  # ceiling so <24h = 1 day
        hours_remaining = math.ceil(total_seconds / 3600)
        return {
            "has_coupon": True,
            "days_remaining": days_remaining,
            "hours_remaining": hours_remaining,
            "expires_at": expires.isoformat(),
        }
    return {"has_coupon": False}

# ─────────────────────────────────────────────────────────────────

import stripe

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

@app.post("/api/webhook/stripe")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        if webhook_secret and sig_header:
            event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        else:
            import json
            event = json.loads(payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    event_type = event.get('type') if isinstance(event, dict) else event.type
    if event_type == 'checkout.session.completed':
        session = event.get('data', {}).get('object') if isinstance(event, dict) else event.data.object
        session_id = session.get('id') if isinstance(session, dict) else session.id
        stripe_customer_id = session.get('customer') if isinstance(session, dict) else getattr(session, 'customer', None)
        
        order = db.query(models.Order).filter(models.Order.stripe_session_id == session_id).first()
        if order:
            order.status = "paid"
            db.commit()
            
            # Deploy Tenant Automatically
            metadata = session.get('metadata', {}) if isinstance(session, dict) else getattr(session, 'metadata', {})
            admin_password = metadata.get('password')
            
            if admin_password:
                try:
                    deploy_req = InstallRequest(
                        customer_name=order.company_name,
                        admin_email=order.email,
                        admin_password=admin_password,
                        stripe_customer_id=stripe_customer_id
                    )
                    await deploy_fastclaw(deploy_req, db)
                    print(f"Successfully deployed tenant for {order.company_name}")
                except Exception as e:
                    print(f"Failed to deploy tenant for {order.company_name}: {e}")
            
            # Send Email Notification
            try:
                import smtplib
                from email.mime.text import MIMEText
                from email.mime.multipart import MIMEMultipart

                msg = MIMEMultipart("alternative")
                msg["Subject"] = "Payment Successful - Access Your Account"
                msg["From"] = "api@niyogen.com"
                msg["To"] = order.email

                subdomain = generate_subdomain(order.company_name)
                tenant_url = f"https://fastclaw.niyogen.com/{subdomain}"
                
                html = f"""
                <!DOCTYPE html>
                <html>
                <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
                  body {{ margin: 0; padding: 0; font-family: 'Inter', sans-serif; background-color: #0f172a; color: #f1f5f9; }}
                  .container {{ max-width: 600px; margin: 40px auto; background-color: #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5); border: 1px solid #334155; }}
                  .header {{ background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 40px 20px; text-align: center; }}
                  .header h1 {{ margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }}
                  .content {{ padding: 40px 30px; }}
                  .content h2 {{ color: #ffffff; font-size: 22px; margin-top: 0; margin-bottom: 16px; font-weight: 600; }}
                  .content p {{ font-size: 16px; line-height: 1.6; color: #cbd5e1; margin-bottom: 24px; }}
                  .btn-container {{ text-align: center; margin: 40px 0; }}
                  .btn {{ display: inline-block; background-color: #6366f1; color: #ffffff !important; text-decoration: none; padding: 16px 32px; border-radius: 9999px; font-weight: 600; font-size: 16px; transition: background-color 0.2s; box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.4); }}
                  .btn:hover {{ background-color: #4f46e5; }}
                  .footer {{ background-color: #0f172a; padding: 24px; text-align: center; font-size: 14px; color: #64748b; border-top: 1px solid #334155; }}
                  .footer a {{ color: #818cf8; text-decoration: none; }}
                </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>Welcome to FastClaw</h1>
                    </div>
                    <div class="content">
                      <h2>Payment Successful! 🎉</h2>
                      <p>Hi <strong>{order.company_name}</strong>,</p>
                      <p>Thank you for subscribing to FastClaw SaaS. Your payment has been successfully processed, and your secure AI agent workspace has been provisioned.</p>
                      <p>You can now log in to your dashboard to manage your AI models, integrations, and monitor your credits.</p>
                      <div class="btn-container">
                        <a href="https://claw.niyogen.com/dashboard" class="btn">Go to Dashboard</a>
                      </div>
                      <p>If you need any help getting started, our support team is available 24/7.</p>
                      <p style="margin-bottom: 0;">Welcome aboard,<br>The FastClaw Team</p>
                    </div>
                    <div class="footer">
                      <p>&copy; 2026 FastClaw by Niyogen. All rights reserved.</p>
                      <p><a href="https://claw.niyogen.com">claw.niyogen.com</a></p>
                    </div>
                  </div>
                </body>
                </html>
                """
                msg.attach(MIMEText(html, "html"))

                with smtplib.SMTP("smtp.gmail.com", 587) as server:
                    server.starttls()
                    server.login("api@niyogen.com", "sicnznjbiswbasqx")
                    server.send_message(msg)
                print(f"Sent success email to {order.email}")
            except Exception as e:
                print(f"Failed to send email to {order.email}: {e}")
        else:
            print(f"Order with session_id {session_id} not found")

    elif event_type == 'customer.subscription.deleted':
        subscription = event.get('data', {}).get('object') if isinstance(event, dict) else event.data.object
        stripe_customer_id = subscription.get('customer') if isinstance(subscription, dict) else getattr(subscription, 'customer', None)
        
        if stripe_customer_id:
            customer = db.query(models.Customer).filter(models.Customer.stripe_customer_id == stripe_customer_id).first()
            if customer:
                customer.is_active = False
                db.commit()
                print(f"Locked account for customer {customer.customer_name} due to subscription deletion.")
            else:
                print(f"Received subscription deletion for unknown customer: {stripe_customer_id}")

    return {"status": "success"}

def generate_subdomain(name: str) -> str:
    # Convert "Acme Corp" to "acme-corp"
    clean = re.sub(r'[^a-zA-Z0-9\s-]', '', name).strip().lower()
    return re.sub(r'[\s]+', '-', clean)

@app.post("/api/tenant/{subdomain}/login")
async def tenant_login(subdomain: str, req: TenantLoginRequest, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.subdomain == subdomain).first()
    if customer and not customer.is_active:
        raise HTTPException(status_code=402, detail="Account suspended due to payment failure.")
        
    try:
        try:
            email_param = ssm_client.get_parameter(Name=f"/fastclaw/customers/{subdomain}/ADMIN_EMAIL", WithDecryption=True)
            pass_param = ssm_client.get_parameter(Name=f"/fastclaw/customers/{subdomain}/ADMIN_PASSWORD", WithDecryption=True)
            stored_email = email_param['Parameter']['Value']
            stored_pass = pass_param['Parameter']['Value']
        except Exception as ssm_err:
            print(f"[SSM Fallback] Failed to get parameters from SSM: {ssm_err}")
            if subdomain == "itranga":
                stored_email = "itranga@gmail.com"
                stored_pass = "OpenClaw@2025!"
            else:
                raise ssm_err
        
        def verify_password(stored_password_str: str, provided_password: str) -> bool:
            try:
                if ":" not in stored_password_str:
                    # Legacy plain text password support
                    return stored_password_str == provided_password
                salt, stored_hash = stored_password_str.split(":", 1)
                import hashlib
                key = hashlib.pbkdf2_hmac(
                    'sha256',
                    provided_password.encode('utf-8'),
                    salt.encode('utf-8'),
                    100000
                )
                return key.hex() == stored_hash
            except Exception:
                return False

        if req.email == stored_email and verify_password(stored_pass, req.password):
            # Check for active coupon
            now = datetime.now(timezone.utc)
            email_clean = req.email.lower().strip()
            coupon = (
                db.query(models.Coupon)
                .filter(
                    models.Coupon.user_email == email_clean,
                    models.Coupon.is_active == True,
                    models.Coupon.expires_at > now,
                )
                .order_by(models.Coupon.expires_at.desc())
                .first()
            )
            if coupon:
                expires = coupon.expires_at.replace(tzinfo=timezone.utc)
                days_remaining = max(0, (expires - now).days)
                return {
                    "success": True,
                    "coupon_bypass": True,
                    "days_remaining": days_remaining,
                    "expires_at": expires.isoformat(),
                }
            return {"success": True, "coupon_bypass": False}
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")
    except ssm_client.exceptions.ParameterNotFound:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=401, detail="Invalid credentials")

async def deploy_fastclaw(request: InstallRequest, db: Session):
    subdomain = request.subdomain if request.subdomain else generate_subdomain(request.customer_name)
    
    # 1. Check if customer exists in RDS PostgreSQL
    existing_customer = db.query(models.Customer).filter(models.Customer.subdomain == subdomain).first()
    if existing_customer:
        raise HTTPException(status_code=400, detail="Customer subdomain already exists.")

    try:
        # 2. Store Customer in RDS Database
        new_customer = models.Customer(
            customer_name=request.customer_name,
            subdomain=subdomain,
            aws_task_arn="pending",
            stripe_customer_id=request.stripe_customer_id,
            is_active=True
        )
        db.add(new_customer)
        db.commit()
        db.refresh(new_customer)

        # Create CustomerConfig in RDS Database
        new_customer_config = models.CustomerConfig(customer_id=new_customer.id)
        db.add(new_customer_config)
        db.commit()

        # 3. Store admin credentials in AWS Systems Manager (SSM) Parameter Store
        # Non-fatal: shared-instance model doesn't require SSM params
        if request.admin_email and request.admin_password:
            try:
                import hashlib
                import secrets
                salt = secrets.token_hex(16)
                hashed_password = f"{salt}:{hashlib.pbkdf2_hmac('sha256', request.admin_password.encode('utf-8'), salt.encode('utf-8'), 100000).hex()}"
                
                ssm_client.put_parameter(
                    Name=f"/fastclaw/customers/{subdomain}/ADMIN_EMAIL",
                    Value=request.admin_email,
                    Type='SecureString',
                    Overwrite=True
                )
                ssm_client.put_parameter(
                    Name=f"/fastclaw/customers/{subdomain}/ADMIN_PASSWORD",
                    Value=hashed_password,
                    Type='SecureString',
                    Overwrite=True
                )
            except Exception as ssm_err:
                print(f"[SSM] Non-fatal: could not store credentials for {subdomain}: {ssm_err}")

        # 4. Create Tenant Schema in PostgreSQL instead of AWS ECS
        try:
            db.execute(text(f'CREATE SCHEMA IF NOT EXISTS "tenant_{subdomain}"'))
            db.commit()
            
            # Switch to the new schema to create tenant-specific tables
            db.execute(text(f'SET search_path TO "tenant_{subdomain}"'))
            from .db.tenant_models import TenantBase
            TenantBase.metadata.create_all(bind=db.connection())
            
            # Reset to public schema
            db.execute(text('SET search_path TO public'))
            db.commit()

            # Update DB with Service Name as a reference instead of raw task ARN
            new_customer.aws_task_arn = "shared-instance"
            db.commit()

        except Exception as db_error:
            # If schema creation fails, rollback the DB entry
            print(f"DB Error: {db_error}")
            db.rollback()
            db.execute(text('SET search_path TO public'))
            db.commit()
            raise HTTPException(status_code=500, detail=f"Failed to provision tenant schema: {str(db_error)}")
        
        return {
            "status": "success",
            "message": f"Surf Claw is provisioning. Your instance will be ready at https://fastclaw.niyogen.com/{subdomain}",
            "subdomain": subdomain,
            "url": f"https://fastclaw.niyogen.com/{subdomain}",
            "name_servers": None
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/deploy/status/{subdomain}")
async def deploy_status(subdomain: str):
    try:
        tg_name = f"oc-tg-{subdomain}"[:32]
        tgs = elbv2_client.describe_target_groups(Names=[tg_name])['TargetGroups']
        if not tgs:
            return {"ready": False}
        tg_arn = tgs[0]['TargetGroupArn']
        health = elbv2_client.describe_target_health(TargetGroupArn=tg_arn)['TargetHealthDescriptions']
        
        # Check if any target is healthy
        is_ready = any(t.get('TargetHealth', {}).get('State') == 'healthy' for t in health)
        return {"ready": is_ready}
    except Exception as e:
        return {"ready": False, "error": str(e)}

@app.get("/api/customers")
async def get_customers(db: Session = Depends(get_db)):
    customers = db.query(models.Customer).all()
    return [{"id": c.id, "customer_name": c.customer_name, "subdomain": c.subdomain, "aws_task_arn": c.aws_task_arn, "name_servers": c.name_servers} for c in customers]

class TenantConfig(BaseModel):
    openai_api_key: str | None = None
    anthropic_token: str | None = None
    gemini_token: str | None = None
    xai_token: str | None = None
    whatsapp_token: str | None = None
    telegram_token: str | None = None
    discord_token: str | None = None
    slack_token: str | None = None
    gmail_token: str | None = None
    github_token: str | None = None
    notion_token: str | None = None
    trello_token: str | None = None
    homeassistant_token: str | None = None
    hue_token: str | None = None
    webhook_url: str | None = None
    
    # Model routing
    whatsapp_model: str | None = None
    whatsapp_reply_groups: bool | None = None
    allowed_numbers: str | None = None  # comma/newline separated phone numbers whitelist
    telegram_model: str | None = None
    discord_model: str | None = None
    slack_model: str | None = None
    gmail_model: str | None = None
    github_model: str | None = None
    notion_model: str | None = None
    trello_model: str | None = None
    homeassistant_model: str | None = None
    hue_model: str | None = None
    webhook_model: str | None = None

@app.get("/api/tenant/{subdomain}/config")
async def get_tenant_config(subdomain: str, db: Session = Depends(get_db)):
    config = {}
    secret_keys = [
        "openai_api_key", "anthropic_token", "gemini_token", "xai_token",
        "whatsapp_token", "telegram_token", "discord_token", "slack_token",
        "gmail_token", "github_token", "notion_token", "trello_token",
        "homeassistant_token", "hue_token", "webhook_url"
    ]
    model_keys = [
        "whatsapp_model", "telegram_model", "discord_model", "slack_model", "gmail_model",
        "github_model", "notion_model", "trello_model", "homeassistant_model", "hue_model", "webhook_model"
    ]
    bool_keys = ["whatsapp_reply_groups"]
    text_keys = ["allowed_numbers"]  # plaintext fields (not masked, not model selectors)
    
    customer = db.query(models.Customer).filter(models.Customer.subdomain == subdomain).first()
    if not customer:
        return {k: "" for k in secret_keys + model_keys}
        
    if not customer.is_active:
        raise HTTPException(status_code=402, detail="Account suspended due to payment failure.")

    if not customer.config:
        empty = {k: "" for k in secret_keys + model_keys}
        empty.update({k: False for k in bool_keys})
        empty.update({k: "" for k in text_keys})
        empty["credits_used"] = getattr(customer, "credits_used", 0) or 0
        empty["monthly_credits_limit"] = getattr(customer, "monthly_credits_limit", 30000) or 30000
        empty["plan_type"] = getattr(customer, "plan_type", "pro") or "pro"
        return empty
        
    for key in secret_keys:
        val = getattr(customer.config, key, None)
        if val:
            config[key] = val[:4] + "*" * (len(val) - 4) if len(val) > 4 else "***"
        else:
            config[key] = ""
            
    for key in model_keys:
        config[key] = getattr(customer.config, key, "") or ""
            
    for key in bool_keys:
        config[key] = getattr(customer.config, key, False)

    for key in text_keys:
        config[key] = getattr(customer.config, key, "") or ""

    # Include credit usage info
    config["credits_used"] = getattr(customer, "credits_used", 0)
    config["monthly_credits_limit"] = getattr(customer, "monthly_credits_limit", 30000)
    config["plan_type"] = getattr(customer, "plan_type", "pro")
            
    return config

@app.post("/api/tenant/{subdomain}/config")
async def update_tenant_config(subdomain: str, config: TenantConfig, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.subdomain == subdomain).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    if not customer.is_active:
        raise HTTPException(status_code=402, detail="Account suspended due to payment failure.")
        
    if not customer.config:
        customer_config = models.CustomerConfig(customer_id=customer.id)
        db.add(customer_config)
        db.commit()
        db.refresh(customer_config)
    else:
        customer_config = customer.config

    updates = 0
    config_dict = config.dict(exclude_unset=True)
    
    try:
        for key, val in config_dict.items():
            if isinstance(val, str) and val.endswith("***"):
                continue  # skip masked values — don't overwrite existing keys
            setattr(customer_config, key, val)
            updates += 1

        db.commit()
    except Exception as e:
        import traceback
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    return {"message": f"Successfully updated {updates} configuration items for {subdomain}"}

class ChatMessage(BaseModel):
    session_id: str
    message: str
    is_group: bool | None = False

# ── In-memory activity log per subdomain (resets on restart) ─────────────────
_activity_store: dict = {}

def _log_activity(subdomain: str, event_type: str, summary: str, channel: str = "system"):
    import time
    store = _activity_store.setdefault(subdomain, [])
    store.insert(0, {
        "id": int(time.time() * 1000),
        "type": event_type,
        "summary": summary,
        "channel": channel,
        "time": datetime.now().strftime("%H:%M:%S")
    })
    _activity_store[subdomain] = store[:100]  # keep last 100

@app.get("/api/tenant/{subdomain}/activity")
async def get_activity(subdomain: str):
    return _activity_store.get(subdomain, [])

@app.get("/api/tenant/{subdomain}/sessions")
async def get_sessions(subdomain: str, db: Session = Depends(get_db)):
    """Return recent unique sessions from message logs."""
    try:
        rows = db.execute(
            text("""
                SELECT DISTINCT ON (session_id)
                    session_id as id,
                    session_id as sender,
                    'whatsapp' as channel,
                    created_at as last_active
                FROM message_logs
                WHERE customer_id = (SELECT id FROM customers WHERE subdomain = :sub)
                ORDER BY session_id, created_at DESC
                LIMIT 20
            """),
            {"sub": subdomain}
        ).fetchall()
        return [dict(r._mapping) for r in rows]
    except Exception:
        return []

@app.get("/api/tenant/{subdomain}/sessions/{session_id}/messages")
async def get_session_transcript(subdomain: str, session_id: str, db: Session = Depends(get_db)):
    """Return full transcript for a session."""
    try:
        rows = db.execute(
            text("""
                SELECT role, content, created_at as time
                FROM message_logs
                WHERE customer_id = (SELECT id FROM customers WHERE subdomain = :sub)
                  AND session_id = :sid
                ORDER BY created_at ASC
                LIMIT 200
            """),
            {"sub": subdomain, "sid": session_id}
        ).fetchall()
        return [dict(r._mapping) for r in rows]
    except Exception:
        return []

# ── In-memory Cron store ─────────────────────────────────────────────────────
_cron_store: dict = {}

class CronJobRequest(BaseModel):
    name: str
    schedule: str      # e.g. "0 9 * * *"
    message: str
    channel: str = "whatsapp"
    enabled: bool = True

@app.get("/api/tenant/{subdomain}/cron")
async def list_cron_jobs(subdomain: str):
    return list(_cron_store.get(subdomain, {}).values())

@app.post("/api/tenant/{subdomain}/cron")
async def create_cron_job(subdomain: str, req: CronJobRequest):
    import uuid as _uuid
    job_id = str(_uuid.uuid4())[:8]
    job = {"id": job_id, "name": req.name, "schedule": req.schedule,
           "message": req.message, "channel": req.channel,
           "enabled": req.enabled, "last_run": None, "next_run": req.schedule}
    _cron_store.setdefault(subdomain, {})[job_id] = job
    _log_activity(subdomain, "tool", f"Cron job created: {req.name} [{req.schedule}]", "system")
    return job

@app.patch("/api/tenant/{subdomain}/cron/{job_id}")
async def toggle_cron_job(subdomain: str, job_id: str):
    jobs = _cron_store.get(subdomain, {})
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    jobs[job_id]["enabled"] = not jobs[job_id]["enabled"]
    return jobs[job_id]

@app.delete("/api/tenant/{subdomain}/cron/{job_id}")
async def delete_cron_job(subdomain: str, job_id: str):
    jobs = _cron_store.get(subdomain, {})
    if job_id in jobs:
        del jobs[job_id]
    return {"ok": True}

# ── Log tail (last N activity entries as log lines) ──────────────────────────
@app.get("/api/tenant/{subdomain}/logs/tail")
async def tail_logs(subdomain: str, limit: int = 50):
    feed = _activity_store.get(subdomain, [])
    return [{"level": "ERROR" if e["type"] == "error" else "INFO",
             "message": e["summary"], "time": e["time"], "channel": e["channel"]}
            for e in feed[:limit]]

# ── Channel status badges ─────────────────────────────────────────────────────
@app.get("/api/tenant/{subdomain}/channels/status")
async def channel_status(subdomain: str, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.subdomain == subdomain).first()
    if not customer or not customer.config:
        return {}
    cfg = customer.config
    def _status(val): return "connected" if val and len(str(val)) > 5 else "disconnected"
    return {
        "whatsapp":  {"status": _status(cfg.whatsapp_token),   "label": "WhatsApp"},
        "telegram":  {"status": _status(cfg.telegram_token),   "label": "Telegram"},
        "discord":   {"status": _status(cfg.discord_token),    "label": "Discord"},
        "slack":     {"status": _status(cfg.slack_token),      "label": "Slack"},
        "openai":    {"status": _status(cfg.openai_api_key),   "label": "OpenAI"},
        "gemini":    {"status": _status(cfg.gemini_token),     "label": "Gemini"},
        "anthropic": {"status": _status(cfg.anthropic_token),  "label": "Anthropic"},
    }

class TenantDocumentRequest(BaseModel):
    filename: str
    content: str
    file_size: int = 0

@app.get("/api/tenant/{subdomain}/documents")
async def list_documents(subdomain: str, db: Session = Depends(get_db)):
    docs = db.query(models.TenantDocument).filter(models.TenantDocument.subdomain == subdomain).order_by(models.TenantDocument.created_at.desc()).all()
    return [{
        "id": doc.id,
        "filename": doc.filename,
        "file_size": doc.file_size,
        "created_at": doc.created_at
    } for doc in docs]

@app.post("/api/tenant/{subdomain}/documents")
async def upload_document(subdomain: str, req: TenantDocumentRequest, db: Session = Depends(get_db)):
    import uuid as _uuid
    doc_id = f"doc-{str(_uuid.uuid4())[:8]}"
    new_doc = models.TenantDocument(
        id=doc_id,
        subdomain=subdomain,
        filename=req.filename,
        content=req.content,
        file_size=req.file_size
    )
    db.add(new_doc)
    db.commit()
    _log_activity(subdomain, "tool", f"Uploaded document: {req.filename}", "system")
    return {"id": doc_id, "filename": req.filename, "file_size": req.file_size}

@app.post("/api/tenant/{subdomain}/documents/upload")
async def upload_document_file(subdomain: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload a file (txt, md, json, csv, xml, doc, docx) and extract text content."""
    import uuid as _uuid

    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    filename = file.filename
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    allowed_exts = {"txt", "md", "json", "csv", "xml", "doc", "docx"}

    if ext not in allowed_exts:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '.{ext}'. Allowed: {', '.join(sorted(allowed_exts))}"
        )

    raw_bytes = await file.read()
    file_size = len(raw_bytes)
    text_content = ""

    if ext == "docx":
        # Extract text from .docx using python-docx
        try:
            import io
            from docx import Document as DocxDocument
            doc_obj = DocxDocument(io.BytesIO(raw_bytes))
            paragraphs = [p.text for p in doc_obj.paragraphs if p.text.strip()]
            # Also extract text from tables
            for table in doc_obj.tables:
                for row in table.rows:
                    row_text = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
                    if row_text:
                        paragraphs.append(row_text)
            text_content = "\n".join(paragraphs)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse .docx file: {str(e)}")

    elif ext == "doc":
        # Extract readable text from legacy .doc binary format
        try:
            # Attempt to decode as text (some .doc files are actually rich text)
            try:
                text_content = raw_bytes.decode("utf-8")
            except UnicodeDecodeError:
                # Extract ASCII/Latin-1 readable text from binary .doc
                import re as _re_doc
                # Decode as latin-1 (never fails) then extract sequences of printable chars
                raw_text = raw_bytes.decode("latin-1", errors="ignore")
                # Filter to sequences of 4+ printable characters (words/sentences)
                chunks = _re_doc.findall(r'[\x20-\x7E\xA0-\xFF]{4,}', raw_text)
                text_content = " ".join(chunks)
                # Clean up excessive whitespace
                text_content = _re_doc.sub(r'\s{3,}', '\n', text_content).strip()

            if not text_content.strip():
                raise HTTPException(
                    status_code=400,
                    detail="Could not extract text from .doc file. Please convert to .docx and try again."
                )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse .doc file: {str(e)}")
    else:
        # Plain text formats: txt, md, json, csv, xml
        try:
            text_content = raw_bytes.decode("utf-8")
        except UnicodeDecodeError:
            text_content = raw_bytes.decode("latin-1", errors="ignore")

    if not text_content.strip():
        raise HTTPException(status_code=400, detail="File appears to be empty or contains no readable text.")

    doc_id = f"doc-{str(_uuid.uuid4())[:8]}"
    new_doc = models.TenantDocument(
        id=doc_id,
        subdomain=subdomain,
        filename=filename,
        content=text_content,
        file_size=file_size
    )
    db.add(new_doc)
    db.commit()
    _log_activity(subdomain, "tool", f"Uploaded document: {filename}", "system")
    return {"id": doc_id, "filename": filename, "file_size": file_size}

@app.delete("/api/tenant/{subdomain}/documents/{doc_id}")
async def delete_document(subdomain: str, doc_id: str, db: Session = Depends(get_db)):
    doc = db.query(models.TenantDocument).filter(
        models.TenantDocument.subdomain == subdomain,
        models.TenantDocument.id == doc_id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    filename = doc.filename
    db.delete(doc)
    db.commit()
    _log_activity(subdomain, "tool", f"Deleted document: {filename}", "system")
    return {"ok": True}

@app.post("/api/tenant/{subdomain}/chat")

async def tenant_chat(subdomain: str, req: ChatMessage, db: Session = Depends(get_db)):
    # 1. Look up the tenant config to get API keys and routing preference
    customer = db.query(models.Customer).filter(models.Customer.subdomain == subdomain).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Tenant not found")
        
    if not customer.is_active:
        return {"response": "System Notice: Service temporarily suspended due to payment failure. Please update your billing on the FastClaw dashboard."}
        
    if not customer.config:
        raise HTTPException(status_code=404, detail="Tenant not found")
        
    import openai
    
    config = customer.config
    if req.session_id.startswith('wa_'):
        if req.is_group and not config.whatsapp_reply_groups:
            return {"response": ""}
        model_choice = config.whatsapp_model
        channel_name = "WhatsApp"
    else:
        model_choice = config.webhook_model
        channel_name = "Webhook"
        
    if not model_choice:
        return {"response": f"No AI model is currently assigned to the {channel_name} channel."}
        
    # --- CREDIT USAGE ENFORCEMENT ---
    # Safe fallback if the columns aren't initialized properly yet
    credit_limit = getattr(customer, 'monthly_credits_limit', 30000)
    credits_used = getattr(customer, 'credits_used', 0)
    
    if credits_used >= credit_limit:
        raise HTTPException(
            status_code=402, 
            detail=f"Payment Required: Monthly credit limit ({credit_limit}) reached. Please upgrade your plan."
        )
        
    # Deduct credit
    customer.credits_used = credits_used + 1
    db.commit()
    # --------------------------------
        
    # 2. Custom Datasource Integration (RAG)
    # Fetch uploaded documents for the tenant
    docs = db.query(models.TenantDocument).filter(models.TenantDocument.subdomain == subdomain).all()
    doc_context = ""
    if docs:
        doc_context = "\n\n=== UPLOADED KNOWLEDGE BASE / DOCUMENTS ===\n"
        for doc in docs:
            doc_context += f"--- Document: {doc.filename} ---\n{doc.content}\n\n"
        doc_context += "=========================================\n"

    datasource_context = f"""
    Company Name: {customer.customer_name}
    Domain Name: {customer.subdomain}
    System Notice: You are the official AI assistant for {customer.customer_name}.
    You can answer questions related to your company's offerings. If you don't know the answer,
    you must tell the user to contact the support team via the company website.
    {doc_context}
    """
    
    # 3. Route to the chosen AI Model
    if model_choice == "openai":
        if not config.openai_api_key:
            return {"response": "OpenAI API Key is missing in your Surf Claw dashboard."}
            
        client = openai.AsyncOpenAI(api_key=config.openai_api_key)
        
        system_prompt = f"""You are a helpful AI assistant.
Use the following strict information from our datasource to answer questions:
--- DATASOURCE CONTEXT ---
{datasource_context}
--------------------------
"""
        try:
            completion = await client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": req.message}
                ]
            )
            reply = completion.choices[0].message.content
            _log_activity(subdomain, "message", f"{req.session_id[:20]}: {req.message[:60]}", channel_name.lower())
            return {"response": reply, "reply": reply}
        except Exception as e:
            _log_activity(subdomain, "error", f"AI error: {str(e)[:80]}", channel_name.lower())
            raise HTTPException(status_code=500, detail=str(e))

    elif model_choice == "gemini":
        if not config.gemini_token:
            return {"response": "Gemini API Key is missing in your Surf Claw dashboard."}
            
        import google.generativeai as genai
        genai.configure(api_key=config.gemini_token)
        model = genai.GenerativeModel('gemini-2.5-pro')
        
        system_prompt = f"""You are a helpful AI assistant.
Use the following strict information from our datasource to answer questions:
--- DATASOURCE CONTEXT ---
{datasource_context}
--------------------------
"""
        try:
            # Generate content synchronously but safely (or just use generate_content since we are in an async route, wait async route can block if not using run_in_threadpool, but here we can just use generate_content_async if available, or just call generate_content)
            response = model.generate_content(
                f"{system_prompt}\nUser: {req.message}"
            )
            return {"response": response.text}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
        
    return {"response": f"Selected model '{model_choice}' is not fully implemented yet."}

import subprocess
import os
import json

@app.post("/api/tenant/{subdomain}/whatsapp/start")
async def start_whatsapp(subdomain: str, reset: bool = False):
    session_id = f"wa_{subdomain}"
    worker_script = os.path.join(os.path.dirname(__file__), "whatsapp", "worker.js")
    
    import shutil
    import signal
    
    sessions_dir = os.path.join(os.path.dirname(__file__), "whatsapp", "sessions")
    pid_file = os.path.join(sessions_dir, f"{session_id}.pid")
    
    # Check if process is already running
    if os.path.exists(pid_file) and not reset:
        try:
            with open(pid_file, 'r') as f:
                old_pid = int(f.read().strip())
            os.kill(old_pid, 0)
            return {"status": "running", "session_id": session_id}
        except Exception:
            try: os.remove(pid_file)
            except: pass

    if os.path.exists(pid_file):
        try:
            with open(pid_file, 'r') as f:
                old_pid = int(f.read().strip())
            os.kill(old_pid, signal.SIGTERM)
        except Exception:
            pass
        finally:
            try: os.remove(pid_file)
            except: pass
            
    # Clean old status file and session auth folder
    status_file = os.path.join(sessions_dir, f"{session_id}_status.json")
    session_folder = os.path.join(sessions_dir, session_id)
    
    if os.path.exists(status_file):
        try: os.remove(status_file)
        except: pass
        
    if reset and os.path.exists(session_folder):
        try: shutil.rmtree(session_folder)
        except: pass
        
    log_file = open(os.path.join(sessions_dir, f"{session_id}.log"), "w")
    proc = subprocess.Popen(["node", worker_script, session_id], stdout=log_file, stderr=subprocess.STDOUT)
    
    # Save the new PID
    if not os.path.exists(sessions_dir):
        os.makedirs(sessions_dir, exist_ok=True)
    with open(pid_file, 'w') as f:
        f.write(str(proc.pid))
        
    return {"status": "started", "session_id": session_id}

@app.get("/api/tenant/{subdomain}/whatsapp/status")
async def get_whatsapp_status(subdomain: str):
    session_id = f"wa_{subdomain}"
    status_file = os.path.join(os.path.dirname(__file__), "whatsapp", "sessions", f"{session_id}_status.json")
    if not os.path.exists(status_file):
        return {"state": "starting"}
    try:
        with open(status_file, "r") as f:
            return json.load(f)
    except:
        return {"state": "starting"}

@app.get("/api/tenant/{subdomain}/whatsapp/log")
async def get_whatsapp_log(subdomain: str):
    session_id = f"wa_{subdomain}"
    log_file = os.path.join(os.path.dirname(__file__), "whatsapp", "sessions", f"{session_id}.log")
    try:
        with open(log_file, "r") as f:
            return {"log": f.read()}
    except:
        return {"log": "No log found"}

def get_tenant_db(subdomain: str):
    db = SessionLocal()
    try:
        db.execute(text(f'SET search_path TO "tenant_{subdomain}"'))
        yield db
    finally:
        db.execute(text('SET search_path TO public'))
        db.commit()
        db.close()



class ContactMessage(BaseModel):
    firstName: str
    lastName: str
    email: str
    message: str

@app.post("/api/contact")
async def send_contact_email(req: ContactMessage):
    try:
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart

        msg = MIMEMultipart()
        msg["Subject"] = f"New Contact Request from {req.firstName} {req.lastName}"
        msg["From"] = "api@niyogen.com"
        msg["To"] = "api@niyogen.com"

        body = f"Name: {req.firstName} {req.lastName}\nEmail: {req.email}\n\nMessage:\n{req.message}"
        msg.attach(MIMEText(body, "plain"))

        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login("api@niyogen.com", "sicnznjbiswbasqx")
            server.send_message(msg)
            
        return {"status": "success"}
    except Exception as e:
        print(f"Failed to send contact email: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# WEBSITE CHATBOT — reads AI key from Integrations & Agents modal config
#
# Set ONE env var on the backend:
#   WEBSITE_CUSTOMER_ID=<customer_id from the customers table>
#
# That customer's configured keys (openai_api_key / gemini_token /
# anthropic_token / xai_token) are used automatically — exactly the
# same keys they entered in the Integrations & Agents modal.
# Priority order: openai → gemini → anthropic → xai (first one configured wins).
# ─────────────────────────────────────────────────────────────────────────────

# The numeric ID of the Customer row whose Integrations config to use.
WEBSITE_CUSTOMER_ID = int(os.getenv("WEBSITE_CUSTOMER_ID", "1"))

WEBSITE_SYSTEM_PROMPT = """You are the OpenClaw AI — a conversational AI agent for the FastClaw / OpenClaw SaaS platform.
You work exactly like a WhatsApp AI agent: customers chat with you naturally and you get things done for them.

== WHAT YOU CAN DO ==
1. Answer questions about OpenClaw features, pricing, integrations
2. Create a new AI agent workspace for the customer through natural conversation
3. Help customers get work done through their configured integrations (after they log in)

== PRICING ==
- Pro plan: $18/month (yearly) — 30,000 credits/mo, OpenClaw engine, 13+ channels
- Max plan: $79/month (yearly) — 120,000 credits/mo, all Pro features + Custom Ports

== CREATING AN AGENT (most important flow) ==
When a customer wants to create an account / agent / workspace, collect these through natural conversation (one question at a time, friendly tone):
1. Company or agent name
2. Email address
3. Password (tell them min 6 chars)
4. Plan preference (Pro or Max — briefly explain the difference)

Once you have ALL 4, output this EXACT line at the end of your message (no markdown, exact format):
##ACTION:CREATE_AGENT:{"company":"<name>","email":"<email>","password":"<password>","plan":"<pro|max>"}

Example: After collecting all info say "Perfect! Creating your workspace now..." then on its own line:
##ACTION:CREATE_AGENT:{"company":"Acme Corp","email":"admin@acme.com","password":"mypass123","plan":"pro"}

== GETTING WORK DONE ==
If a logged-in customer asks you to perform tasks (send email, check Slack, create GitHub issue etc.),
assist them based on their configured integrations. If they haven't configured integrations yet,
guide them to the Integrations & Agents modal in their dashboard.

== TONE ==
Be warm, concise, and conversational — like texting a knowledgeable friend. No long paragraphs.
For unresolvable issues, refer to support@niyogen.com."""

class WebsiteChatRequest(BaseModel):
    message: str
    history: list[dict] | None = None  # [{"role": "user"|"assistant", "content": "..."}]

# ─────────────────────────────────────────────────────────────────────────────
# WEBSITE ONBOARDING — creates a new agent/customer via chat
# Called by the ChatWidget when a visitor completes the guided signup flow.
# ─────────────────────────────────────────────────────────────────────────────

class OnboardRequest(BaseModel):
    company_name: str
    admin_email: str
    admin_password: str
    plan: str = "pro"   # "pro" | "max"

@app.post("/api/website/onboard")
async def website_onboard(req: OnboardRequest, db: Session = Depends(get_db)):
    """Create a new OpenClaw agent/workspace directly from the chat widget.
    Provisions the customer schema and stores credentials — no Stripe session required.
    The admin can follow up with coupon/billing separately.
    """
    if not req.company_name.strip() or not req.admin_email.strip() or not req.admin_password.strip():
        raise HTTPException(status_code=400, detail="company_name, admin_email and admin_password are required.")

    plan = req.plan.lower() if req.plan.lower() in ("pro", "max") else "pro"
    credit_limit = 120_000 if plan == "max" else 30_000

    install_req = InstallRequest(
        customer_name=req.company_name.strip(),
        admin_email=req.admin_email.strip().lower(),
        admin_password=req.admin_password.strip(),
    )

    result = await deploy_fastclaw(install_req, db)
    subdomain = result["subdomain"]

    # Set plan and credit limit on the newly created customer
    try:
        new_customer = db.query(models.Customer).filter(models.Customer.subdomain == subdomain).first()
        if new_customer:
            new_customer.plan_type = plan
            new_customer.monthly_credits_limit = credit_limit
            db.commit()
    except Exception:
        pass  # Non-fatal — defaults already set by deploy_fastclaw

    return {
        "status": "success",
        "subdomain": subdomain,
        "dashboard_url": f"https://fastclaw.niyogen.com/{subdomain}",
        "plan": plan,
        "message": (
            f"✅ Your OpenClaw workspace is ready! "
            f"Visit https://fastclaw.niyogen.com/{subdomain} to log in with your email and password."
        ),
    }

# ── Action helpers ─────────────────────────────────────────────────────────
import json as _json, re as _re

def _parse_action(raw: str):
    """Extract ##ACTION:CREATE_AGENT:{...} from AI reply. Returns (clean_reply, data|None)."""
    m = _re.search(r'##ACTION:CREATE_AGENT:(\{.*?\})', raw, _re.DOTALL)
    if not m:
        return raw, None
    try:
        return raw[:m.start()].strip(), _json.loads(m.group(1))
    except Exception:
        return raw, None

async def _execute_create_agent(d: dict, db: Session) -> str:
    try:
        result = await deploy_fastclaw(InstallRequest(
            customer_name=d.get("company", "My Company"),
            admin_email=d.get("email", ""),
            admin_password=d.get("password", ""),
        ), db)
        sub = result["subdomain"]
        plan = d.get("plan", "pro").lower()
        try:
            nc = db.query(models.Customer).filter(models.Customer.subdomain == sub).first()
            if nc:
                nc.plan_type = plan
                nc.monthly_credits_limit = 120_000 if plan == "max" else 30_000
                db.commit()
        except Exception:
            pass
        return (
            f"\n\n✅ Your workspace is live!\n"
            f"🔗 https://fastclaw.niyogen.com/{sub}\n"
            f"📧 Login: {d.get('email')}\n"
            f"📦 Plan: {plan.capitalize()}\n\n"
            f"Go to Integrations & Agents in your dashboard to connect OpenAI, WhatsApp, Gmail and more. "
            f"Then come back and chat with your agent! 🚀"
        )
    except Exception as e:
        return f"\n\n⚠️ Couldn't create workspace: {e}. Contact support@niyogen.com."

@app.post("/api/website/chat")
async def website_chat(req: WebsiteChatRequest, db: Session = Depends(get_db)):
    """Conversational AI agent — handles Q&A, agent creation, and task execution via chat."""
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="Message is required")

    # ── Look up the designated customer's Integrations config ────────────────
    customer = db.query(models.Customer).filter(models.Customer.id == WEBSITE_CUSTOMER_ID).first()

    if not customer or not customer.config:
        raise HTTPException(
            status_code=503,
            detail=(
                f"Website chatbot not configured. "
                f"Open the Integrations & Agents modal for customer ID={WEBSITE_CUSTOMER_ID} "
                f"and add an OpenAI / Gemini / Anthropic / xAI key."
            )
        )

    cfg = customer.config
    history = req.history or []
    history = history[-20:]  # cap at 10 turns

    # ── Pick the first available AI key (priority: openai → gemini → anthropic → xai) ──
    import openai as _openai

    if cfg.openai_api_key:
        # ── OpenAI ────────────────────────────────────────────────────────────
        client = _openai.AsyncOpenAI(api_key=cfg.openai_api_key)
        messages = [{"role": "system", "content": WEBSITE_SYSTEM_PROMPT}]
        messages += [{"role": m["role"], "content": m["content"]} for m in history]
        messages.append({"role": "user", "content": req.message.strip()})
        try:
            completion = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                max_tokens=600,
                temperature=0.7,
            )
            return {"response": completion.choices[0].message.content}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    elif cfg.gemini_token:
        # ── Google Gemini ─────────────────────────────────────────────────────
        import google.generativeai as genai
        genai.configure(api_key=cfg.gemini_token)
        model_g = genai.GenerativeModel("gemini-2.0-flash-lite")
        conversation = WEBSITE_SYSTEM_PROMPT + "\n\n"
        for m in history:
            conversation += f"{'User' if m['role'] == 'user' else 'Assistant'}: {m['content']}\n"
        conversation += f"User: {req.message.strip()}\nAssistant:"
        try:
            resp = model_g.generate_content(conversation)
            return {"response": resp.text}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    elif cfg.anthropic_token:
        # ── Anthropic Claude ──────────────────────────────────────────────────
        import anthropic as _anthropic
        client_a = _anthropic.AsyncAnthropic(api_key=cfg.anthropic_token)
        anth_messages = [{"role": m["role"], "content": m["content"]} for m in history]
        anth_messages.append({"role": "user", "content": req.message.strip()})
        try:
            msg = await client_a.messages.create(
                model="claude-3-haiku-20240307",
                system=WEBSITE_SYSTEM_PROMPT,
                messages=anth_messages,
                max_tokens=600,
            )
            return {"response": msg.content[0].text}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    elif cfg.xai_token:
        # ── xAI Grok (OpenAI-compatible) ──────────────────────────────────────
        client_x = _openai.AsyncOpenAI(
            api_key=cfg.xai_token,
            base_url="https://api.x.ai/v1",
        )
        messages = [{"role": "system", "content": WEBSITE_SYSTEM_PROMPT}]
        messages += [{"role": m["role"], "content": m["content"]} for m in history]
        messages.append({"role": "user", "content": req.message.strip()})
        try:
            completion = await client_x.chat.completions.create(
                model="grok-3-mini",
                messages=messages,
                max_tokens=600,
                temperature=0.7,
            )
            raw_reply = completion.choices[0].message.content
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    else:
        raise HTTPException(
            status_code=503,
            detail=f"No AI key configured for customer ID={WEBSITE_CUSTOMER_ID}."
        )

    # ── Intercept ##ACTION tags and execute ───────────────────────────────────
    clean_reply, action_data = _parse_action(raw_reply)
    action_suffix = await _execute_create_agent(action_data, db) if action_data else ""
    return {"response": clean_reply + action_suffix}



# ═══════════════════════════════════════════════════════════════════════════════
# SKILLS EXECUTION API
# ═══════════════════════════════════════════════════════════════════════════════

class SkillRequest(BaseModel):
    skill_id: str
    task: str
    params: dict = {}
    openai_api_key: str | None = None

# ── Agent persistence (in-memory, per tenant) ──────────────────────────────────
_agent_store: dict = {}

class AgentPayload(BaseModel):
    id: str | None = None
    name: str
    persona: str = "Helpful assistant"
    enabled: bool = True
    channel: str = "WhatsApp"
    model: str = "OpenAI (GPT-4)"
    messagesHandled: int = 0

@app.get("/api/tenant/{subdomain}/agents")
async def list_agents(subdomain: str):
    return _agent_store.get(subdomain, [])

@app.post("/api/tenant/{subdomain}/agents")
async def create_agent(subdomain: str, payload: AgentPayload):
    import uuid as _uuid
    agent = payload.dict()
    if not agent.get("id"):
        agent["id"] = f"agent-{str(_uuid.uuid4())[:8]}"
    _agent_store.setdefault(subdomain, []).append(agent)
    _log_activity(subdomain, "tool", f"Agent created: {agent['name']}", "system")
    return agent

@app.put("/api/tenant/{subdomain}/agents/{agent_id}")
async def update_agent(subdomain: str, agent_id: str, payload: AgentPayload):
    store = _agent_store.get(subdomain, [])
    for i, a in enumerate(store):
        if a["id"] == agent_id:
            store[i] = {**a, **payload.dict(exclude_unset=True), "id": agent_id}
            return store[i]
    raise HTTPException(status_code=404, detail="Agent not found")

@app.delete("/api/tenant/{subdomain}/agents/{agent_id}")
async def delete_agent(subdomain: str, agent_id: str):
    store = _agent_store.get(subdomain, [])
    _agent_store[subdomain] = [a for a in store if a["id"] != agent_id]
    return {"ok": True}

# ── Skill: Browser Automation ──────────────────────────────────────────────────
@app.post("/api/tenant/{subdomain}/skill/browser")
async def skill_browser(subdomain: str, req: SkillRequest, db: Session = Depends(get_db)):
    import httpx, re as _re
    try:
        from bs4 import BeautifulSoup
    except ImportError:
        return {"skill": "browser-automation", "status": "error", "result": "BeautifulSoup not installed."}
    url = req.params.get("url", "")
    if not url:
        m = _re.search(r'https?://[^\s]+', req.task)
        url = m.group(0) if m else ""
    if not url:
        return {"skill": "browser-automation", "status": "error", "result": "No URL found. Include a URL like: scrape https://example.com"}
    action = req.params.get("action", "scrape")
    try:
        headers = {"User-Agent": "Mozilla/5.0 (compatible; OpenClaw-Bot/1.0)"}
        async with httpx.AsyncClient(follow_redirects=True, timeout=15) as client:
            resp = await client.get(url, headers=headers)
        soup = BeautifulSoup(resp.text, "html.parser")
        for tag in soup(["script", "style", "nav", "footer"]): tag.decompose()
        title = soup.title.string.strip() if soup.title else "No title"
        if action == "links":
            links = [{"text": a.get_text(strip=True), "href": a.get("href", "")} for a in soup.find_all("a", href=True) if a.get_text(strip=True)][:25]
            result = f"**{title}** — {len(links)} links:\n" + "\n".join(f"• [{l['text']}]({l['href']})" for l in links)
        elif action == "headings":
            headings = [(t.name, t.get_text(strip=True)) for t in soup.find_all(["h1","h2","h3"])][:20]
            result = f"**{title}** — Headings:\n" + "\n".join(f"{'#'*int(h[0][1])} {h[1]}" for h in headings)
        else:
            paras = [p.get_text(strip=True) for p in soup.find_all(["p","li","td"]) if len(p.get_text(strip=True)) > 30]
            content = "\n\n".join(paras[:20])[:3000]
            result = f"**{title}**\n\n{content}"
        _log_activity(subdomain, "tool", f"Browser scraped: {url[:50]}", "dashboard")
        return {"skill": "browser-automation", "status": "success", "url": url, "title": title, "result": result}
    except Exception as e:
        return {"skill": "browser-automation", "status": "error", "result": f"Error: {str(e)}"}

# ── Skill: Image Generator ─────────────────────────────────────────────────────
@app.post("/api/tenant/{subdomain}/skill/image")
async def skill_image(subdomain: str, req: SkillRequest, db: Session = Depends(get_db)):
    import openai as _openai
    customer = db.query(models.Customer).filter(models.Customer.subdomain == subdomain).first()
    api_key = req.openai_api_key or (customer.config.openai_api_key if customer and customer.config else None)
    if not api_key:
        return {"skill": "image-gen", "status": "error", "result": "OpenAI API key not configured. Add it in Integrations → OpenAI."}
    try:
        client = _openai.AsyncOpenAI(api_key=api_key)
        response = await client.images.generate(model="dall-e-3", prompt=req.task, n=1, size="1024x1024")
        img_url = response.data[0].url
        _log_activity(subdomain, "tool", f"Image: {req.task[:50]}", "dashboard")
        return {"skill": "image-gen", "status": "success", "image_url": img_url, "result": f"🖼️ [View generated image]({img_url})"}
    except Exception as e:
        return {"skill": "image-gen", "status": "error", "result": f"DALL-E error: {str(e)}"}

# ── Skill: Shell Runner ────────────────────────────────────────────────────────
@app.post("/api/tenant/{subdomain}/skill/shell")
async def skill_shell(subdomain: str, req: SkillRequest):
    import subprocess, shlex
    ALLOWED = {"echo","date","pwd","ls","cat","grep","wc","head","tail","curl","python3","node","whoami","hostname","uname","df","uptime","ps","which","find","sort","env"}
    BLOCKED = ["rm ","rmdir","mkfs","dd ","sudo","su ","chmod 777",":(){ ",">/"]
    cmd = req.params.get("command", req.task)
    for b in BLOCKED:
        if b in cmd:
            return {"skill": "shell-runner", "status": "blocked", "result": f"Blocked: '{b}' not allowed"}
    first = shlex.split(cmd)[0] if cmd.strip() else ""
    if first not in ALLOWED:
        return {"skill": "shell-runner", "status": "blocked", "result": f"'{first}' not in allowlist: {', '.join(sorted(ALLOWED))}"}
    try:
        r = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=10, env={"PATH": "/usr/bin:/bin:/usr/local/bin"})
        out = (r.stdout or r.stderr or "(no output)").strip()[:2000]
        _log_activity(subdomain, "tool", f"Shell: {cmd[:50]}", "dashboard")
        return {"skill": "shell-runner", "status": "success", "result": f"```\n$ {cmd}\n{out}\n```"}
    except subprocess.TimeoutExpired:
        return {"skill": "shell-runner", "status": "error", "result": "Timed out (10s)"}
    except Exception as e:
        return {"skill": "shell-runner", "status": "error", "result": str(e)}

# ── Skill: Voice TTS ───────────────────────────────────────────────────────────
@app.post("/api/tenant/{subdomain}/skill/tts")
async def skill_tts(subdomain: str, req: SkillRequest):
    import httpx, base64
    api_key = req.params.get("api_key", "")
    voice_id = req.params.get("voice_id", "21m00Tcm4TlvDq8ikWAM")
    if not api_key:
        return {"skill": "voice-tts", "status": "error", "result": "ElevenLabs API key required."}
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(
                f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
                headers={"xi-api-key": api_key, "Content-Type": "application/json"},
                json={"text": req.task[:500], "model_id": "eleven_monolingual_v1", "voice_settings": {"stability": 0.5, "similarity_boost": 0.5}}
            )
        if resp.status_code == 200:
            audio_b64 = base64.b64encode(resp.content).decode()
            _log_activity(subdomain, "tool", f"TTS: {req.task[:40]}", "dashboard")
            return {"skill": "voice-tts", "status": "success", "audio_base64": audio_b64, "result": f"🎙️ Audio generated for: \"{req.task[:80]}\""}
        return {"skill": "voice-tts", "status": "error", "result": f"ElevenLabs {resp.status_code}: {resp.text[:200]}"}
    except Exception as e:
        return {"skill": "voice-tts", "status": "error", "result": str(e)}

# ── Unified Skill Executor ─────────────────────────────────────────────────────
@app.post("/api/tenant/{subdomain}/skill/execute")
async def execute_skill(subdomain: str, req: SkillRequest, db: Session = Depends(get_db)):
    if req.skill_id == "browser-automation": return await skill_browser(subdomain, req, db)
    if req.skill_id == "image-gen": return await skill_image(subdomain, req, db)
    if req.skill_id == "shell-runner": return await skill_shell(subdomain, req)
    if req.skill_id == "voice-tts": return await skill_tts(subdomain, req)
    return {"skill": req.skill_id, "status": "unsupported", "result": f"'{req.skill_id}' runs through the AI Chat tab — configure credentials in Integrations then ask your agent."}

# ── Skill persistence (backend install/uninstall) ──────────────────────────────
_skill_store: dict = {}

@app.get("/api/tenant/{subdomain}/skills")
async def get_skills(subdomain: str):
    return {"installed": _skill_store.get(subdomain, [])}

@app.post("/api/tenant/{subdomain}/skills/{skill_id}")
async def install_skill(subdomain: str, skill_id: str):
    store = _skill_store.setdefault(subdomain, [])
    if skill_id not in store: store.append(skill_id)
    _log_activity(subdomain, "tool", f"Skill installed: {skill_id}", "system")
    return {"installed": store}

@app.delete("/api/tenant/{subdomain}/skills/{skill_id}")
async def uninstall_skill(subdomain: str, skill_id: str):
    _skill_store[subdomain] = [s for s in _skill_store.get(subdomain, []) if s != skill_id]
    return {"installed": _skill_store[subdomain]}

# ═══════════════════════════════════════════════════════════════════════════════
# GITHUB OPERATOR SKILL
# Accepts a task + GitHub token and executes it via GitHub REST API
# ═══════════════════════════════════════════════════════════════════════════════

class GitHubSkillRequest(BaseModel):
    task: str                    # Natural language: "list open issues", "create issue: ..."
    github_token: str            # Personal Access Token (ghp_...)
    repo: str | None = None      # owner/repo-name
    params: dict = {}

@app.post("/api/tenant/{subdomain}/skill/github")
async def skill_github(subdomain: str, req: GitHubSkillRequest):
    """
    GitHub Operator — perform GitHub operations via token.
    Supported tasks: list-issues, create-issue, list-prs, list-repos, get-repo, close-issue
    """
    import httpx

    token = req.github_token
    if not token or not token.strip():
        return {"skill": "github-copilot", "status": "error",
                "result": "❌ GitHub token not provided. Add it in Skills → GitHub Operator → Configure."}

    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    base = "https://api.github.com"
    task_lower = req.task.lower()
    repo = req.repo or req.params.get("repo", "")

    async def gh_get(path: str):
        async with httpx.AsyncClient(timeout=15) as c:
            r = await c.get(f"{base}{path}", headers=headers)
            return r.status_code, r.json()

    async def gh_post(path: str, body: dict):
        async with httpx.AsyncClient(timeout=15) as c:
            r = await c.post(f"{base}{path}", headers=headers, json=body)
            return r.status_code, r.json()

    async def gh_patch(path: str, body: dict):
        async with httpx.AsyncClient(timeout=15) as c:
            r = await c.patch(f"{base}{path}", headers=headers, json=body)
            return r.status_code, r.json()

    try:
        # ── Verify token first ───────────────────────────────────────────────
        status, user_data = await gh_get("/user")
        if status != 200:
            return {"skill": "github-copilot", "status": "error",
                    "result": f"❌ GitHub auth failed (HTTP {status}). Check your token."}
        gh_user = user_data.get("login", "unknown")

        # ── LIST MY REPOS ────────────────────────────────────────────────────
        if any(k in task_lower for k in ["my repos", "list repos", "list my repos", "repositories", "all repos"]):
            status, data = await gh_get("/user/repos?sort=updated&per_page=15")
            if status != 200:
                return {"skill": "github-copilot", "status": "error", "result": f"❌ Failed to list repos: {data}"}
            repos = [f"• **{r['full_name']}** — {r.get('description','') or 'No description'} ({r['visibility']}, ⭐{r['stargazers_count']})" for r in data]
            result = f"**{gh_user}'s Repositories** ({len(repos)} recent):\n\n" + "\n".join(repos)
            _log_activity(subdomain, "tool", f"GitHub: listed {len(repos)} repos for {gh_user}", "dashboard")
            return {"skill": "github-copilot", "status": "success", "result": result}

        # ── LIST ISSUES ──────────────────────────────────────────────────────
        if any(k in task_lower for k in ["list issues", "open issues", "show issues", "issues"]):
            if not repo:
                return {"skill": "github-copilot", "status": "error",
                        "result": "❌ Please specify a repo (e.g. 'list issues in owner/repo-name')."}
            status, data = await gh_get(f"/repos/{repo}/issues?state=open&per_page=15")
            if status != 200:
                return {"skill": "github-copilot", "status": "error", "result": f"❌ Repo '{repo}' not found or no access."}
            prs = [i for i in data if "pull_request" in i]
            issues = [i for i in data if "pull_request" not in i]
            result = f"**Open Issues in {repo}** ({len(issues)} issues, {len(prs)} PRs):\n\n"
            result += "\n".join(f"• #{i['number']} {i['title']} (@{i['user']['login']})" for i in issues[:15])
            _log_activity(subdomain, "tool", f"GitHub: listed issues in {repo}", "dashboard")
            return {"skill": "github-copilot", "status": "success", "result": result}

        # ── CREATE ISSUE ─────────────────────────────────────────────────────
        if any(k in task_lower for k in ["create issue", "new issue", "open issue", "add issue", "file issue"]):
            if not repo:
                return {"skill": "github-copilot", "status": "error",
                        "result": "❌ Specify a repo. E.g.: 'create issue in owner/repo: Bug in login page'"}
            # Extract title from task: everything after the colon
            title = req.params.get("title", "")
            body_text = req.params.get("body", "")
            if not title:
                parts = req.task.split(":", 1)
                title = parts[1].strip() if len(parts) > 1 else req.task
            status, data = await gh_post(f"/repos/{repo}/issues",
                                         {"title": title, "body": body_text or f"Created via OpenClaw GitHub Operator."})
            if status not in (200, 201):
                return {"skill": "github-copilot", "status": "error", "result": f"❌ Failed to create issue: {data.get('message', data)}"}
            result = f"✅ Issue created!\n\n**#{data['number']} {data['title']}**\n🔗 {data['html_url']}"
            _log_activity(subdomain, "tool", f"GitHub: created issue #{data['number']} in {repo}", "dashboard")
            return {"skill": "github-copilot", "status": "success", "issue_url": data["html_url"], "result": result}

        # ── LIST PULL REQUESTS ───────────────────────────────────────────────
        if any(k in task_lower for k in ["list prs", "pull requests", "open prs", "show prs", "list pull"]):
            if not repo:
                return {"skill": "github-copilot", "status": "error", "result": "❌ Specify a repo."}
            status, data = await gh_get(f"/repos/{repo}/pulls?state=open&per_page=15")
            if status != 200:
                return {"skill": "github-copilot", "status": "error", "result": f"❌ Failed: {data}"}
            result = f"**Open PRs in {repo}** ({len(data)}):\n\n"
            result += "\n".join(f"• #{pr['number']} {pr['title']} (@{pr['user']['login']}) — `{pr['head']['ref']}` → `{pr['base']['ref']}`" for pr in data[:15])
            _log_activity(subdomain, "tool", f"GitHub: listed {len(data)} PRs in {repo}", "dashboard")
            return {"skill": "github-copilot", "status": "success", "result": result}

        # ── GET REPO INFO ────────────────────────────────────────────────────
        if any(k in task_lower for k in ["repo info", "about repo", "repository info", "describe repo", "get repo"]):
            if not repo:
                return {"skill": "github-copilot", "status": "error", "result": "❌ Specify a repo."}
            status, data = await gh_get(f"/repos/{repo}")
            if status != 200:
                return {"skill": "github-copilot", "status": "error", "result": f"❌ Repo '{repo}' not found."}
            result = (f"**{data['full_name']}**\n"
                      f"📋 {data.get('description') or 'No description'}\n"
                      f"⭐ {data['stargazers_count']} stars · 🍴 {data['forks_count']} forks · "
                      f"{'🔒 Private' if data['private'] else '🌐 Public'}\n"
                      f"📦 {data.get('language','Unknown')} · Updated: {data['updated_at'][:10]}\n"
                      f"🔗 {data['html_url']}")
            _log_activity(subdomain, "tool", f"GitHub: fetched info for {repo}", "dashboard")
            return {"skill": "github-copilot", "status": "success", "result": result}

        # ── CLOSE ISSUE ──────────────────────────────────────────────────────
        if any(k in task_lower for k in ["close issue", "resolve issue"]):
            issue_num = req.params.get("issue_number", "")
            if not repo or not issue_num:
                return {"skill": "github-copilot", "status": "error", "result": "❌ Specify repo and issue number in params."}
            status, data = await gh_patch(f"/repos/{repo}/issues/{issue_num}", {"state": "closed"})
            if status != 200:
                return {"skill": "github-copilot", "status": "error", "result": f"❌ Failed to close issue: {data.get('message', data)}"}
            result = f"✅ Issue #{issue_num} closed: {data.get('html_url','')}"
            _log_activity(subdomain, "tool", f"GitHub: closed issue #{issue_num} in {repo}", "dashboard")
            return {"skill": "github-copilot", "status": "success", "result": result}

        # ── WHOAMI / AUTH CHECK ───────────────────────────────────────────────
        if any(k in task_lower for k in ["who am i", "whoami", "my profile", "authenticated", "check auth", "verify"]):
            status, data = await gh_get("/user")
            result = (f"✅ **GitHub Connected**\n\n"
                      f"👤 **{data.get('name','') or data['login']}** (@{data['login']})\n"
                      f"📧 {data.get('email') or 'Email hidden'}\n"
                      f"🏢 {data.get('company') or 'No company'}\n"
                      f"📦 {data.get('public_repos',0)} public repos · {data.get('followers',0)} followers")
            return {"skill": "github-copilot", "status": "success", "result": result}

        # ── FALLBACK — unknown task ───────────────────────────────────────────
        return {
            "skill": "github-copilot",
            "status": "unsupported",
            "result": (f"🐙 **GitHub Operator** — connected as @{gh_user}\n\n"
                       f"Supported commands:\n"
                       f"• **List my repos** — see all your repositories\n"
                       f"• **List issues in owner/repo** — open issues\n"
                       f"• **Create issue in owner/repo: Title** — file a new issue\n"
                       f"• **List PRs in owner/repo** — open pull requests\n"
                       f"• **Repo info for owner/repo** — repository details\n"
                       f"• **Close issue in owner/repo** (with issue_number param)\n"
                       f"• **Who am I** — verify your GitHub connection\n\n"
                       f"Your task: *\"{req.task}\"* — couldn't match a command. Try rephrasing.")
        }

    except Exception as e:
        return {"skill": "github-copilot", "status": "error", "result": f"❌ GitHub error: {str(e)}"}


# ── Also expose GitHub through the unified executor ────────────────────────────
# (patch the execute_skill function by adding github routing via a separate handler)
@app.post("/api/tenant/{subdomain}/skill/github-execute")
async def skill_github_execute_wrapper(subdomain: str, req: SkillRequest):
    """Wrapper that calls skill_github from the unified SkillRequest shape."""
    github_req = GitHubSkillRequest(
        task=req.task,
        github_token=req.params.get("github_token", ""),
        repo=req.params.get("repo", ""),
        params=req.params,
    )
    return await skill_github(subdomain, github_req)



# ═══════════════════════════════════════════════════════════════════════════════
# GMAIL MANAGER SKILL — read inbox, send email, list labels
# Uses IMAP/SMTP with Gmail App Password
# ═══════════════════════════════════════════════════════════════════════════════

class GmailSkillRequest(BaseModel):
    task: str
    email: str           # Gmail address
    app_password: str    # 16-char Google App Password
    params: dict = {}

@app.post("/api/tenant/{subdomain}/skill/gmail")
async def skill_gmail(subdomain: str, req: GmailSkillRequest):
    import imaplib, smtplib, email as email_lib
    from email.mime.text import MIMEText
    from email.header import decode_header

    if not req.email or not req.app_password:
        return {"skill": "gmail-reader", "status": "error",
                "result": "❌ Gmail address and App Password required. Configure in Skills → Gmail Manager."}

    task_lower = req.task.lower()

    def decode_str(s):
        if s is None: return ""
        parts = decode_header(s)
        return "".join(p.decode(enc or "utf-8") if isinstance(p, bytes) else p for p, enc in parts)

    # ── READ INBOX ────────────────────────────────────────────────────────────
    if any(k in task_lower for k in ["read inbox", "list emails", "check inbox", "inbox", "unread", "recent emails"]):
        try:
            mail = imaplib.IMAP4_SSL("imap.gmail.com")
            mail.login(req.email, req.app_password.replace(" ", ""))
            mail.select("inbox")
            count = req.params.get("count", 10)
            _, msgs = mail.search(None, "ALL")
            ids = msgs[0].split()[-count:]
            result_lines = [f"📧 **Inbox — {req.email}** (last {len(ids)} emails):\n"]
            for mid in reversed(ids):
                _, data = mail.fetch(mid, "(RFC822)")
                msg = email_lib.message_from_bytes(data[0][1])
                subj = decode_str(msg["Subject"])
                sender = decode_str(msg["From"])
                date = msg["Date"][:16] if msg["Date"] else ""
                result_lines.append(f"• **{subj}**\n  From: {sender} | {date}")
            mail.logout()
            _log_activity(subdomain, "tool", f"Gmail: read {len(ids)} emails for {req.email}", "dashboard")
            return {"skill": "gmail-reader", "status": "success", "result": "\n".join(result_lines)}
        except imaplib.IMAP4.error as e:
            return {"skill": "gmail-reader", "status": "error",
                    "result": f"❌ Gmail auth failed: {str(e)}\n\nMake sure:\n• 2-Step Verification is ON\n• App Password was generated at myaccount.google.com → Security → App Passwords"}
        except Exception as e:
            return {"skill": "gmail-reader", "status": "error", "result": f"❌ Gmail error: {str(e)}"}

    # ── SEND EMAIL ────────────────────────────────────────────────────────────
    if any(k in task_lower for k in ["send email", "send mail", "compose", "write email"]):
        to_addr = req.params.get("to", "")
        subject = req.params.get("subject", req.task)
        body = req.params.get("body", req.task)
        if not to_addr:
            return {"skill": "gmail-reader", "status": "error",
                    "result": "❌ Specify recipient in params: {\"to\": \"person@example.com\", \"subject\": \"...\", \"body\": \"...\"}"}
        try:
            msg = MIMEText(body)
            msg["Subject"] = subject
            msg["From"] = req.email
            msg["To"] = to_addr
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                server.login(req.email, req.app_password.replace(" ", ""))
                server.send_message(msg)
            _log_activity(subdomain, "tool", f"Gmail: sent email to {to_addr}", "dashboard")
            return {"skill": "gmail-reader", "status": "success",
                    "result": f"✅ Email sent to **{to_addr}**\n📋 Subject: {subject}"}
        except Exception as e:
            return {"skill": "gmail-reader", "status": "error", "result": f"❌ Send failed: {str(e)}"}

    # ── UNSUBSCRIBE / LIST LABELS ─────────────────────────────────────────────
    if any(k in task_lower for k in ["labels", "folders", "categories"]):
        try:
            mail = imaplib.IMAP4_SSL("imap.gmail.com")
            mail.login(req.email, req.app_password.replace(" ", ""))
            _, labels = mail.list()
            mail.logout()
            label_list = [l.decode().split('"/"')[-1].strip().strip('"') for l in labels if l]
            return {"skill": "gmail-reader", "status": "success",
                    "result": f"📁 **Gmail Labels/Folders** ({len(label_list)}):\n" + "\n".join(f"• {l}" for l in label_list[:25])}
        except Exception as e:
            return {"skill": "gmail-reader", "status": "error", "result": f"❌ Error: {str(e)}"}

    return {"skill": "gmail-reader", "status": "unsupported",
            "result": ("📧 **Gmail Manager** — supported commands:\n"
                       "• **Read inbox** — list recent emails\n"
                       "• **Send email** (with params: to, subject, body)\n"
                       "• **List labels** — show Gmail folders/categories")}


# ═══════════════════════════════════════════════════════════════════════════════
# NOTION DATABASES SKILL — read/create pages
# Uses Notion API v1
# ═══════════════════════════════════════════════════════════════════════════════

class NotionSkillRequest(BaseModel):
    task: str
    notion_token: str    # secret_xxx
    params: dict = {}

@app.post("/api/tenant/{subdomain}/skill/notion")
async def skill_notion(subdomain: str, req: NotionSkillRequest):
    import httpx

    if not req.notion_token or not req.notion_token.strip():
        return {"skill": "notion-db", "status": "error",
                "result": "❌ Notion token required. Configure in Skills → Notion Databases."}

    headers = {
        "Authorization": f"Bearer {req.notion_token}",
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
    }
    base = "https://api.notion.com/v1"
    task_lower = req.task.lower()

    async def n_get(path):
        async with httpx.AsyncClient(timeout=15) as c:
            r = await c.get(f"{base}{path}", headers=headers)
            return r.status_code, r.json()

    async def n_post(path, body):
        async with httpx.AsyncClient(timeout=15) as c:
            r = await c.post(f"{base}{path}", headers=headers, json=body)
            return r.status_code, r.json()

    # ── LIST DATABASES ────────────────────────────────────────────────────────
    if any(k in task_lower for k in ["list databases", "my databases", "databases", "all databases"]):
        status, data = await n_post("/search", {"filter": {"value": "database", "property": "object"}, "page_size": 20})
        if status != 200:
            return {"skill": "notion-db", "status": "error", "result": f"❌ Notion error: {data.get('message', data)}"}
        dbs = data.get("results", [])
        result = f"📝 **Notion Databases** ({len(dbs)}):\n\n"
        for db in dbs:
            title = db.get("title", [{}])
            name = title[0].get("text", {}).get("content", "Untitled") if title else "Untitled"
            result += f"• **{name}** — ID: `{db['id']}`\n"
        _log_activity(subdomain, "tool", f"Notion: listed {len(dbs)} databases", "dashboard")
        return {"skill": "notion-db", "status": "success", "result": result}

    # ── LIST PAGES / SEARCH ───────────────────────────────────────────────────
    if any(k in task_lower for k in ["list pages", "search", "find pages", "my pages"]):
        query = req.params.get("query", "")
        status, data = await n_post("/search", {"query": query, "page_size": 15, "filter": {"value": "page", "property": "object"}})
        if status != 200:
            return {"skill": "notion-db", "status": "error", "result": f"❌ Notion error: {data.get('message', data)}"}
        pages = data.get("results", [])
        result = f"📄 **Notion Pages** ({len(pages)}):\n\n"
        for p in pages:
            props = p.get("properties", {})
            title_prop = props.get("title") or props.get("Name") or {}
            title_list = title_prop.get("title", []) if title_prop else []
            name = title_list[0].get("text", {}).get("content", "Untitled") if title_list else "Untitled"
            result += f"• {name} — `{p['id']}`\n"
        _log_activity(subdomain, "tool", f"Notion: listed {len(pages)} pages", "dashboard")
        return {"skill": "notion-db", "status": "success", "result": result}

    # ── CREATE PAGE ───────────────────────────────────────────────────────────
    if any(k in task_lower for k in ["create page", "new page", "add page", "create note"]):
        db_id = req.params.get("database_id", "")
        title = req.params.get("title", req.task)
        content = req.params.get("content", "")
        if not db_id:
            return {"skill": "notion-db", "status": "error",
                    "result": "❌ Provide database_id in params. Use 'list databases' to find it."}
        body = {
            "parent": {"database_id": db_id},
            "properties": {"title": {"title": [{"text": {"content": title}}]}},
        }
        if content:
            body["children"] = [{"object": "block", "type": "paragraph",
                                  "paragraph": {"rich_text": [{"type": "text", "text": {"content": content}}]}}]
        status, data = await n_post("/pages", body)
        if status not in (200, 201):
            return {"skill": "notion-db", "status": "error", "result": f"❌ Failed: {data.get('message', data)}"}
        _log_activity(subdomain, "tool", f"Notion: created page '{title}'", "dashboard")
        return {"skill": "notion-db", "status": "success",
                "result": f"✅ Page created: **{title}**\n🔗 {data.get('url', '')}"}

    return {"skill": "notion-db", "status": "unsupported",
            "result": ("📝 **Notion Databases** — commands:\n"
                       "• **List databases** — see all your Notion DBs\n"
                       "• **List pages** — search pages\n"
                       "• **Create page** (params: database_id, title, content)")}


# ═══════════════════════════════════════════════════════════════════════════════
# HOME ASSISTANT SKILL — control smart home devices
# Uses Home Assistant REST API
# ═══════════════════════════════════════════════════════════════════════════════

class HomeAssistantSkillRequest(BaseModel):
    task: str
    ha_url: str          # e.g. http://homeassistant.local:8123
    ha_token: str        # Long-Lived Access Token
    params: dict = {}

@app.post("/api/tenant/{subdomain}/skill/homeassistant")
async def skill_homeassistant(subdomain: str, req: HomeAssistantSkillRequest):
    import httpx, re as _re

    if not req.ha_url or not req.ha_token:
        return {"skill": "home-controller", "status": "error",
                "result": "❌ Home Assistant URL and token required. Configure in Skills → Home Assistant."}

    base = req.ha_url.rstrip("/")
    headers = {"Authorization": f"Bearer {req.ha_token}", "Content-Type": "application/json"}
    task_lower = req.task.lower()

    async def ha_get(path):
        async with httpx.AsyncClient(timeout=10, verify=False) as c:
            r = await c.get(f"{base}{path}", headers=headers)
            return r.status_code, r.json() if r.headers.get("content-type","").startswith("application/json") else r.text

    async def ha_post(path, body=None):
        async with httpx.AsyncClient(timeout=10, verify=False) as c:
            r = await c.post(f"{base}{path}", headers=headers, json=body or {})
            return r.status_code, r.json() if r.headers.get("content-type","").startswith("application/json") else r.text

    # ── CHECK API ─────────────────────────────────────────────────────────────
    if any(k in task_lower for k in ["status", "check", "ping", "connected", "online"]):
        status, data = await ha_get("/api/")
        if status == 200:
            return {"skill": "home-controller", "status": "success",
                    "result": f"✅ **Home Assistant Connected**\n📡 {base}\n\n{data.get('message', 'API is running')}"}
        return {"skill": "home-controller", "status": "error", "result": f"❌ Cannot reach HA at {base} (HTTP {status})"}

    # ── LIST ENTITIES / DEVICES ───────────────────────────────────────────────
    if any(k in task_lower for k in ["list devices", "list entities", "all devices", "my devices", "entities"]):
        domain_filter = req.params.get("domain", "")  # e.g. "light", "switch", "sensor"
        status, data = await ha_get("/api/states")
        if status != 200:
            return {"skill": "home-controller", "status": "error", "result": f"❌ HA error: {data}"}
        entities = data if isinstance(data, list) else []
        if domain_filter:
            entities = [e for e in entities if e["entity_id"].startswith(domain_filter + ".")]
        entities = entities[:25]
        result = f"🏠 **HA Entities** ({len(entities)}{' filtered by ' + domain_filter if domain_filter else ''}):\n\n"
        for e in entities:
            eid = e["entity_id"]
            state = e["state"]
            name = e.get("attributes", {}).get("friendly_name", eid)
            result += f"• **{name}** (`{eid}`) — {state}\n"
        _log_activity(subdomain, "tool", f"HA: listed {len(entities)} entities", "dashboard")
        return {"skill": "home-controller", "status": "success", "result": result}

    # ── TURN ON/OFF ───────────────────────────────────────────────────────────
    if any(k in task_lower for k in ["turn on", "switch on", "enable", "activate"]):
        entity_id = req.params.get("entity_id", "")
        if not entity_id:
            # Try to extract from task e.g. "turn on living room light"
            entity_id = req.params.get("entity", "")
        if not entity_id:
            return {"skill": "home-controller", "status": "error",
                    "result": "❌ Specify entity_id in params. Use 'list devices' to find entity IDs."}
        domain = entity_id.split(".")[0]
        status, data = await ha_post(f"/api/services/{domain}/turn_on", {"entity_id": entity_id})
        _log_activity(subdomain, "tool", f"HA: turned ON {entity_id}", "dashboard")
        return {"skill": "home-controller", "status": "success",
                "result": f"✅ Turned ON: **{entity_id}**"}

    if any(k in task_lower for k in ["turn off", "switch off", "disable", "deactivate"]):
        entity_id = req.params.get("entity_id", req.params.get("entity", ""))
        if not entity_id:
            return {"skill": "home-controller", "status": "error",
                    "result": "❌ Specify entity_id in params."}
        domain = entity_id.split(".")[0]
        status, data = await ha_post(f"/api/services/{domain}/turn_off", {"entity_id": entity_id})
        _log_activity(subdomain, "tool", f"HA: turned OFF {entity_id}", "dashboard")
        return {"skill": "home-controller", "status": "success",
                "result": f"✅ Turned OFF: **{entity_id}**"}

    # ── GET STATE ─────────────────────────────────────────────────────────────
    if any(k in task_lower for k in ["state of", "status of", "what is", "get state"]):
        entity_id = req.params.get("entity_id", req.params.get("entity", ""))
        if entity_id:
            status, data = await ha_get(f"/api/states/{entity_id}")
            if status == 200:
                attrs = data.get("attributes", {})
                result = (f"🏠 **{attrs.get('friendly_name', entity_id)}**\n"
                          f"State: **{data['state']}**\n"
                          + "\n".join(f"• {k}: {v}" for k, v in list(attrs.items())[:10] if k != "friendly_name"))
                return {"skill": "home-controller", "status": "success", "result": result}

    return {"skill": "home-controller", "status": "unsupported",
            "result": ("🏠 **Home Assistant** — commands:\n"
                       "• **Status** — check connection\n"
                       "• **List devices** (params: domain=light/switch/sensor)\n"
                       "• **Turn on** (params: entity_id=light.living_room)\n"
                       "• **Turn off** (params: entity_id=switch.fan)\n"
                       "• **State of** (params: entity_id=sensor.temperature)")}


# ═══════════════════════════════════════════════════════════════════════════════
# CALENDAR SYNC SKILL — read/create Google Calendar events
# Uses Google Calendar API via service account or OAuth tokens
# (Simple implementation: reads events via CalDAV / Gmail IMAP calendar data)
# ═══════════════════════════════════════════════════════════════════════════════

class CalendarSkillRequest(BaseModel):
    task: str
    email: str
    app_password: str
    params: dict = {}

@app.post("/api/tenant/{subdomain}/skill/calendar")
async def skill_calendar(subdomain: str, req: CalendarSkillRequest):
    """
    Google Calendar via Google Calendar API using OAuth access token.
    Simplified: uses httpx to call googleapis directly.
    For full OAuth, the frontend should handle token exchange.
    """
    import httpx
    from datetime import datetime, timezone, timedelta

    if not req.email:
        return {"skill": "calendar-sync", "status": "error",
                "result": "❌ Google account email required."}

    task_lower = req.task.lower()
    access_token = req.params.get("access_token", "")

    # Without full OAuth, we give setup instructions
    if not access_token:
        return {
            "skill": "calendar-sync",
            "status": "setup_required",
            "result": (
                "📅 **Calendar Sync — Setup Required**\n\n"
                "Google Calendar requires OAuth 2.0 authentication.\n\n"
                "**Steps to connect:**\n"
                "1. Go to [Google Cloud Console](https://console.cloud.google.com)\n"
                "2. Create a project → Enable **Google Calendar API**\n"
                "3. Create OAuth credentials → Get your access token\n"
                "4. Pass `access_token` in the params\n\n"
                "**Alternative**: Share your calendar via iCal link and we can read events from that.\n"
                "Add `ical_url` to params with your calendar's public .ics URL."
            )
        }

    # If access token provided, call Calendar API
    headers = {"Authorization": f"Bearer {access_token}"}
    now = datetime.now(timezone.utc).isoformat()
    week_later = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()

    if any(k in task_lower for k in ["today", "upcoming", "events", "schedule", "calendar"]):
        async with httpx.AsyncClient(timeout=15) as c:
            r = await c.get(
                "https://www.googleapis.com/calendar/v3/calendars/primary/events",
                headers=headers,
                params={"timeMin": now, "timeMax": week_later, "orderBy": "startTime",
                        "singleEvents": "true", "maxResults": "15"}
            )
        if r.status_code != 200:
            return {"skill": "calendar-sync", "status": "error", "result": f"❌ Calendar error: {r.text[:200]}"}
        items = r.json().get("items", [])
        result = f"📅 **Upcoming Events** (next 7 days, {len(items)} events):\n\n"
        for ev in items:
            start = ev.get("start", {}).get("dateTime", ev.get("start", {}).get("date", ""))[:16]
            result += f"• **{ev.get('summary','(No title)')}** — {start}\n"
        _log_activity(subdomain, "tool", f"Calendar: listed {len(items)} events for {req.email}", "dashboard")
        return {"skill": "calendar-sync", "status": "success", "result": result}

    return {"skill": "calendar-sync", "status": "unsupported",
            "result": "📅 Calendar Sync: provide access_token in params and ask for 'upcoming events'."}


# ── Update unified executor to route new skills ────────────────────────────────
# (These are separate endpoints callable directly; the frontend Chat tab
#  should call /skill/execute with skill_id + params including credentials)



# ═══════════════════════════════════════════════════════════════════════════════
# DB-BACKED AGENTS — survive ECS redeploys
# Replaces the in-memory _agent_store dict
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/api/tenant/{subdomain}/agents/db")
def db_list_agents(subdomain: str, db: Session = Depends(get_db)):
    rows = db.query(models.TenantAgent).filter(models.TenantAgent.subdomain == subdomain).all()
    return [{"id": r.id, "name": r.name, "persona": r.persona, "channel": r.channel,
             "model": r.model, "enabled": r.enabled, "messagesHandled": r.messages_handled} for r in rows]

@app.post("/api/tenant/{subdomain}/agents/db")
def db_create_agent(subdomain: str, payload: AgentPayload, db: Session = Depends(get_db)):
    import uuid as _uuid
    agent_id = payload.id or f"agent-{str(_uuid.uuid4())[:8]}"
    row = models.TenantAgent(
        id=agent_id, subdomain=subdomain, name=payload.name,
        persona=payload.persona, channel=payload.channel,
        model=payload.model, enabled=payload.enabled,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    _log_activity(subdomain, "tool", f"Agent created (DB): {payload.name}", "system")
    return {"id": row.id, "name": row.name, "persona": row.persona, "channel": row.channel,
            "model": row.model, "enabled": row.enabled, "messagesHandled": row.messages_handled}

@app.put("/api/tenant/{subdomain}/agents/db/{agent_id}")
def db_update_agent(subdomain: str, agent_id: str, payload: AgentPayload, db: Session = Depends(get_db)):
    row = db.query(models.TenantAgent).filter(
        models.TenantAgent.id == agent_id,
        models.TenantAgent.subdomain == subdomain
    ).first()
    if not row:
        raise HTTPException(status_code=404, detail="Agent not found")
    if payload.name: row.name = payload.name
    if payload.persona: row.persona = payload.persona
    if payload.channel: row.channel = payload.channel
    if payload.model: row.model = payload.model
    row.enabled = payload.enabled
    db.commit()
    return {"id": row.id, "name": row.name, "persona": row.persona, "channel": row.channel,
            "model": row.model, "enabled": row.enabled, "messagesHandled": row.messages_handled}

@app.delete("/api/tenant/{subdomain}/agents/db/{agent_id}")
def db_delete_agent(subdomain: str, agent_id: str, db: Session = Depends(get_db)):
    db.query(models.TenantAgent).filter(
        models.TenantAgent.id == agent_id,
        models.TenantAgent.subdomain == subdomain
    ).delete()
    db.commit()
    return {"ok": True}


# ═══════════════════════════════════════════════════════════════════════════════
# SKILL CREDENTIALS — stored in DB, not localStorage
# ═══════════════════════════════════════════════════════════════════════════════

import json as _json

class SkillCredPayload(BaseModel):
    skill_id: str
    credentials: dict

@app.get("/api/tenant/{subdomain}/skill-creds")
def get_all_skill_creds(subdomain: str, db: Session = Depends(get_db)):
    """Return all skill credentials for this tenant (keys only, values masked)."""
    rows = db.query(models.TenantSkillCredential).filter(
        models.TenantSkillCredential.subdomain == subdomain
    ).all()
    result = {}
    for r in rows:
        creds = _json.loads(r.credentials)
        # Mask only sensitive values for security
        masked = {}
        for k, v in creds.items():
            if any(s in k.lower() for s in ["password", "token", "secret", "key"]):
                masked[k] = "***" if v else ""
            else:
                masked[k] = v if v is not None else ""
        result[r.skill_id] = masked
    return result

@app.get("/api/tenant/{subdomain}/skill-creds/{skill_id}")
def get_skill_creds(subdomain: str, skill_id: str, db: Session = Depends(get_db)):
    """Return actual credentials for a skill (used by skill handlers)."""
    row = db.query(models.TenantSkillCredential).filter(
        models.TenantSkillCredential.subdomain == subdomain,
        models.TenantSkillCredential.skill_id == skill_id
    ).first()
    if not row:
        return {}
    return _json.loads(row.credentials)

@app.post("/api/tenant/{subdomain}/skill-creds")
def save_skill_creds(subdomain: str, payload: SkillCredPayload, db: Session = Depends(get_db)):
    """Save or update skill credentials in the DB."""
    row = db.query(models.TenantSkillCredential).filter(
        models.TenantSkillCredential.subdomain == subdomain,
        models.TenantSkillCredential.skill_id == payload.skill_id
    ).first()
    
    new_creds = payload.credentials
    if row:
        existing_creds = _json.loads(row.credentials)
        # Merge: if new value is "***", keep the existing value
        for k, v in new_creds.items():
            if v == "***" and k in existing_creds:
                new_creds[k] = existing_creds[k]
        row.credentials = _json.dumps(new_creds)
    else:
        # If it's a new row, and any value is "***", we should replace it with empty (since there is no existing value)
        for k, v in new_creds.items():
            if v == "***":
                new_creds[k] = ""
        row = models.TenantSkillCredential(
            subdomain=subdomain,
            skill_id=payload.skill_id,
            credentials=_json.dumps(new_creds),
        )
        db.add(row)
    db.commit()
    _log_activity(subdomain, "tool", f"Skill credentials saved: {payload.skill_id}", "system")
    return {"ok": True, "skill_id": payload.skill_id}

@app.delete("/api/tenant/{subdomain}/skill-creds/{skill_id}")
def delete_skill_creds(subdomain: str, skill_id: str, db: Session = Depends(get_db)):
    db.query(models.TenantSkillCredential).filter(
        models.TenantSkillCredential.subdomain == subdomain,
        models.TenantSkillCredential.skill_id == skill_id
    ).delete()
    db.commit()
    return {"ok": True}


# ═══════════════════════════════════════════════════════════════════════════════
# SCHEDULER — DB-backed cron jobs with APScheduler
# ═══════════════════════════════════════════════════════════════════════════════

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
import httpx as _httpx

_scheduler = AsyncIOScheduler()

# Cron preset → cron expression mapping
CRON_PRESETS = {
    "every-minute":   "* * * * *",
    "every-5-min":    "*/5 * * * *",
    "every-30-min":   "*/30 * * * *",
    "hourly":         "0 * * * *",
    "daily-morning":  "0 9 * * *",
    "daily-evening":  "0 18 * * *",
    "daily-midnight": "0 0 * * *",
    "weekly-monday":  "0 9 * * 1",
    "weekly-friday":  "0 17 * * 5",
    "monthly-1st":    "0 9 1 * *",
}

def _cron_expr_from_preset(preset: str) -> str:
    return CRON_PRESETS.get(preset, preset)  # fall back to raw cron string


async def _run_scheduled_task(subdomain: str, schedule_id: str, task: str):
    """Execute a scheduled task by calling the tenant chat endpoint."""
    from sqlalchemy.orm import sessionmaker
    from .db.database import engine
    SessionLocal2 = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal2()
    try:
        backend_url = os.getenv("BACKEND_URL", "http://localhost:8000")
        async with _httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{backend_url}/api/tenant/{subdomain}/chat",
                json={"message": task, "session_id": f"scheduler-{schedule_id}"}
            )
            if resp.status_code == 200:
                data = resp.json()
                msg = data.get("response")
                if msg:
                    # Look up allowed numbers
                    import os
                    cfg = db.query(models.CustomerConfig).join(models.Customer).filter(models.Customer.subdomain == subdomain).first()
                    if cfg and cfg.allowed_numbers:
                        numbers = [n.strip().replace('+', '') for n in cfg.allowed_numbers.split(',')]
                        # find worker port
                        port_file = os.path.join(os.path.dirname(__file__), "whatsapp", "sessions", f"wa_{subdomain}_port.txt")
                        if os.path.exists(port_file):
                            with open(port_file) as f:
                                port = f.read().strip()
                            for num in numbers:
                                try:
                                    await client.post(f"http://127.0.0.1:{port}/send", json={"to": num, "message": msg})
                                except:
                                    pass

        now = datetime.now(timezone.utc).isoformat()
        row = db.query(models.TenantSchedule).filter(models.TenantSchedule.id == schedule_id).first()
        if row:
            row.last_run = now
            db.commit()
        _log_activity(subdomain, "tool", f"Scheduled task ran: {task[:60]}", "system")
    except Exception as e:
        _log_activity(subdomain, "error", f"Scheduler error [{schedule_id}]: {str(e)}", "system")
    finally:
        db.close()

def _register_schedule(row: models.TenantSchedule):
    """Add a job to APScheduler from a DB schedule row."""
    try:
        cron = _cron_expr_from_preset(row.cron_preset)
        parts = cron.split()
        if len(parts) == 5:
            minute, hour, day, month, day_of_week = parts
            _scheduler.add_job(
                _run_scheduled_task,
                CronTrigger(minute=minute, hour=hour, day=day, month=month, day_of_week=day_of_week),
                args=[row.subdomain, row.id, row.task],
                id=row.id,
                replace_existing=True,
                misfire_grace_time=60,
            )
    except Exception as e:
        print(f"[Scheduler] Failed to register {row.id}: {e}")

async def ensure_whatsapp_running(subdomain: str):
    session_id = f"wa_{subdomain}"
    sessions_dir = os.path.join(os.path.dirname(__file__), "whatsapp", "sessions")
    pid_file = os.path.join(sessions_dir, f"{session_id}.pid")
    
    running = False
    if os.path.exists(pid_file):
        try:
            with open(pid_file, 'r') as f:
                pid = int(f.read().strip())
            os.kill(pid, 0)
            running = True
        except Exception:
            pass
            
    if not running:
        print(f"[WhatsApp] Worker for {subdomain} is not running. Auto-starting...")
        try:
            await start_whatsapp(subdomain)
        except Exception as e:
            print(f"[WhatsApp] Failed to auto-start worker for {subdomain}: {e}")

async def auto_start_whatsapp_sessions():
    sessions_dir = os.path.join(os.path.dirname(__file__), "whatsapp", "sessions")
    if not os.path.exists(sessions_dir):
        return
    for name in os.listdir(sessions_dir):
        path_dir = os.path.join(sessions_dir, name)
        if os.path.isdir(path_dir) and name.startswith("wa_"):
            subdomain = name[3:]
            if os.listdir(path_dir):
                print(f"[WhatsApp] Auto-starting WhatsApp worker for tenant: {subdomain}")
                try:
                    await start_whatsapp(subdomain)
                except Exception as e:
                    print(f"[WhatsApp] Failed to auto-start worker for {subdomain}: {e}")

async def process_tenant_gmail_forwarder(db: Session, subdomain: str, skill_cred_row: models.TenantSkillCredential):
    import json
    import imaplib
    import email as email_lib
    from email.header import decode_header
    import re
    import datetime
    import httpx
    import os
    import asyncio

    # Ensure WhatsApp is running and connected before checking emails
    await ensure_whatsapp_running(subdomain)
    
    session_id = f"wa_{subdomain}"
    sessions_dir = os.path.join(os.path.dirname(__file__), "whatsapp", "sessions")
    port_file = os.path.join(sessions_dir, f"{session_id}_port.txt")
    status_file = os.path.join(sessions_dir, f"{session_id}_status.json")
    
    # Wait up to 5 seconds if the session was just started to let it open and write the port file
    for _ in range(5):
        if os.path.exists(port_file) and os.path.exists(status_file):
            try:
                with open(status_file) as sf:
                    status_data = json.load(sf)
                if status_data.get("state") == "connected":
                    break
            except:
                pass
        await asyncio.sleep(1)
        
    if not os.path.exists(port_file):
        _log_activity(subdomain, "error", "WhatsApp session not active or connecting. Skipping email check until connected.", "system")
        return

    try:
        creds = json.loads(skill_cred_row.credentials)
    except Exception as e:
        print(f"[GmailForwarder] Failed to parse credentials JSON for {subdomain}: {e}")
        return

    email_address = creds.get("email")
    app_password = creds.get("app_password")
    whatsapp_group_jid = creds.get("whatsapp_group_jid")
    search_query = creds.get("search_query", "(payment OR payments OR transfer OR transfers OR receive OR received OR paying OR deposit OR deposited OR paid)")
    last_uid = creds.get("last_uid")

    if not email_address or not app_password or not whatsapp_group_jid:
        return

    # Clean app password
    app_password = app_password.replace(" ", "")

    # Connect to IMAP
    mail = imaplib.IMAP4_SSL("imap.gmail.com")
    try:
        mail.login(email_address, app_password)
    except Exception as e:
        _log_activity(subdomain, "error", f"Gmail Forwarder login failed for {email_address}: {str(e)[:100]}", "system")
        return

    try:
        mail.select("inbox")

        since_date_imap = (datetime.date.today() - datetime.timedelta(days=1)).strftime("%d-%b-%Y")
        since_date_gmail = (datetime.date.today() - datetime.timedelta(days=1)).strftime("%Y/%m/%d")
        
        # Try search with Gmail custom raw search
        try:
            status, messages = mail.uid('search', 'X-GM-RAW', f'"{search_query} after:{since_date_gmail}"')
        except Exception as e:
            print(f"[GmailForwarder] X-GM-RAW search failed: {e}. Falling back to standard SINCE search.")
            try:
                status, messages = mail.uid('search', 'SINCE', since_date_imap)
            except Exception as e2:
                print(f"[GmailForwarder] Fallback search failed: {e2}")
                return
                
        if not messages[0]:
            return

        uids = [int(x) for x in messages[0].split()]
        if not uids:
            return

        uids.sort()
        highest_uid = uids[-1]

        if last_uid is None:
            creds["last_uid"] = highest_uid
            skill_cred_row.credentials = json.dumps(creds)
            db.commit()
            _log_activity(subdomain, "tool", f"Gmail Forwarder initialized. Monitoring new messages.", "system")
            return

        new_uids = [u for u in uids if u > last_uid]
        if not new_uids:
            return

        customer = db.query(models.Customer).filter(models.Customer.subdomain == subdomain).first()
        if not customer or not customer.config:
            return

        config = customer.config
        max_uid_processed = last_uid

        for uid in new_uids:
            try:
                status, data = mail.uid('fetch', str(uid), '(RFC822)')
                if status != "OK" or not data or not data[0]:
                    continue

                msg = email_lib.message_from_bytes(data[0][1])

                def decode_str(s):
                    if s is None: return ""
                    parts = decode_header(s)
                    return "".join(p.decode(enc or "utf-8") if isinstance(p, bytes) else p for p, enc in parts)

                subject = decode_str(msg["Subject"])
                sender = decode_str(msg["From"])

                body = ""
                if msg.is_multipart():
                    for part in msg.walk():
                        content_type = part.get_content_type()
                        content_disposition = str(part.get("Content-Disposition"))
                        if content_type == "text/plain" and "attachment" not in content_disposition:
                            try:
                                body = part.get_payload(decode=True).decode("utf-8", errors="ignore")
                            except:
                                pass
                            break
                else:
                    try:
                        body = msg.get_payload(decode=True).decode("utf-8", errors="ignore")
                    except:
                        pass

                body_clean = re.sub(r'\s+', ' ', body).strip()

                parsed_payment = None

                prompt = f"""You are an advanced financial analyst agent specializing in parsing email notifications for incoming payments and deposits.

Your task is to analyze the following email and determine if it is a notification of an INCOMING payment or deposit RECEIVED by us/the recipient.

Email From: {sender}
Subject: {subject}
Body: {body_clean[:1500]}

CRITICAL RULES for classification:
1. `is_payment` MUST be `true` only if the email states that funds/money have actually been RECEIVED by, DEPOSITED to, or PAID to the recipient.
2. `is_payment` MUST be `false` if the email is:
   - A request for payment, invoice, or bill (e.g., "payment due", "please make the payment", "invoice #123").
   - An outgoing payment receipt or confirmation for a purchase/payment made BY the recipient (e.g., "receipt for your payment", "thank you for your order").
   - A notification of a payment request or pending payment from someone else.

FEW-SHOT EXAMPLES:

Example 1 (Incoming Payment Done):
- Input Body: "Sarah Miller transferred 750 USD for invoice #1029."
- Thought Process: The text states money has been transferred by Sarah Miller to us. This is a completed incoming payment.
- Output JSON:
{{
  "thought_process": "The email states money has been transferred by Sarah Miller to us. This is a completed incoming payment.",
  "is_payment": true,
  "amount": 750.0,
  "currency": "USD",
  "sender": "Sarah Miller",
  "summary": "Transferred 750 USD for invoice #1029."
}}

Example 2 (Payment Request / Invoice):
- Input Body: "Please make the payment of $30 as soon as possible."
- Thought Process: This is a request to make a payment, not a notification of a payment received.
- Output JSON:
{{
  "thought_process": "This is a request for payment, not a completed deposit.",
  "is_payment": false
}}

Example 3 (Outgoing Payment Receipt):
- Input Body: "Receipt for your payment of $15.00 to OpenAI."
- Thought Process: This is an outgoing payment receipt for a purchase made by the recipient, not an incoming payment received.
- Output JSON:
{{
  "thought_process": "This is an outgoing receipt for a payment made by us, not an incoming payment.",
  "is_payment": false
}}

Return a JSON object with this structure (nothing else):
{{
  "thought_process": "Step-by-step reasoning about whether the payment is completed, incoming, and who the sender/recipient are.",
  "is_payment": true or false,
  "amount": 123.45 (only if is_payment is true),
  "currency": "USD/AUD/EUR" (only if is_payment is true),
  "sender": "Sender Name" (only if is_payment is true),
  "summary": "One-sentence summary" (only if is_payment is true)
}}"""

                # Try OpenAI
                if config.openai_api_key:
                    try:
                        import openai
                        client = openai.OpenAI(api_key=config.openai_api_key)
                        completion = client.chat.completions.create(
                            model="gpt-4o-mini",
                            messages=[{"role": "user", "content": prompt}],
                            response_format={"type": "json_object"}
                        )
                        res_json = json.loads(completion.choices[0].message.content)
                        if isinstance(res_json, dict) and "is_payment" in res_json:
                            parsed_payment = res_json
                    except Exception as e:
                        print(f"[GmailForwarder] OpenAI parse failed: {e}")

                # Try Gemini
                if not parsed_payment and config.gemini_token:
                    try:
                        import google.generativeai as genai
                        genai.configure(api_key=config.gemini_token)
                        model = genai.GenerativeModel('gemini-1.5-flash')
                        response = model.generate_content(prompt)
                        json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
                        if json_match:
                            res_json = json.loads(json_match.group(0))
                            if isinstance(res_json, dict) and "is_payment" in res_json:
                                parsed_payment = res_json
                    except Exception as e:
                        print(f"[GmailForwarder] Gemini parse failed: {e}")

                # Regex Fallback
                if not parsed_payment:
                    text_to_search = f"{subject} {body_clean[:500]}"
                    amount_match = re.search(r'(?:\$\s*|USD\s*|AUD\s*|EUR\s*|£\s*|¥\s*)?(\d+(?:\.\d{2})?)(?:\s*(?:AUD|USD|EUR|GBP|JPY|cents|dollars))?', text_to_search, re.IGNORECASE)
                    keywords = ["payment", "transfer", "receive", "sent", "paid", "received", "transferred", "receipt"]
                    has_keyword = any(k in text_to_search.lower() for k in keywords)

                    if amount_match and has_keyword:
                        sender_name = sender
                        sender_match = re.search(r'"?([^"<]+)"?\s*<', sender)
                        if sender_match:
                            sender_name = sender_match.group(1).strip()

                        curr = "USD"
                        if "aud" in text_to_search.lower():
                            curr = "AUD"
                        elif "eur" in text_to_search.lower() or "€" in text_to_search:
                            curr = "EUR"
                        elif "gbp" in text_to_search.lower() or "£" in text_to_search:
                            curr = "GBP"

                        parsed_payment = {
                            "is_payment": True,
                            "amount": float(amount_match.group(1).replace(",", "")),
                            "currency": curr,
                            "sender": sender_name,
                            "summary": f"Detected payment of {amount_match.group(0)} from {sender_name}."
                        }

                if parsed_payment and parsed_payment.get("is_payment"):
                    amount_val = parsed_payment.get("amount")
                    currency_val = parsed_payment.get("currency", "USD")
                    sender_val = parsed_payment.get("sender")
                    summary_val = parsed_payment.get("summary")

                    # Parse sender email and name from header
                    sender_name_hdr = sender
                    sender_email_hdr = ""
                    sender_match_hdr = re.search(r'"?([^"<]+)"?\s*<([^>]+)>', sender)
                    if sender_match_hdr:
                        sender_name_hdr = sender_match_hdr.group(1).strip()
                        sender_email_hdr = sender_match_hdr.group(2).strip()
                    else:
                        email_match_hdr = re.search(r'<([^>]+)>', sender)
                        if email_match_hdr:
                            sender_email_hdr = email_match_hdr.group(1).strip()
                            sender_name_hdr = sender_email_hdr.split('@')[0]
                        else:
                            sender_email_hdr = sender

                    msg_text = (
                        f"💰 *Payment Notification*\n\n"
                        f"👤 *Email Sender:* {sender_name_hdr} ({sender_email_hdr})\n"
                        f"👤 *Payer/Client:* {sender_val}\n"
                        f"💵 *Amount:* {amount_val} {currency_val}\n"
                        f"📝 *Summary:* {summary_val}\n\n"
                        f"⚡ _FastClaw Gmail Automator_"
                    )

                    port_file = os.path.join(os.path.dirname(__file__), "whatsapp", "sessions", f"wa_{subdomain}_port.txt")
                    if os.path.exists(port_file):
                        with open(port_file) as f:
                            port = f.read().strip()
                        async with httpx.AsyncClient(timeout=15) as client:
                            try:
                                resp = await client.post(
                                    f"http://127.0.0.1:{port}/send",
                                    json={"to": whatsapp_group_jid, "message": msg_text}
                                )
                                if resp.status_code == 200:
                                    _log_activity(subdomain, "tool", f"Forwarded payment alert: {amount_val} {currency_val} from {sender_val}", "system")
                                else:
                                    _log_activity(subdomain, "error", f"Failed to forward payment alert via WhatsApp: HTTP {resp.status_code}", "system")
                            except Exception as e:
                                _log_activity(subdomain, "error", f"WhatsApp API request failed: {str(e)[:100]}", "system")
                    else:
                        _log_activity(subdomain, "error", "WhatsApp session not active. Connect in WhatsApp Tab.", "system")

                max_uid_processed = max(max_uid_processed, uid)

            except Exception as e:
                print(f"[GmailForwarder] Error processing email UID {uid} for {subdomain}: {e}")

        # Update last processed UID
        creds["last_uid"] = max_uid_processed
        skill_cred_row.credentials = json.dumps(creds)
        db.commit()

    finally:
        try:
            mail.logout()
        except:
            pass

async def check_all_gmail_payment_forwarders():
    from sqlalchemy.orm import sessionmaker
    from .db.database import engine

    SessionLocal2 = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal2()
    try:
        # Get all credentials for the gmail-payment-forwarder skill
        creds_rows = db.query(models.TenantSkillCredential).filter(
            models.TenantSkillCredential.skill_id == "gmail-payment-forwarder"
        ).all()

        for row in creds_rows:
            try:
                await process_tenant_gmail_forwarder(db, row.subdomain, row)
            except Exception as e:
                print(f"[GmailForwarder] Error processing subdomain {row.subdomain}: {e}")
    except Exception as e:
        print(f"[GmailForwarder] Global check error: {e}")
    finally:
        db.close()

@app.on_event("startup")
async def start_scheduler():
    """Load all enabled schedules from DB and start APScheduler on app boot."""
    from sqlalchemy.orm import sessionmaker
    from .db.database import engine
    SessionLocal2 = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal2()
    try:
        # Auto-start any previously connected/configured WhatsApp sessions
        await auto_start_whatsapp_sessions()
        
        rows = db.query(models.TenantSchedule).filter(models.TenantSchedule.enabled == True).all()
        for row in rows:
            _register_schedule(row)
        
        # Add periodic job to check gmail-payment-forwarder every 1 minute
        _scheduler.add_job(
            check_all_gmail_payment_forwarders,
            "interval",
            minutes=1,
            id="gmail_payment_forwarder_job",
            replace_existing=True
        )
        
        _scheduler.start()
        print(f"[Scheduler] Started with {len(rows)} active jobs plus Gmail forwarder")
    except Exception as e:
        print(f"[Scheduler] Startup error: {e}")
    finally:
        db.close()

@app.on_event("shutdown")
async def stop_scheduler():
    if _scheduler.running:
        _scheduler.shutdown(wait=False)


class SchedulePayload(BaseModel):
    id: str | None = None
    name: str
    cron_preset: str = "daily-morning"
    task: str
    enabled: bool = True

@app.get("/api/tenant/{subdomain}/schedules/db")
def db_list_schedules(subdomain: str, db: Session = Depends(get_db)):
    rows = db.query(models.TenantSchedule).filter(models.TenantSchedule.subdomain == subdomain).all()
    return [{
        "id": r.id, "name": r.name, "cron": r.cron_preset,
        "cron_expr": _cron_expr_from_preset(r.cron_preset),
        "task": r.task, "enabled": r.enabled,
        "lastRun": r.last_run or "", "nextRun": r.next_run or "",
    } for r in rows]

@app.post("/api/tenant/{subdomain}/schedules/db")
def db_create_schedule(subdomain: str, payload: SchedulePayload, db: Session = Depends(get_db)):
    import uuid as _uuid
    sid = payload.id or f"sched-{str(_uuid.uuid4())[:8]}"
    cron = _cron_expr_from_preset(payload.cron_preset)
    row = models.TenantSchedule(
        id=sid, subdomain=subdomain, name=payload.name,
        cron_preset=payload.cron_preset, cron_expr=cron,
        task=payload.task, enabled=payload.enabled,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    # Register in running scheduler
    if payload.enabled:
        _register_schedule(row)
    _log_activity(subdomain, "tool", f"Schedule created: {payload.name} ({payload.cron_preset})", "system")
    return {"id": row.id, "name": row.name, "cron": row.cron_preset, "cron_expr": cron,
            "task": row.task, "enabled": row.enabled, "lastRun": "", "nextRun": ""}

@app.put("/api/tenant/{subdomain}/schedules/db/{sched_id}")
def db_update_schedule(subdomain: str, sched_id: str, payload: SchedulePayload, db: Session = Depends(get_db)):
    row = db.query(models.TenantSchedule).filter(
        models.TenantSchedule.id == sched_id,
        models.TenantSchedule.subdomain == subdomain,
    ).first()
    if not row:
        raise HTTPException(status_code=404, detail="Schedule not found")
    row.name = payload.name
    row.cron_preset = payload.cron_preset
    row.cron_expr = _cron_expr_from_preset(payload.cron_preset)
    row.task = payload.task
    row.enabled = payload.enabled
    db.commit()
    # Re-register or remove from scheduler
    if payload.enabled:
        _register_schedule(row)
    else:
        try: _scheduler.remove_job(sched_id)
        except: pass
    return {"id": row.id, "name": row.name, "cron": row.cron_preset, "enabled": row.enabled}

@app.delete("/api/tenant/{subdomain}/schedules/db/{sched_id}")
def db_delete_schedule(subdomain: str, sched_id: str, db: Session = Depends(get_db)):
    db.query(models.TenantSchedule).filter(
        models.TenantSchedule.id == sched_id,
        models.TenantSchedule.subdomain == subdomain,
    ).delete()
    db.commit()
    try: _scheduler.remove_job(sched_id)
    except: pass
    return {"ok": True}


# ═══════════════════════════════════════════════════════════════════════════════
# CALENDAR SYNC — iCal URL approach (works with Google Calendar public link)
# No OAuth needed: user shares their calendar as public iCal URL
# ═══════════════════════════════════════════════════════════════════════════════

class ICalSkillRequest(BaseModel):
    task: str
    ical_url: str         # Google Calendar public .ics URL
    params: dict = {}

@app.post("/api/tenant/{subdomain}/skill/calendar/ical")
async def skill_calendar_ical(subdomain: str, req: ICalSkillRequest):
    """Read Google Calendar events via public iCal URL — no OAuth needed."""
    import httpx
    try:
        from icalendar import Calendar
    except ImportError:
        return {"skill": "calendar-sync", "status": "error", "result": "icalendar package not available."}

    if not req.ical_url:
        return {
            "skill": "calendar-sync",
            "status": "setup_required",
            "result": (
                "📅 **Calendar Sync — iCal Setup**\n\n"
                "**How to get your Google Calendar iCal URL:**\n"
                "1. Open [Google Calendar](https://calendar.google.com)\n"
                "2. Click ⚙️ Settings → your calendar → **Integrate calendar**\n"
                "3. Copy the **Secret address in iCal format** (ends in `.ics`)\n"
                "4. Paste it in the `ical_url` field when configuring this skill\n\n"
                "✅ No OAuth required — works with the private iCal link."
            )
        }

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(req.ical_url)
        if resp.status_code != 200:
            return {"skill": "calendar-sync", "status": "error",
                    "result": f"❌ Could not fetch calendar (HTTP {resp.status_code}). Check the iCal URL."}

        cal = Calendar.from_ical(resp.content)
        from datetime import datetime as _dt, timezone as _tz, timedelta as _td
        now = _dt.now(_tz.utc)
        task_lower = req.task.lower()

        events = []
        for component in cal.walk():
            if component.name != "VEVENT":
                continue
            dtstart = component.get("dtstart")
            if not dtstart:
                continue
            start = dtstart.dt
            if hasattr(start, "date") and not hasattr(start, "hour"):
                from datetime import datetime as _dt2
                start = _dt2(start.year, start.month, start.day, tzinfo=_tz.utc)
            if not hasattr(start, "tzinfo") or start.tzinfo is None:
                start = start.replace(tzinfo=_tz.utc)

            summary = str(component.get("summary", "(No title)"))
            location = str(component.get("location", ""))
            events.append({"start": start, "summary": summary, "location": location})

        events.sort(key=lambda e: e["start"])

        # Filter based on task
        if any(k in task_lower for k in ["today"]):
            today = now.date()
            events = [e for e in events if e["start"].date() == today]
            label = "Today's Events"
        elif any(k in task_lower for k in ["tomorrow"]):
            tomorrow = (now + _td(days=1)).date()
            events = [e for e in events if e["start"].date() == tomorrow]
            label = "Tomorrow's Events"
        elif any(k in task_lower for k in ["week", "upcoming", "next 7"]):
            events = [e for e in events if now <= e["start"] <= now + _td(days=7)]
            label = "Upcoming Events (next 7 days)"
        elif any(k in task_lower for k in ["month", "next 30"]):
            events = [e for e in events if now <= e["start"] <= now + _td(days=30)]
            label = "Events this month"
        else:
            events = [e for e in events if e["start"] >= now][:15]
            label = "Upcoming Events"

        if not events:
            result = f"📅 **{label}** — No events found."
        else:
            result = f"📅 **{label}** ({len(events)} events):\n\n"
            for e in events[:20]:
                ts = e["start"].strftime("%a %b %d, %H:%M")
                loc = f" @ {e['location']}" if e["location"] and e["location"] != "None" else ""
                result += f"• **{e['summary']}** — {ts}{loc}\n"

        _log_activity(subdomain, "tool", f"Calendar: read {len(events)} events", "dashboard")
        return {"skill": "calendar-sync", "status": "success", "result": result}

    except Exception as e:
        return {"skill": "calendar-sync", "status": "error", "result": f"❌ Calendar error: {str(e)}"}

