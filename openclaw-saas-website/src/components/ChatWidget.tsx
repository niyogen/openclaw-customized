"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message { id: string; role: "user" | "assistant"; content: string; }

const genId = () => Math.random().toString(36).slice(2, 10);
function getSessionId() {
  if (typeof window === "undefined") return genId();
  let id = sessionStorage.getItem("oc_chat_session");
  if (!id) { id = genId(); sessionStorage.setItem("oc_chat_session", id); }
  return id;
}

const SUGGESTIONS = [
  "💼 Create my AI agent",
  "What is OpenClaw?",
  "How does pricing work?",
  "What channels do you support?",
];

/* Icons */
function BotIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7H3a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm6 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM5 15v1a7 7 0 0 0 14 0v-1H5zm7 5a5 5 0 0 1-4.9-4h9.8A5 5 0 0 1 12 20z" /></svg>;
}
function SendIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M2 21l21-9L2 3v7l15 2-15 2z" /></svg>;
}
function CloseIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
}
function TrashIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6m4-6v6" /><path d="M9 6V4h6v2" /></svg>;
}

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "4px 0" }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.4)", display: "inline-block", animation: `oc-bounce 1.2s infinite ${i * 0.2}s` }} />
      ))}
    </div>
  );
}

function Bubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 10, animation: "oc-fadeup 0.2s ease" }}>
      {!isUser && (
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#fff 0%,#a0a0a0 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", marginRight: 8, flexShrink: 0, marginTop: 2 }}>
          <BotIcon />
        </div>
      )}
      <div style={{ maxWidth: "78%", padding: "10px 14px", borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: isUser ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)", border: isUser ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(255,255,255,0.08)", color: "#f0f0f0", fontSize: 13.5, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {msg.content}
      </div>
    </div>
  );
}

/* ── Main widget ──────────────────────────────────────────────────── */
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(getSessionId);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isEmpty = messages.length === 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  }, [input]);

  const addBot = (content: string) =>
    setMessages(p => [...p, { id: genId(), role: "assistant", content }]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setMessages(p => [...p, { id: genId(), role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, sessionId }),
      });
      const data = await res.json();
      addBot(data.reply ?? data.error ?? "Sorry, something went wrong.");
    } catch {
      addBot("⚠️ Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [loading, sessionId]);

  const clearChat = async () => {
    setMessages([]);
    await fetch("/api/chat", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  return (
    <>
      <style>{`
        @keyframes oc-bounce { 0%,60%,100%{transform:translateY(0);opacity:.4} 30%{transform:translateY(-5px);opacity:1} }
        @keyframes oc-fadeup { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes oc-panel-in { from{opacity:0;transform:translateY(20px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes oc-ping { 0%{transform:scale(1);opacity:.8} 75%,100%{transform:scale(2);opacity:0} }
        @keyframes spin { to{transform:rotate(360deg)} }
        #oc-input::placeholder{color:rgba(255,255,255,.3)} #oc-input:focus{outline:none}
        #oc-messages::-webkit-scrollbar{width:4px}
        #oc-messages::-webkit-scrollbar-track{background:transparent}
        #oc-messages::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:4px}
      `}</style>

      {/* Floating button */}
      <button
        id="oc-chat-toggle"
        onClick={() => setOpen(o => !o)}
        aria-label="Open OpenClaw chat"
        style={{ position: "fixed", bottom: 28, right: 28, zIndex: 9998, width: 56, height: 56, borderRadius: "50%", background: open ? "rgba(30,30,30,0.95)" : "#ffffff", border: "2px solid rgba(255,255,255,0.2)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: open ? "#fff" : "#000", transition: "all 0.25s ease" }}
      >
        {open ? <CloseIcon /> : <BotIcon />}
        {!open && isEmpty && (
          <span style={{ position: "absolute", top: 4, right: 4, width: 10, height: 10, borderRadius: "50%", background: "#22c55e" }}>
            <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#22c55e", animation: "oc-ping 1.5s cubic-bezier(0,0,0.2,1) infinite" }} />
          </span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          id="oc-chat-panel"
          style={{ position: "fixed", bottom: 96, right: 28, zIndex: 9999, width: 380, height: 560, borderRadius: 20, background: "rgba(8,8,12,0.97)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 24px 80px rgba(0,0,0,0.7)", display: "flex", flexDirection: "column", overflow: "hidden", backdropFilter: "blur(20px)", animation: "oc-panel-in 0.25s ease" }}
        >
          {/* Header */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#000" }}>
                <BotIcon />
              </div>
              <div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>OpenClaw AI</div>
                <div style={{ color: "#22c55e", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                  Online · Chat to get things done
                </div>
              </div>
            </div>
            {!isEmpty && (
              <button onClick={clearChat} title="New chat" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "4px 8px", cursor: "pointer", color: "#aaa", display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
                <TrashIcon /> New chat
              </button>
            )}
          </div>

          {/* Messages */}
          <div id="oc-messages" style={{ flex: 1, overflowY: "auto", padding: "16px 14px" }}>
            {isEmpty ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 20, textAlign: "center" }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", boxShadow: "0 0 40px rgba(255,255,255,0.15)" }}>
                  <BotIcon />
                </div>
                <div>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
                    Hi! I&apos;m the OpenClaw AI 👋
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 1.6, maxWidth: 280 }}>
                    Chat like WhatsApp — create your AI agent, ask questions, or get work done through your integrations.
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "9px 14px", color: "rgba(255,255,255,0.7)", fontSize: 13, cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)"; }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map(m => <Bubble key={m.id} msg={m} />)}
                {loading && (
                  <div style={{ display: "flex", alignItems: "flex-end", marginBottom: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#fff 0%,#a0a0a0 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", marginRight: 8, flexShrink: 0 }}>
                      <BotIcon />
                    </div>
                    <div style={{ padding: "10px 14px", borderRadius: "18px 18px 18px 4px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <TypingDots />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
            <div
              style={{ display: "flex", alignItems: "flex-end", gap: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "8px 12px", transition: "border-color 0.2s" }}
              onFocusCapture={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.25)"}
              onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
            >
              <textarea
                id="oc-input"
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                disabled={loading}
                placeholder="Message OpenClaw AI…"
                style={{ flex: 1, background: "transparent", border: "none", resize: "none", color: "#f0f0f0", fontSize: 13.5, lineHeight: 1.55, maxHeight: 120, fontFamily: "inherit" }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: input.trim() && !loading ? "#ffffff" : "rgba(255,255,255,0.1)", border: "none", cursor: input.trim() && !loading ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", color: input.trim() && !loading ? "#000" : "rgba(255,255,255,0.3)", transition: "all 0.2s" }}
              >
                {loading
                  ? <span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                  : <SendIcon />}
              </button>
            </div>
            <div style={{ textAlign: "center", marginTop: 8, color: "rgba(255,255,255,0.2)", fontSize: 11 }}>
              OpenClaw AI · Enter to send
            </div>
          </div>
        </div>
      )}
    </>
  );
}
