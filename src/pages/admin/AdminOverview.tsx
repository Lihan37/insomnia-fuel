// src/pages/admin/AdminOverview.tsx
import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { IOrder } from "@/types/order";
import {  AlertTriangle, RefreshCcw, CalendarRange } from "lucide-react";

type Range = "30d" | "90d" | "all";

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AdminOverview() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [range, setRange] = useState<Range>("30d");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch orders (up to 1000) for stats
  const loadOrders = async (silent = false) => {
    if (!user) return;
    try {
      if (!silent) setLoading(true);
      setErr(null);

      const token = await user.getIdToken();
      const res = await api.get<{ items: IOrder[]; total: number }>(
        "/api/orders?page=1&limit=1000",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders(res.data.items || []);
    } catch (e) {
      console.error("AdminOverview load error:", e);
      setErr("Failed to load dashboard data.");
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Filter by selected time range
  const rangeFilteredOrders = useMemo(() => {
    if (range === "all") return orders;

    const now = Date.now();
    const days = range === "30d" ? 30 : 90;
    const threshold = now - days * 24 * 60 * 60 * 1000;

    return orders.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return !Number.isNaN(t) && t >= threshold;
    });
  }, [orders, range]);

  // KPIs
  const kpis = useMemo(() => {
    if (rangeFilteredOrders.length === 0) {
      return {
        revenue: 0,
        ordersCount: 0,
        activeUsers: 0,
        avgOrderValue: 0,
      };
    }

    let revenue = 0;
    const userIds = new Set<string>();

    rangeFilteredOrders.forEach((o) => {
      // only count revenue for non-cancelled, paid orders
      if (o.status !== "cancelled" && o.paymentStatus === "paid") {
        revenue += o.total ?? o.subtotal ?? 0;
      }
      if (o.userId) userIds.add(o.userId);
    });

    const ordersCount = rangeFilteredOrders.length;
    const activeUsers = userIds.size;
    const avgOrderValue = ordersCount > 0 ? revenue / ordersCount : 0;

    return { revenue, ordersCount, activeUsers, avgOrderValue };
  }, [rangeFilteredOrders]);

  // Monthly orders for bar chart
  const monthlyOrdersData = useMemo(() => {
    if (rangeFilteredOrders.length === 0) return [];

    // Map key: "YYYY-MM" -> { monthLabel, orders }
    const map = new Map<string, { key: string; label: string; orders: number }>();

    rangeFilteredOrders.forEach((o) => {
      const d = new Date(o.createdAt);
      if (Number.isNaN(d.getTime())) return;

      const year = d.getFullYear();
      const month = d.getMonth(); // 0-11
      const key = `${year}-${month}`;
      const label = `${MONTHS_SHORT[month]} ${String(year).slice(-2)}`;

      const existing = map.get(key);
      if (existing) {
        existing.orders += 1;
      } else {
        map.set(key, { key, label, orders: 1 });
      }
    });

    // Sort by year-month
    const arr = Array.from(map.values()).sort((a, b) => {
      const [ay, am] = a.key.split("-").map(Number);
      const [by, bm] = b.key.split("-").map(Number);
      if (ay === by) return am - bm;
      return ay - by;
    });

    return arr.map(({ label, orders }) => ({ m: label, orders }));
  }, [rangeFilteredOrders]);

  // Weekly revenue (last 7 days) for line chart
  const weeklyRevenueData = useMemo(() => {
    if (orders.length === 0) return [];

    const now = new Date();
    const start = new Date();
    start.setDate(now.getDate() - 6); // last 7 days including today
    start.setHours(0, 0, 0, 0);

    const revenueByDayIndex = new Map<number, number>(); // 0-6 index for Mon..Sun

    orders.forEach((o) => {
      const d = new Date(o.createdAt);
      if (Number.isNaN(d.getTime())) return;
      if (d < start) return;
      if (o.status === "cancelled" || o.paymentStatus !== "paid") return;

      // Make Monday=0 ... Sunday=6
      const jsDay = d.getDay(); // 0=Sun..6=Sat
      const idx = jsDay === 0 ? 6 : jsDay - 1;

      const prev = revenueByDayIndex.get(idx) ?? 0;
      revenueByDayIndex.set(idx, prev + (o.total ?? o.subtotal ?? 0));
    });

    // Build data in Mon..Sun order
    return WEEK_DAYS.map((label, idx) => {
      const revenue = revenueByDayIndex.get(idx) ?? 0;
      return { d: label, rev: Number((revenue / 1000).toFixed(2)) }; // k AUD
    });
  }, [orders]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders(true);
  };

  return (
    <div className="space-y-6">
      {/* Header + Range + Refresh */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#1E2B4F]">
            Admin Overview
          </h2>
          <p className="text-sm text-neutral-600">
            High-level snapshot of orders, revenue, and user activity.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Range selector */}
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-700">
            <CalendarRange className="h-4 w-4 text-neutral-400" />
            <select
              className="bg-transparent text-xs focus:outline-none cursor-pointer"
              value={range}
              onChange={(e) => setRange(e.target.value as Range)}
            >
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>

          {/* Refresh button */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            <RefreshCcw
              className={`h-4 w-4 ${
                loading || refreshing ? "animate-spin text-[#1E2B4F]" : "text-neutral-500"
              }`}
            />
            {loading || refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Error */}
      {err && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4" />
          {err}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !err && (
        <div className="space-y-6 animate-pulse">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-neutral-200 bg-white p-4"
              >
                <div className="h-3 w-20 bg-neutral-200 rounded" />
                <div className="mt-2 h-6 w-24 bg-neutral-200 rounded" />
              </div>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-xl border border-neutral-200 p-4 shadow-sm lg:col-span-2">
              <div className="h-64 bg-neutral-100 rounded" />
            </div>
            <div className="rounded-xl border border-neutral-200 p-4 shadow-sm">
              <div className="h-64 bg-neutral-100 rounded" />
            </div>
          </div>
        </div>
      )}

      {!loading && !err && (
        <>
          {/* KPI cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-neutral-200 bg-[#FFF7EF] p-4 shadow-sm">
              <div className="text-xs font-medium text-[#6C758D]">
                Revenue ({range === "all" ? "all time" : range === "30d" ? "30 days" : "90 days"})
              </div>
              <div className="mt-1 text-2xl font-bold text-[#1E2B4F]">
                ${kpis.revenue.toFixed(2)}
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-[#FFF7EF] p-4 shadow-sm">
              <div className="text-xs font-medium text-[#6C758D]">Orders</div>
              <div className="mt-1 text-2xl font-bold text-[#1E2B4F]">
                {kpis.ordersCount}
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-[#FFF7EF] p-4 shadow-sm">
              <div className="text-xs font-medium text-[#6C758D]">Active users</div>
              <div className="mt-1 text-2xl font-bold text-[#1E2B4F]">
                {kpis.activeUsers}
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-[#FFF7EF] p-4 shadow-sm">
              <div className="text-xs font-medium text-[#6C758D]">Avg. order value</div>
              <div className="mt-1 text-2xl font-bold text-[#1E2B4F]">
                ${kpis.avgOrderValue.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Monthly Orders */}
            <div className="rounded-xl border border-neutral-200 p-4 shadow-sm lg:col-span-2">
              <div className="mb-3 flex items-center justify-between text-sm font-semibold text-[#1E2B4F]">
                <span>Monthly Orders</span>
                <span className="text-xs font-normal text-neutral-500">
                  Based on selected range
                </span>
              </div>
              <div className="h-64">
                {monthlyOrdersData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-xs text-neutral-500">
                    Not enough data for this range yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyOrdersData}>
                      <CartesianGrid vertical={false} stroke="#eee" />
                      <XAxis dataKey="m" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Bar radius={[6, 6, 0, 0]} dataKey="orders" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Weekly Revenue */}
            <div className="rounded-xl border border-neutral-200 p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between text-sm font-semibold text-[#1E2B4F]">
                <span>Weekly Revenue (k AUD)</span>
                <span className="text-xs font-normal text-neutral-500">
                  Last 7 days
                </span>
              </div>
              <div className="h-64">
                {weeklyRevenueData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-xs text-neutral-500">
                    Not enough data yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyRevenueData}>
                      <CartesianGrid vertical={false} stroke="#eee" />
                      <XAxis dataKey="d" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="rev" strokeWidth={2} dot />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Activity placeholder */}
          <div className="rounded-xl border border-neutral-200 p-4 shadow-sm">
            <div className="mb-1 text-sm font-semibold text-[#1E2B4F]">
              Activity
            </div>
            <p className="text-sm text-neutral-600">
              Recent events, logs, and quick summaries can appear here in the future
              (e.g., new admin logins, menu changes, major refunds, etc.).
            </p>
          </div>
        </>
      )}
    </div>
  );
}
