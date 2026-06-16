"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) router.push("/dashboard");
  }, [isAuthenticated, router]);

  if (!mounted) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${secret}` },
      });
      if (res.ok) {
        login(secret);
        router.push("/dashboard");
      } else {
        setError("Invalid admin secret. Please try again.");
      }
    } catch {
      setError("Cannot connect to backend. Check the server URL.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1.5rem",
      background: "radial-gradient(ellipse at 30% 30%, rgba(99,102,241,0.2) 0%, transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(16,185,129,0.1) 0%, transparent 60%), #080c14",
    }}>
      {/* Animated rings */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px", height: "600px",
          border: "1px solid rgba(99,102,241,0.08)",
          borderRadius: "50%",
        }} />
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "900px", height: "900px",
          border: "1px solid rgba(99,102,241,0.04)",
          borderRadius: "50%",
        }} />
      </div>

      <div className="fade-in" style={{
        width: "100%",
        maxWidth: "420px",
        position: "relative",
      }}>
        {/* Card */}
        <div style={{
          background: "rgba(13, 20, 33, 0.9)",
          border: "1px solid rgba(99,102,241,0.2)",
          borderRadius: "20px",
          padding: "2.5rem",
          backdropFilter: "blur(20px)",
          boxShadow: "0 25px 50px rgba(0,0,0,0.5), 0 0 60px rgba(99,102,241,0.1)",
        }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "60px", height: "60px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #6366f1, #818cf8)",
              boxShadow: "0 8px 25px rgba(99,102,241,0.4)",
              marginBottom: "1rem",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 style={{
              fontSize: "1.6rem",
              fontWeight: 800,
              color: "var(--text-primary)",
              marginBottom: "0.35rem",
            }}>
              OpenClaw Admin
            </h1>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
              Sign in with your admin secret key
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{
                display: "block",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "0.5rem",
              }}>
                Admin Secret Key
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="admin-secret"
                  type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Enter your admin secret..."
                  required
                  className="input-field"
                  style={{ paddingLeft: "2.75rem" }}
                />
                <div style={{
                  position: "absolute", left: "0.85rem", top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </div>
              </div>
            </div>

            {error && (
              <div style={{
                marginBottom: "1rem",
                padding: "0.75rem 1rem",
                borderRadius: "10px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#f87171",
                fontSize: "0.85rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !secret}
              className="btn-primary"
              style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
            >
              {loading ? (
                <><div className="spinner" />Verifying...</>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  Access Admin Panel
                </>
              )}
            </button>
          </form>

          <div style={{
            marginTop: "1.75rem",
            paddingTop: "1.25rem",
            borderTop: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            justifyContent: "center",
          }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }} className="pulse" />
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Contact your administrator for access
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
