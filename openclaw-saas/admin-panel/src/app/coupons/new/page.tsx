"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { createCoupon, Coupon } from "@/lib/api";
import Link from "next/link";

const PRESET_DAYS = [7, 14, 30, 60, 90, 180, 365];

export default function CreateCouponPage() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [days, setDays] = useState(30);
  const [customDays, setCustomDays] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<Coupon | null>(null);

  useEffect(() => {
    if (!isAuthenticated) router.push("/");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const effectiveDays = useCustom ? parseInt(customDays || "0") : days;

  const expiryDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + effectiveDays);
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Email is required."); return; }
    if (effectiveDays < 1 || effectiveDays > 3650) { setError("Days must be between 1 and 3650."); return; }
    if (!token) return;

    setLoading(true);
    try {
      const coupon = await createCoupon(token, {
        user_email: email.trim(),
        days: effectiveDays,
        notes: notes.trim() || undefined,
      });
      setSuccess(coupon);
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AppShell>
        <div className="fade-in" style={{ maxWidth: "520px", margin: "0 auto", paddingTop: "2rem" }}>
          <div style={{
            background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)",
            borderRadius: "20px", padding: "2.5rem", textAlign: "center",
            boxShadow: "0 0 40px rgba(16,185,129,0.1)",
          }}>
            <div style={{
              width: "64px", height: "64px", borderRadius: "50%",
              background: "rgba(16,185,129,0.15)", border: "2px solid rgba(16,185,129,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 1.5rem",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
              Coupon Created!
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.75rem" }}>
              Free access has been granted to <strong style={{ color: "var(--text-primary)" }}>{success.user_email}</strong> for <strong style={{ color: "#818cf8" }}>{success.days} days</strong>.
            </p>

            <div style={{
              background: "rgba(8,12,20,0.6)", borderRadius: "12px",
              border: "1px solid var(--border)", padding: "1rem",
              textAlign: "left", marginBottom: "1.75rem",
            }}>
              {[
                { label: "Email", value: success.user_email },
                { label: "Days Granted", value: `${success.days} days` },
                { label: "Expires", value: new Date(success.expires_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) },
                { label: "Status", value: "Active" },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", borderBottom: "1px solid rgba(30,45,69,0.4)", fontSize: "0.85rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>{label}</span>
                  <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button
                onClick={() => { setSuccess(null); setEmail(""); setNotes(""); setDays(30); setCustomDays(""); setUseCustom(false); }}
                className="btn-primary"
              >
                + Create Another
              </button>
              <Link href="/coupons" style={{
                padding: "0.75rem 1.25rem", borderRadius: "10px",
                border: "1px solid var(--border)", background: "rgba(13,20,33,0.5)",
                color: "var(--text-secondary)", textDecoration: "none",
                fontSize: "0.9rem", fontWeight: 600, display: "inline-flex", alignItems: "center",
              }}>
                View All Coupons
              </Link>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="fade-in">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
          <Link href="/coupons" style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "36px", height: "36px", borderRadius: "10px",
            border: "1px solid var(--border)", background: "rgba(13,20,33,0.5)",
            color: "var(--text-muted)", textDecoration: "none",
            transition: "all 0.15s",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
          </Link>
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)" }}>Issue New Coupon</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
              Grant free access to a user by their email address
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem", alignItems: "start" }}>
          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{
              background: "rgba(13, 20, 33, 0.7)", border: "1px solid var(--border)",
              borderRadius: "16px", padding: "1.75rem", backdropFilter: "blur(10px)",
            }}>
              {/* Email */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
                  User Email *
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="coupon-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                    className="input-field"
                    style={{ paddingLeft: "2.75rem" }}
                  />
                  <div style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                </div>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
                  The coupon will be linked to this exact email address at login.
                </p>
              </div>

              {/* Duration */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>
                  Duration (Days) *
                </label>

                {/* Preset buttons */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  {PRESET_DAYS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => { setDays(d); setUseCustom(false); }}
                      style={{
                        padding: "0.45rem 0.9rem",
                        borderRadius: "8px",
                        border: !useCustom && days === d ? "1px solid rgba(99,102,241,0.5)" : "1px solid var(--border)",
                        background: !useCustom && days === d ? "rgba(99,102,241,0.2)" : "rgba(13,20,33,0.5)",
                        color: !useCustom && days === d ? "#818cf8" : "var(--text-secondary)",
                        fontSize: "0.82rem",
                        fontWeight: !useCustom && days === d ? 700 : 500,
                        cursor: "pointer",
                        transition: "all 0.15s",
                        fontFamily: "inherit",
                      }}
                    >
                      {d}d
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setUseCustom(true)}
                    style={{
                      padding: "0.45rem 0.9rem",
                      borderRadius: "8px",
                      border: useCustom ? "1px solid rgba(99,102,241,0.5)" : "1px solid var(--border)",
                      background: useCustom ? "rgba(99,102,241,0.2)" : "rgba(13,20,33,0.5)",
                      color: useCustom ? "#818cf8" : "var(--text-secondary)",
                      fontSize: "0.82rem",
                      fontWeight: useCustom ? 700 : 500,
                      cursor: "pointer",
                      transition: "all 0.15s",
                      fontFamily: "inherit",
                    }}
                  >
                    Custom
                  </button>
                </div>

                {useCustom && (
                  <input
                    id="coupon-days"
                    type="number"
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                    placeholder="e.g. 45"
                    min={1}
                    max={3650}
                    className="input-field"
                    autoFocus
                  />
                )}
              </div>

              {/* Notes */}
              <div style={{ marginBottom: "1.75rem" }}>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
                  Notes <span style={{ textTransform: "none", fontWeight: 400 }}>(optional)</span>
                </label>
                <textarea
                  id="coupon-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Beta tester, VIP user, conference promo..."
                  rows={3}
                  className="input-field"
                  style={{ resize: "vertical", lineHeight: 1.6 }}
                />
              </div>

              {error && (
                <div style={{
                  marginBottom: "1.25rem", padding: "0.75rem 1rem",
                  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
                  borderRadius: "10px", color: "#f87171", fontSize: "0.85rem",
                  display: "flex", alignItems: "center", gap: "0.5rem",
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                id="create-coupon-submit"
                disabled={loading || !email || effectiveDays < 1}
                className="btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
              >
                {loading ? (
                  <><div className="spinner" /> Creating Coupon...</>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                      <line x1="7" y1="7" x2="7.01" y2="7" />
                    </svg>
                    Issue Coupon
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Preview panel */}
          <div style={{ position: "sticky", top: "2rem" }}>
            <div style={{
              background: "rgba(13, 20, 33, 0.7)", border: "1px solid var(--border)",
              borderRadius: "16px", padding: "1.5rem", backdropFilter: "blur(10px)",
            }}>
              <h3 style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.25rem" }}>
                Preview
              </h3>

              {/* Coupon card visualization */}
              <div style={{
                borderRadius: "12px",
                background: "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(129,140,248,0.1))",
                border: "1px solid rgba(99,102,241,0.3)",
                padding: "1.25rem",
                marginBottom: "1.25rem",
                boxShadow: "0 4px 20px rgba(99,102,241,0.15)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.08em" }}>OpenClaw Coupon</span>
                </div>
                <div style={{ fontSize: "0.85rem", color: "#c7d2fe", marginBottom: "0.4rem", wordBreak: "break-all" }}>
                  {email || <span style={{ opacity: 0.5 }}>user@example.com</span>}
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", marginBottom: "0.25rem" }}>
                  {effectiveDays > 0 ? effectiveDays : 30} Days Free
                </div>
                <div style={{ fontSize: "0.75rem", color: "rgba(199,210,254,0.7)" }}>
                  Valid until {effectiveDays > 0 ? expiryDate() : "—"}
                </div>
              </div>

              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(30,45,69,0.4)", paddingBottom: "0.5rem", marginBottom: "0.5rem" }}>
                  <span>Email</span>
                  <span style={{ color: "var(--text-secondary)", maxWidth: "150px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                    {email || "—"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(30,45,69,0.4)", paddingBottom: "0.5rem", marginBottom: "0.5rem" }}>
                  <span>Duration</span>
                  <span style={{ color: "#818cf8", fontWeight: 700 }}>{effectiveDays > 0 ? `${effectiveDays} days` : "—"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Expires</span>
                  <span style={{ color: "var(--text-secondary)" }}>{effectiveDays > 0 ? expiryDate() : "—"}</span>
                </div>
              </div>

              <div style={{
                marginTop: "1.25rem", padding: "0.75rem",
                background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
                borderRadius: "10px", fontSize: "0.78rem", color: "#6ee7b7",
                display: "flex", alignItems: "flex-start", gap: "0.5rem",
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "1px" }}>
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                User will skip payment and access the dashboard directly on login.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
