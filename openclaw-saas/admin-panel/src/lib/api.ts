/**
 * API client for OpenClaw SaaS Admin Panel.
 * All admin endpoints require Bearer token authentication.
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export interface Coupon {
  id: number;
  user_email: string;
  days: number;
  expires_at: string;
  is_active: boolean;
  notes: string | null;
  created_by: string;
  created_at: string;
  days_remaining: number;
  status: "active" | "expired" | "revoked";
}

export interface AdminStats {
  total_coupons: number;
  active_coupons: number;
  expired_coupons: number;
  expiring_soon: number;
  total_customers: number;
  active_customers: number;
}

export interface Customer {
  id: number;
  customer_name: string;
  subdomain: string;
  plan_type: string;
  is_active: boolean;
  created_at: string;
}

export interface LogEvent {
  timestamp: number;
  message: string;
}

export interface CreateCouponPayload {
  user_email: string;
  days: number;
  notes?: string;
}

function getHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchStats(token: string): Promise<AdminStats> {
  const res = await fetch(`${BACKEND_URL}/api/admin/stats`, {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error("Unauthorized or server error");
  return res.json();
}

export async function fetchCoupons(token: string): Promise<Coupon[]> {
  const res = await fetch(`${BACKEND_URL}/api/admin/coupons`, {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to fetch coupons");
  const data = await res.json();
  return data.coupons;
}

export async function fetchCustomers(token: string): Promise<Customer[]> {
  const res = await fetch(`${BACKEND_URL}/api/admin/customers`, {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to fetch customers");
  const data = await res.json();
  return data.customers;
}

export async function fetchLogs(token: string, limit: number = 100): Promise<LogEvent[]> {
  const res = await fetch(`${BACKEND_URL}/api/admin/logs?limit=${limit}`, {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to fetch logs");
  const data = await res.json();
  return data.logs;
}

export async function createCoupon(
  token: string,
  payload: CreateCouponPayload
): Promise<Coupon> {
  const res = await fetch(`${BACKEND_URL}/api/admin/coupons`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create coupon");
  }
  const data = await res.json();
  return data.coupon;
}

export async function revokeCoupon(token: string, id: number): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/api/admin/coupons/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to revoke coupon");
}
