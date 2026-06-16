"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { fetchStats, fetchCoupons, fetchCustomers, fetchLogs, AdminStats, Coupon, Customer, LogEvent } from "@/lib/api";
import Link from "next/link";

function StatCard({
  label, value, icon, color, sub,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  sub?: string;
}) {
  return (
    <div style={{
      background: "rgba(13, 20, 33, 0.7)",
      border: "1px solid var(--border)",
      borderRadius: "16px",
      padding: "1.5rem",
      backdropFilter: "blur(10px)",
      transition: "all 0.2s",
      cursor: "default",
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.boxShadow = `0 0 25px ${color}30`;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div style={{
          width: "42px", height: "42px", borderRadius: "12px",
          background: `${color}20`,
          border: `1px solid ${color}40`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color,
        }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.35rem", fontWeight: 500 }}>
        {label}
      </div>
      {sub && <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>{sub}</div>}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function StatusBadge({ status, daysRemaining }: { status: string; daysRemaining: number }) {
  if (status === "active" && daysRemaining <= 3) {
    return <span className="badge-soon" style={{ fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: "6px" }}>⚡ Expiring</span>;
  }
  if (status === "active") return <span className="badge-active" style={{ fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: "6px" }}>● Active</span>;
  if (status === "expired") return <span className="badge-expired" style={{ fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: "6px" }}>✕ Expired</span>;
  return <span className="badge-revoked" style={{ fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: "6px" }}>— Revoked</span>;
}

export default function DashboardPage() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentCoupons, setRecentCoupons] = useState<Coupon[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) { router.push("/"); return; }
    if (!token) return;

    Promise.all([fetchStats(token), fetchCoupons(token), fetchCustomers(token), fetchLogs(token)])
      .then(([s, c, cust, l]) => {
        setStats(s);
        setRecentCoupons(c.slice(0, 5));
        setCustomers(cust);
        setLogs(l);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token, isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <AppShell>
      <div className="fade-in">
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} className="pulse" />
            <span style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Live</span>
          </div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)" }}>Dashboard</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem", fontSize: "0.9rem" }}>
            Overview of coupons, free trials, and tenant activity
          </p>
        </div>

        {error && (
          <div style={{
            marginBottom: "1.5rem", padding: "1rem 1.25rem",
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: "12px", color: "#f87171", fontSize: "0.875rem",
          }}>
            ⚠️ {error} — Make sure the backend is running.
          </div>
        )}

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px", gap: "0.75rem", color: "var(--text-muted)" }}>
            <div className="spinner" style={{ borderTopColor: "#6366f1" }} /> Loading stats...
          </div>
        ) : stats ? (
          <>
            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
              <StatCard label="Total Coupons" value={stats.total_coupons} color="#6366f1"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>}
              />
              <StatCard label="Active Coupons" value={stats.active_coupons} color="#10b981"
                sub={stats.expiring_soon > 0 ? `${stats.expiring_soon} expiring soon` : undefined}
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
              />
              <StatCard label="Expired / Revoked" value={stats.expired_coupons} color="#ef4444"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>}
              />
              <StatCard label="Active Tenants" value={stats.active_customers} color="#f59e0b"
                sub={`${stats.total_customers} total`}
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>}
              />
            </div>

            {/* Recent Coupons */}
            <div style={{
              background: "rgba(13, 20, 33, 0.7)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              overflow: "hidden",
              backdropFilter: "blur(10px)",
            }}>
              <div style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div>
                  <h2 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>Recent Coupons</h2>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>Latest 5 issued coupons</p>
                </div>
                <Link href="/coupons" style={{
                  fontSize: "0.8rem", fontWeight: 600, color: "#818cf8",
                  textDecoration: "none", padding: "0.4rem 0.9rem",
                  borderRadius: "8px", border: "1px solid rgba(99,102,241,0.25)",
                  background: "rgba(99,102,241,0.1)",
                }}>
                  View All →
                </Link>
              </div>

              {recentCoupons.length === 0 ? (
                <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 1rem", opacity: 0.4 }}>
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                  </svg>
                  <p>No coupons issued yet.</p>
                  <Link href="/coupons/new" style={{ color: "#818cf8", textDecoration: "none", fontWeight: 600 }}>Create your first coupon →</Link>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        {["Email", "Days", "Expires", "Status"].map((h) => (
                          <th key={h} style={{
                            padding: "0.75rem 1.5rem", textAlign: "left",
                            fontSize: "0.7rem", fontWeight: 700,
                            color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em",
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentCoupons.map((c) => (
                        <tr key={c.id} style={{ borderBottom: "1px solid rgba(30,45,69,0.5)" }}>
                          <td style={{ padding: "0.9rem 1.5rem", fontSize: "0.875rem", color: "var(--text-primary)", fontWeight: 500 }}>
                            {c.user_email}
                          </td>
                          <td style={{ padding: "0.9rem 1.5rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                            {c.days}d
                          </td>
                          <td style={{ padding: "0.9rem 1.5rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                            {formatDate(c.expires_at)}
                          </td>
                          <td style={{ padding: "0.9rem 1.5rem" }}>
                            <StatusBadge status={c.status} daysRemaining={c.days_remaining} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            
            {/* Customers List */}
            <div style={{
              background: "rgba(13, 20, 33, 0.7)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              overflow: "hidden",
              backdropFilter: "blur(10px)",
              marginTop: "2rem"
            }}>
              <div style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid var(--border)",
              }}>
                <h2 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>Customers</h2>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      {["Name", "Subdomain", "Plan", "Status"].map((h) => (
                        <th key={h} style={{
                          padding: "0.75rem 1.5rem", textAlign: "left",
                          fontSize: "0.7rem", fontWeight: 700,
                          color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr key={c.id} style={{ borderBottom: "1px solid rgba(30,45,69,0.5)" }}>
                        <td style={{ padding: "0.9rem 1.5rem", fontSize: "0.875rem", color: "var(--text-primary)", fontWeight: 500 }}>
                          {c.customer_name}
                        </td>
                        <td style={{ padding: "0.9rem 1.5rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                          {c.subdomain}
                        </td>
                        <td style={{ padding: "0.9rem 1.5rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                          <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", background: "rgba(99,102,241,0.2)", color: "#818cf8", fontSize: "0.75rem" }}>
                            {c.plan_type}
                          </span>
                        </td>
                        <td style={{ padding: "0.9rem 1.5rem" }}>
                          {c.is_active ? 
                            <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: "6px", background: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>Active</span> : 
                            <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: "6px", background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}>Suspended</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ECS Logs */}
            <div style={{
              background: "rgba(13, 20, 33, 0.7)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              overflow: "hidden",
              backdropFilter: "blur(10px)",
              marginTop: "2rem"
            }}>
              <div style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid var(--border)",
              }}>
                <h2 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>AWS ECS Live Logs (openclaw-backend)</h2>
              </div>
              <div style={{ padding: "1rem", maxHeight: "400px", overflowY: "auto", background: "#0a0f18", fontFamily: "monospace", fontSize: "0.8rem", color: "#a5b4fc" }}>
                {logs.map((l, i) => (
                  <div key={i} style={{ marginBottom: "0.3rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.2rem" }}>
                    <span style={{ color: "#6b7280", marginRight: "0.5rem" }}>[{new Date(l.timestamp).toLocaleTimeString()}]</span>
                    {l.message}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick action */}
            <div style={{ marginTop: "1.5rem" }}>
              <Link href="/coupons/new" className="btn-primary" style={{ textDecoration: "none" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                Issue New Coupon
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
