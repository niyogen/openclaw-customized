import { NextRequest, NextResponse } from "next/server";

// ─── Server-side conversation memory ─────────────────────────────────────────
// Keyed by browser sessionId. The OpenClaw backend /api/website/chat accepts
// history directly, so we just pass it along — no context-mangling needed.
const sessions = new Map<string, { role: "user" | "assistant"; content: string }[]>();

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://openclaw.niyogen.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, sessionId } = body as { message: string; sessionId: string };

    if (!message?.trim() || !sessionId) {
      return NextResponse.json({ error: "Missing message or sessionId" }, { status: 400 });
    }

    // Retrieve or init history
    if (!sessions.has(sessionId)) sessions.set(sessionId, []);
    const history = sessions.get(sessionId)!;

    // Call the platform-level website chat endpoint on the OpenClaw backend.
    // The backend handles AI key selection and model routing itself.
    const ocRes = await fetch(`${BACKEND_URL}/api/website/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: message.trim(),
        history, // Pass full history — backend caps it at last 20 messages
      }),
    });

    if (!ocRes.ok) {
      const err = await ocRes.text();
      console.error("OpenClaw /api/website/chat error:", ocRes.status, err);
      return NextResponse.json(
        { error: `AI service unavailable (${ocRes.status})` },
        { status: 502 }
      );
    }

    const data = await ocRes.json();
    const reply: string = data.response ?? "Sorry, I couldn't get a response right now.";

    // Store in local session memory
    history.push({ role: "user", content: message.trim() });
    history.push({ role: "assistant", content: reply });
    if (history.length > 60) history.splice(0, history.length - 60);

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Clear session (called on "New chat")
export async function DELETE(req: NextRequest) {
  try {
    const { sessionId } = await req.json();
    if (sessionId) sessions.delete(sessionId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
