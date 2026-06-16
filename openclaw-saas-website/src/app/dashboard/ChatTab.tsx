"use client";
import { useState, useRef, useEffect, useCallback } from 'react';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  time: string;
  tool?: string;
}

const SUGGESTIONS = [
  'What can you help me with?',
  'Summarise my recent WhatsApp messages',
  'What integrations am I using?',
  'Help me schedule a task',
];

// ---------- Icons ----------
const SendIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const MicIcon = ({ active }: { active: boolean }) => (
  <svg className={`w-4 h-4 ${active ? 'text-red-400' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
  </svg>
);

const SpeakerIcon = ({ on }: { on: boolean }) => (
  <svg className={`w-4 h-4 ${on ? 'text-indigo-400' : 'text-zinc-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    {on ? (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M11 5L6 9H2v6h4l5 4V5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
      </>
    ) : (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M11 5L6 9H2v6h4l5 4V5z" />
        <line x1="23" y1="9" x2="17" y2="15" strokeLinecap="round" strokeWidth={2} />
        <line x1="17" y1="9" x2="23" y2="15" strokeLinecap="round" strokeWidth={2} />
      </>
    )}
  </svg>
);

// ---------- Speech helpers ----------
function speak(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'en-US';
  utter.rate = 1.05;
  window.speechSynthesis.speak(utter);
}

function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// ---------- Component ----------
export default function ChatTab({ subdomain, backendUrl }: { subdomain: string; backendUrl: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // voice state
  const [isListening, setIsListening] = useState(false);
  const [voiceOut, setVoiceOut] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check browser support
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    setVoiceSupported(!!SR);
  }, []);

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages, loading]);

  // ---------- Send ----------
  const send = useCallback(async (text: string) => {
    const msg = text.trim();
    if (!msg || loading) return;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    const now = new Date().toLocaleTimeString();
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: msg, time: now }]);
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/tenant/${subdomain}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, session_id: 'dashboard' }),
      });
      const data = await res.json();
      const reply = data.reply || data.response || data.error || 'No response';
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: reply,
        time: new Date().toLocaleTimeString(),
      }]);
      if (voiceOut) speak(reply);
    } catch {
      const errMsg = '⚠️ Error connecting to agent. Check your AI API key in Integrations.';
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'assistant',
        content: errMsg,
        time: new Date().toLocaleTimeString(),
      }]);
      if (voiceOut) speak(errMsg);
    } finally {
      setLoading(false);
    }
  }, [loading, backendUrl, subdomain, voiceOut]);

  // ---------- Mic ----------
  const toggleMic = useCallback(() => {
    if (!voiceSupported) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transcript = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join('');
      setInput(transcript);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height =
          Math.min(textareaRef.current.scrollHeight, 128) + 'px';
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => {
      setIsListening(false);
      // auto-send if something was captured
      setInput(prev => {
        if (prev.trim()) {
          setTimeout(() => send(prev), 100);
        }
        return prev;
      });
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isListening, voiceSupported, send]);

  const toggleVoiceOut = () => {
    if (voiceOut) stopSpeaking();
    setVoiceOut(v => !v);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-white/10 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🤖</span> AI Agent Chat
          </h1>
          <p className="text-zinc-400 text-sm mt-0.5">Talk directly to your configured AI agent</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Voice output toggle */}
          {voiceSupported && (
            <button
              onClick={toggleVoiceOut}
              title={voiceOut ? 'Disable voice responses' : 'Enable voice responses'}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors ${
                voiceOut
                  ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/30'
                  : 'text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border-white/10'
              }`}
            >
              <SpeakerIcon on={voiceOut} />
              {voiceOut ? 'Voice On' : 'Voice Off'}
            </button>
          )}
          <button
            onClick={() => { setMessages([]); stopSpeaking(); }}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-lg transition-colors"
          >
            🗑️ New session
          </button>
        </div>
      </div>

      {/* Voice status banner */}
      {isListening && (
        <div className="mx-6 mt-3 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-2 shrink-0">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
          Listening… speak now. Click the mic again to stop.
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 text-4xl">🤖</div>
            <h3 className="text-white font-bold text-xl mb-2">Your AI Agent</h3>
            <p className="text-zinc-500 text-sm max-w-sm mb-8">
              Send a message or use the 🎤 mic to speak. Your agent uses the AI model configured in Integrations.
            </p>
            {voiceSupported && (
              <p className="text-zinc-600 text-xs mb-4">
                💡 Enable <strong className="text-zinc-400">Voice On</strong> (top-right) to hear responses read aloud.
              </p>
            )}
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="px-4 py-2 bg-zinc-900 border border-white/10 hover:border-white/30 text-zinc-300 hover:text-white text-sm rounded-xl transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-lg px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-white text-black rounded-br-sm'
                : 'bg-zinc-900 border border-white/10 text-zinc-100 rounded-bl-sm'
            }`}>
              {msg.tool && (
                <div className="flex items-center gap-2 text-xs text-indigo-400 mb-2 font-semibold">
                  🔧 {msg.tool}
                </div>
              )}
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <div className="flex items-center justify-between mt-1.5">
                <p className={`text-[10px] ${msg.role === 'user' ? 'text-black/40' : 'text-zinc-600'}`}>{msg.time}</p>
                {msg.role === 'assistant' && voiceSupported && (
                  <button
                    onClick={() => speak(msg.content)}
                    title="Read aloud"
                    className="text-[10px] text-zinc-600 hover:text-indigo-400 transition-colors ml-2"
                  >
                    🔊
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1.5 items-center h-5">
                {[0, 150, 300].map(d => (
                  <span key={d} className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-white/10 shrink-0">
        <div className={`flex gap-3 items-end bg-zinc-900 border focus-within:border-white/30 rounded-2xl px-4 py-3 transition-colors ${
          isListening ? 'border-red-500/50' : 'border-white/10'
        }`}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
            }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder={isListening ? '🎤 Listening…' : 'Message your AI agent… (Enter to send, Shift+Enter for new line)'}
            rows={1}
            disabled={loading}
            className="flex-1 bg-transparent border-none resize-none text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none"
            style={{ minHeight: '24px', maxHeight: '128px' }}
          />

          {/* Mic button */}
          {voiceSupported && (
            <button
              onClick={toggleMic}
              disabled={loading}
              title={isListening ? 'Stop recording' : 'Start voice input'}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                isListening
                  ? 'bg-red-500/20 border border-red-500/50 text-red-400 animate-pulse'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-white/10'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <MicIcon active={isListening} />
            </button>
          )}

          {/* Send button */}
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            className="w-9 h-9 rounded-xl bg-white hover:bg-zinc-200 disabled:bg-zinc-700 disabled:cursor-not-allowed text-black flex items-center justify-center transition-colors shrink-0"
          >
            <SendIcon />
          </button>
        </div>
        {voiceSupported && (
          <p className="text-[10px] text-zinc-700 mt-1.5 text-center">
            🎤 Click mic to speak · 🔊 Toggle voice responses top-right
          </p>
        )}
      </div>
    </div>
  );
}
