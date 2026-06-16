"use client";
import { useState, useEffect, useRef } from 'react';

interface ActivityEvent {
  id: number;
  type: 'message' | 'tool' | 'error';
  summary: string;
  channel: string;
  time: string;
}

interface Session {
  id: string;
  sender: string;
  channel: string;
  last_message?: string;
  last_active?: string;
}

interface TranscriptMsg {
  role: string;
  content: string;
  time: string;
}

const channelColor: Record<string, string> = {
  whatsapp: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  telegram: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  discord: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  slack: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  dashboard: 'bg-zinc-800 text-zinc-400 border-white/10',
  system: 'bg-zinc-800 text-zinc-400 border-white/10',
};

export function ActivityTab({ subdomain, backendUrl }: { subdomain: string; backendUrl: string }) {
  const [feed, setFeed] = useState<ActivityEvent[]>([]);

  const load = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/tenant/${subdomain}/activity`);
      if (res.ok) setFeed(await res.json());
    } catch {}
  };

  useEffect(() => { load(); }, [subdomain]);

  return (
    <div className="p-8 overflow-y-auto h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">⚡ Live Activity</h1>
          <p className="text-zinc-400 text-sm mt-1">Real-time feed of agent tool calls and channel events</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/10 hover:border-white/30 text-zinc-300 text-sm font-medium rounded-xl transition-colors">
          🔄 Refresh
        </button>
      </div>

      {feed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-5xl mb-4">⚡</div>
          <h3 className="text-zinc-400 font-medium">No activity yet</h3>
          <p className="text-zinc-600 text-sm mt-1">Activity appears here as your agent processes messages.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {feed.map(ev => (
            <div key={ev.id} className="bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-sm ${
                ev.type === 'error' ? 'bg-red-500/10 text-red-400' :
                ev.type === 'tool' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
              }`}>
                {ev.type === 'error' ? '⚠️' : ev.type === 'tool' ? '🔧' : '✓'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-200">{ev.summary}</p>
                <p className="text-xs text-zinc-600 mt-0.5">{ev.time}</p>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase shrink-0 ${channelColor[ev.channel] || channelColor.system}`}>
                {ev.channel}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function SessionsTab({ subdomain, backendUrl }: { subdomain: string; backendUrl: string }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [transcript, setTranscript] = useState<TranscriptMsg[] | null>(null);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${backendUrl}/api/tenant/${subdomain}/sessions`);
        if (res.ok) setSessions(await res.json());
      } catch {}
    })();
  }, [subdomain]);

  const openTranscript = async (id: string) => {
    setActiveId(id);
    setTranscript([]);
    try {
      const res = await fetch(`${backendUrl}/api/tenant/${subdomain}/sessions/${encodeURIComponent(id)}/messages`);
      if (res.ok) setTranscript(await res.json());
    } catch {}
  };

  return (
    <div className="p-8 overflow-y-auto h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">🗂️ Sessions</h1>
          <p className="text-zinc-400 text-sm mt-1">Active and recent AI agent conversations</p>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-5xl mb-4">🗂️</div>
          <h3 className="text-zinc-400 font-medium">No sessions yet</h3>
          <p className="text-zinc-600 text-sm mt-1">Sessions appear here when users message your agent via WhatsApp, Telegram, etc.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map(sess => (
            <div
              key={sess.id}
              onClick={() => openTranscript(sess.id)}
              className="bg-zinc-950 border border-white/10 hover:border-white/30 rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {(sess.sender || '?').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm">{sess.sender || 'Unknown'}</p>
                <p className="text-xs text-zinc-500 truncate">{sess.last_message || 'No messages'}</p>
              </div>
              <div className="text-right shrink-0">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase ${channelColor[sess.channel] || channelColor.system}`}>
                  {sess.channel}
                </span>
                <p className="text-xs text-zinc-600 mt-1">{sess.last_active}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transcript Modal */}
      {transcript !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setTranscript(null)} />
          <div className="relative bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 className="font-bold text-white">
                💬 Session: <span className="font-mono text-indigo-400 text-sm ml-1">{activeId}</span>
              </h3>
              <button onClick={() => setTranscript(null)} className="text-zinc-500 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {transcript.length === 0 ? (
                <p className="text-zinc-600 text-sm text-center py-8">No messages in this session.</p>
              ) : transcript.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-4 py-2.5 text-sm max-w-sm rounded-2xl ${
                    msg.role === 'user' ? 'bg-white text-black rounded-br-sm' : 'bg-zinc-900 text-zinc-100 rounded-bl-sm'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <p className="text-[10px] mt-1 opacity-50">{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function LiveLogsTab({ subdomain, backendUrl }: { subdomain: string; backendUrl: string }) {
  const [lines, setLines] = useState<Array<{ id: number; level: string; message: string; time: string; channel: string }>>([]);
  const [tailing, setTailing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const counterRef = useRef(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/tenant/${subdomain}/logs/tail`);
      if (res.ok) {
        const data = await res.json();
        setLines(prev => {
          const existingKeys = new Set(prev.map(l => `${l.time}|${l.message}`));
          const newLines = data.filter((l: any) => !existingKeys.has(`${l.time}|${l.message}`))
            .map((l: any) => ({ ...l, id: ++counterRef.current }));
          const merged = [...newLines, ...prev].slice(0, 200);
          return merged;
        });
      }
    } catch {}
  };

  const toggle = () => {
    if (tailing) {
      if (timerRef.current) clearInterval(timerRef.current);
      setTailing(false);
    } else {
      setTailing(true);
      fetchLogs();
      timerRef.current = setInterval(fetchLogs, 3000);
    }
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [lines]);

  return (
    <div className="p-8 overflow-y-auto h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">📋 Live Logs</h1>
          <p className="text-zinc-400 text-sm mt-1">Real-time stream of all agent activity</p>
        </div>
        <div className="flex gap-2">
          <button onClick={toggle} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-colors ${tailing ? 'bg-emerald-600 text-white' : 'bg-zinc-900 border border-white/10 text-zinc-300 hover:border-white/30'}`}>
            {tailing ? '⏸ Live' : '▶ Start'}
            {tailing && <span className="w-2 h-2 bg-white rounded-full animate-pulse" />}
          </button>
          <button onClick={() => setLines([])} className="px-3 py-2 bg-zinc-900 border border-white/10 text-zinc-500 hover:text-white text-sm rounded-xl transition-colors">🗑️</button>
        </div>
      </div>

      <div className="bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 bg-black border-b border-white/10">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="ml-2 text-zinc-500 text-xs font-mono">agent.log — live tail</span>
          {tailing && (
            <span className="ml-auto flex items-center gap-1.5 text-emerald-400 text-xs">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> LIVE
            </span>
          )}
        </div>
        <div className="h-96 overflow-y-auto p-4 font-mono text-xs space-y-1">
          {lines.length === 0 ? (
            <p className="text-zinc-600">Waiting for log entries… Click &quot;Start&quot; to begin tailing.</p>
          ) : [...lines].reverse().map(line => (
            <div key={line.id} className="flex gap-3">
              <span className="text-zinc-600 shrink-0">{line.time}</span>
              <span className={`shrink-0 w-12 ${line.level === 'ERROR' ? 'text-red-400' : 'text-emerald-400'}`}>{line.level}</span>
              <span className={line.level === 'ERROR' ? 'text-red-300' : 'text-zinc-300'}>[{line.channel}] {line.message}</span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}
