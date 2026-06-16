import sys

content = open("src/app/dashboard/page.tsx").read()

content = content.replace(
    'import { fetchStats, fetchCoupons, AdminStats, Coupon } from "@/lib/api";',
    'import { fetchStats, fetchCoupons, fetchCustomers, fetchLogs, AdminStats, Coupon, Customer, LogEvent } from "@/lib/api";'
)

content = content.replace(
    'const [recentCoupons, setRecentCoupons] = useState<Coupon[]>([]);',
    'const [recentCoupons, setRecentCoupons] = useState<Coupon[]>([]);\n  const [customers, setCustomers] = useState<Customer[]>([]);\n  const [logs, setLogs] = useState<LogEvent[]>([]);'
)

promise_all_old = 'Promise.all([fetchStats(token), fetchCoupons(token)])'
promise_all_new = 'Promise.all([fetchStats(token), fetchCoupons(token), fetchCustomers(token), fetchLogs(token)])'
content = content.replace(promise_all_old, promise_all_new)

then_old = '.then(([s, c]) => {'
then_new = '.then(([s, c, cust, l]) => {'
content = content.replace(then_old, then_new)

set_stats_old = 'setRecentCoupons(c.slice(0, 5));'
set_stats_new = 'setRecentCoupons(c.slice(0, 5));\n        setCustomers(cust);\n        setLogs(l);'
content = content.replace(set_stats_old, set_stats_new)

customers_and_logs_jsx = """
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
"""

content = content.replace('{/* Quick action */}', customers_and_logs_jsx + '\n            {/* Quick action */}')

open("src/app/dashboard/page.tsx", "w").write(content)
print("Patched page.tsx")
