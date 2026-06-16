"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import AppShell from "@/components/AppShell";
import { fetchCoupons, revokeCoupon, Coupon } from "@/lib/api";
import Link from "next/link";

function StatusBadge({ status, daysRemaining }: { status: string; daysRemaining: number }) {
  if (status === "active" && daysRemaining <= 3) {
    return (
      <span className="badge-soon" style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.25rem 0.65rem", borderRadius: "6px", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
        <span style={{ fontSize: "0.6rem" }}>⚡</span> Expiring ({daysRemaining}d)
      </span>
    );
  }
  if (status === "active") {
    return (
      <span className="badge-active" style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.25rem 0.65rem", borderRadius: "6px", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", display: "inline-block" }} className="pulse" />
        Active ({daysRemaining}d left)
      </span>
    );
  }
  if (status === "expired") {
    return <span className="badge-expired" style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.25rem 0.65rem", borderRadius: "6px" }}>✕ Expired</span>;
  }
  return <span className="badge-revoked" style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.25rem 0.65rem", borderRadius: "6px" }}>— Revoked</span>;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

type FilterType = "all" | "active" | "expired" | "revoked";

export default function CouponsPage() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [revoking, setRevoking] = useState<number | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) { router.push("/"); return; }
    if (!token) return;
    loadCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isAuthenticated]);

  const loadCoupons = () => {
    if (!token) return;
    setLoading(true);
    fetchCoupons(token)
      .then(setCoupons)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  const filtered = useMemo(() => {
    let list = coupons;
    if (filter !== "all") list = list.filter((c) => c.status === filter);
    if (search.trim()) list = list.filter((c) => c.user_email.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [coupons, filter, search]);

  const handleRevoke = async (id: number) => {
    if (!token) return;
    setRevoking(id);
    try {
      await revokeCoupon(token, id);
      setCoupons((prev) => prev.map((c) => c.id === id ? { ...c, is_active: false, status: "revoked" } : c));
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message);
    } finally {
      setRevoking(null);
      setConfirmRevoke(null);
    }
  };

  if (!isAuthenticated) return null;

  const filterBtn = (f: FilterType, label: string) => (
    <button
      onClick={() => setFilter(f)}
      style={{
        padding: "0.45rem 1rem",
        borderRadius: "8px",
        border: filter === f ? "1px solid rgba(99,102,241,0.4)" : "1px solid var(--border)",
        background: filter === f ? "rgba(99,102,241,0.15)" : "rgba(13,20,33,0.5)",
        color: filter === f ? "#818cf8" : "var(--text-secondary)",
        fontSize: "0.8rem",
        fontWeight: filter === f ? 700 : 500,
        cursor: "pointer",
        transition: "all 0.15s",
        fontFamily: "inherit",
      }}
    >
      {label} {filter === f ? `(${filtered.length})` : ""}
    </button>
  );

  return (
    <AppShell>
      <div className="fade-in">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)" }}>Coupons</h1>
            <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem", fontSize: "0.9rem" }}>
              Manage all user coupons and free-trial periods
            </p>
          </div>
          <Link href="/coupons/new" className="btn-primary" style={{ textDecoration: "none" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Coupon
          </Link>
        </div>

        {error && (
          <div style={{ marginBottom: "1.5rem", padding: "1rem 1.25rem", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "12px", color: "#f87171", fontSize: "0.875rem" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Filters & Search */}
        <div style={{
          background: "rgba(13, 20, 33, 0.7)", border: "1px solid var(--border)",
          borderRadius: "16px", padding: "1rem 1.5rem",
          display: "flex", alignItems: "center", gap: "0.75rem",
          flexWrap: "wrap", marginBottom: "1rem", backdropFilter: "blur(10px)",
        }}>
          <div style={{ position: "relative", flex: "1", minWidth: "200px" }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email..."
              className="input-field"
              style={{ paddingLeft: "2.5rem", padding: "0.5rem 1rem 0.5rem 2.5rem" }}
            />
            <div style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {filterBtn("all", "All")}
            {filterBtn("active", "Active")}
            {filterBtn("expired", "Expired")}
            {filterBtn("revoked", "Revoked")}
          </div>
          <button onClick={loadCoupons} style={{
            padding: "0.45rem 0.9rem", borderRadius: "8px",
            border: "1px solid var(--border)", background: "rgba(13,20,33,0.5)",
            color: "var(--text-muted)", fontSize: "0.8rem", cursor: "pointer",
            display: "flex", alignItems: "center", gap: "0.4rem", fontFamily: "inherit",
            transition: "all 0.15s",
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Table */}
        <div style={{
          background: "rgba(13, 20, 33, 0.7)", border: "1px solid var(--border)",
          borderRadius: "16px", overflow: "hidden", backdropFilter: "blur(10px)",
        }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px", gap: "0.75rem", color: "var(--text-muted)" }}>
              <div className="spinner" style={{ borderTopColor: "#6366f1" }} /> Loading coupons...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 1rem", opacity: 0.3 }}>
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
              <p style={{ fontWeight: 600, color: "var(--text-secondary)" }}>No coupons found</p>
              <p style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
                {search ? "Try a different search term." : "No coupons match this filter."}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", background: "rgba(8,12,20,0.4)" }}>
                    {["#", "Email", "Days Granted", "Created", "Expires", "Status", "Notes", "Actions"].map((h) => (
                      <th key={h} style={{
                        padding: "0.85rem 1.25rem", textAlign: "left",
                        fontSize: "0.68rem", fontWeight: 700,
                        color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em",
                        whiteSpace: "nowrap",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, idx) => (
                    <tr
                      key={c.id}
                      style={{
                        borderBottom: idx < filtered.length - 1 ? "1px solid rgba(30,45,69,0.4)" : "none",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(99,102,241,0.04)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <td style={{ padding: "0.95rem 1.25rem", fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                        #{c.id}
                      </td>
                      <td style={{ padding: "0.95rem 1.25rem", fontWeight: 600, color: "var(--text-primary)", fontSize: "0.875rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          <div style={{
                            width: "28px", height: "28px", borderRadius: "8px", flexShrink: 0,
                            background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(129,140,248,0.2))",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "0.7rem", fontWeight: 800, color: "#818cf8",
                          }}>
                            {c.user_email[0].toUpperCase()}
                          </div>
                          {c.user_email}
                        </div>
                      </td>
                      <td style={{ padding: "0.95rem 1.25rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                        <span style={{
                          background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)",
                          borderRadius: "6px", padding: "0.15rem 0.55rem", fontWeight: 700, color: "#818cf8", fontSize: "0.8rem",
                        }}>
                          {c.days}d
                        </span>
                      </td>
                      <td style={{ padding: "0.95rem 1.25rem", color: "var(--text-muted)", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                        {formatDate(c.created_at)}
                      </td>
                      <td style={{ padding: "0.95rem 1.25rem", color: "var(--text-secondary)", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                        {formatDate(c.expires_at)}
                      </td>
                      <td style={{ padding: "0.95rem 1.25rem" }}>
                        <StatusBadge status={c.status} daysRemaining={c.days_remaining} />
                      </td>
                      <td style={{ padding: "0.95rem 1.25rem", fontSize: "0.8rem", color: "var(--text-muted)", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.notes || <span style={{ opacity: 0.4 }}>—</span>}
                      </td>
                      <td style={{ padding: "0.95rem 1.25rem" }}>
                        {c.status === "active" && (
                          confirmRevoke === c.id ? (
                            <div style={{ display: "flex", gap: "0.4rem" }}>
                              <button
                                onClick={() => handleRevoke(c.id)}
                                disabled={revoking === c.id}
                                className="btn-danger"
                              >
                                {revoking === c.id ? "..." : "Confirm"}
                              </button>
                              <button
                                onClick={() => setConfirmRevoke(null)}
                                style={{
                                  padding: "0.35rem 0.65rem", fontSize: "0.75rem",
                                  borderRadius: "7px", border: "1px solid var(--border)",
                                  background: "transparent", color: "var(--text-muted)",
                                  cursor: "pointer", fontFamily: "inherit",
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmRevoke(c.id)} className="btn-danger">
                              Revoke
                            </button>
                          )
                        )}
                        {c.status !== "active" && (
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Footer row */}
              <div style={{ padding: "0.85rem 1.25rem", borderTop: "1px solid var(--border)", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                Showing {filtered.length} of {coupons.length} coupon{coupons.length !== 1 ? "s" : ""}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
