// src/pages/admin/AdminOrders.tsx
import {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { IOrder, OrderStatus } from "@/types/order";
import {
  Loader2,
  Mail,
  User2,
  ShoppingBag,
  Clock,
  Search,
  RefreshCcw,
  Download,
  AlertTriangle,
} from "lucide-react";
import Swal from "sweetalert2"; 
import notificationSound from "@/assets/Notification Sound.wav";

type StatusTab = "all" | OrderStatus;
type DateFilter = "all" | "today" | "7days";
type SortBy = "newest" | "oldest" | "amountDesc" | "amountAsc";

const statusTabs: { id: StatusTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "preparing", label: "Preparing" },
  { id: "ready", label: "Ready" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

const formatDateTime = (value: string) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-AU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusBadgeClasses = (status: OrderStatus) => {
  switch (status) {
    case "pending":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "preparing":
      return "bg-blue-50 text-blue-800 border-blue-200";
    case "ready":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "completed":
      return "bg-neutral-100 text-neutral-800 border-neutral-200";
    case "cancelled":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-neutral-100 text-neutral-700 border-neutral-200";
  }
};

const getAgeBadge = (createdAt: string) => {
  const created = new Date(createdAt);
  const diffMs = Date.now() - created.getTime();
  if (Number.isNaN(diffMs)) {
    return { label: "-", classes: "bg-neutral-100 text-neutral-600" };
  }

  const mins = Math.floor(diffMs / 60000);
  let label = "";
  if (mins <= 0) label = "Just now";
  else if (mins === 1) label = "1 min ago";
  else label = `${mins} mins ago`;

  let classes = "bg-neutral-100 text-neutral-700";
  if (mins >= 20) classes = "bg-red-50 text-red-700";
  else if (mins >= 10) classes = "bg-amber-50 text-amber-800";

  return { label, classes };
};

const pageSize = 20;

export default function AdminOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [activeStatus, setActiveStatus] = useState<StatusTab>("all");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const notificationRef = useRef<HTMLAudioElement | null>(null);
  const hasLoadedRef = useRef(false);
  const prevOrderIdsRef = useRef<Set<string>>(new Set());

  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const audio = new Audio(notificationSound);
    audio.preload = "auto";
    audio.volume = 0.6;
    notificationRef.current = audio;
    return () => {
      notificationRef.current = null;
    };
  }, []);

  const playNotificationSound = useCallback(() => {
    const audio = notificationRef.current;
    if (!audio) return;
    try {
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => undefined);
      }
    } catch (error) {
      console.error("Failed to play notification sound:", error);
    }
  }, []);

  const fetchOrders = useCallback(
    async (opts?: { silent?: boolean }) => {
      try {
        if (!opts?.silent) setLoading(true);
        setErr(null);

        if (!user) {
          setOrders([]);
          setErr("You must be logged in as admin to view orders.");
          hasLoadedRef.current = false;
          prevOrderIdsRef.current = new Set();
          return;
        }

        const token = await user.getIdToken();
        const res = await api.get<{ items: IOrder[] }>("/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const nextItems = res.data.items || [];
        if (hasLoadedRef.current) {
          const prevIds = prevOrderIdsRef.current;
          const hasNewOrder = nextItems.some((order) => !prevIds.has(order._id));
          if (hasNewOrder) {
            playNotificationSound();
          }
        }
        prevOrderIdsRef.current = new Set(nextItems.map((order) => order._id));
        hasLoadedRef.current = true;
        setOrders(nextItems);
      } catch (error) {
        console.error(error);
        setErr("Failed to load orders.");
      } finally {
        if (!opts?.silent) setLoading(false);
      }
    },
    [user, playNotificationSound]
  );

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      fetchOrders();
    }

    const id = setInterval(() => {
      if (mounted) fetchOrders({ silent: true });
    }, 60000); // auto-refresh every 60s

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [fetchOrders]);

  // Reset to page 1 whenever filters/search/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeStatus, dateFilter, searchTerm, sortBy]);

  const counts = useMemo(() => {
    const base: Record<StatusTab, number> = {
      all: orders.length,
      pending: 0,
      preparing: 0,
      ready: 0,
      completed: 0,
      cancelled: 0,
    };
    orders.forEach((o) => {
      base[o.status] = (base[o.status] ?? 0) + 1;
    });
    return base;
  }, [orders]);

  const summary = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    let totalToday = 0;
    let revenueToday = 0;
    let pending = 0;
    let preparing = 0;
    let ready = 0;

    orders.forEach((o) => {
      const created = new Date(o.createdAt);
      const amount =
        typeof o.total === "number" ? o.total : o.subtotal ?? 0;

      if (created >= todayStart) {
        totalToday += 1;
        if (o.status !== "cancelled" && o.paymentStatus === "paid") {
          revenueToday += amount;
        }
      }

      if (o.status === "pending") pending += 1;
      if (o.status === "preparing") preparing += 1;
      if (o.status === "ready") ready += 1;
    });

    return { totalToday, revenueToday, pending, preparing, ready };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let data = [...orders];

    // Status tab
    if (activeStatus !== "all") {
      data = data.filter((o) => o.status === activeStatus);
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = Date.now();
      if (dateFilter === "today") {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        data = data.filter(
          (o) => new Date(o.createdAt).getTime() >= start.getTime()
        );
      } else if (dateFilter === "7days") {
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
        data = data.filter(
          (o) => now - new Date(o.createdAt).getTime() <= sevenDaysMs
        );
      }
    }

    // Search (ID suffix, name, email)
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      data = data.filter((o) => {
        const idShort = o._id.slice(-4).toLowerCase();
        const idFull = o._id.toLowerCase();
        const name = (o.userName || "").toLowerCase();
        const email = (o.email || "").toLowerCase();
        return (
          idFull.includes(term) ||
          idShort.includes(term) ||
          name.includes(term) ||
          email.includes(term)
        );
      });
    }

    // Sorting
    data.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      const aAmount =
        typeof a.total === "number" ? a.total : a.subtotal ?? 0;
      const bAmount =
        typeof b.total === "number" ? b.total : b.subtotal ?? 0;

      if (sortBy === "newest") return bTime - aTime;
      if (sortBy === "oldest") return aTime - bTime;
      if (sortBy === "amountDesc") return bAmount - aAmount;
      if (sortBy === "amountAsc") return aAmount - bAmount;
      return 0;
    });

    return data;
  }, [orders, activeStatus, dateFilter, searchTerm, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / pageSize)
  );
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage]);

  

const handleStatusChange = async (
  orderId: string,
  newStatus: OrderStatus
) => {
  if (!user) return;

  try {
    // Smooth + professional confirmation modal
    if (newStatus === "completed" || newStatus === "cancelled") {
      const result = await Swal.fire({
        icon: "question",
        title: `Mark order as "${newStatus}"?`,
        text:
          newStatus === "completed"
            ? "This will finalize the order."
            : "This will cancel the order.",
        showCancelButton: true,
        confirmButtonText: "Yes, confirm",
        cancelButtonText: "No, go back",
        confirmButtonColor: "#1E2B4F",
        cancelButtonColor: "#888",
        background: "#fff",
      });

      if (!result.isConfirmed) return;
    }

    const token = await user.getIdToken();

    await api.put(
      `/api/orders/${orderId}`,
      { status: newStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Update UI
    setOrders((prev) =>
      prev.map((o) =>
        o._id === orderId ? { ...o, status: newStatus } : o
      )
    );

    // Success toast
    Swal.fire({
      icon: "success",
      title: `Order marked as ${newStatus}`,
      timer: 1200,
      showConfirmButton: false,
    });

  } catch (error) {
    console.error("Failed to update status", error);

    Swal.fire({
      icon: "error",
      title: "Update failed",
      text: "Failed to update the order status. Try again.",
    });
  }
};

  const handlePaymentStatusChange = async (
    orderId: string,
    paymentStatus: "paid" | "unpaid"
  ) => {
    if (!user) return;

    try {
      const result = await Swal.fire({
        icon: "question",
        title: "Mark as paid?",
        text: "This will record that the customer paid at the counter.",
        showCancelButton: true,
        confirmButtonText: "Yes, mark paid",
        cancelButtonText: "No, go back",
        confirmButtonColor: "#1E2B4F",
        cancelButtonColor: "#888",
        background: "#fff",
      });

      if (!result.isConfirmed) return;

      const token = await user.getIdToken();
      await api.put(
        `/api/orders/${orderId}`,
        { paymentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, paymentStatus } : o
        )
      );

      Swal.fire({
        icon: "success",
        title: "Payment updated",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Failed to update payment", error);
      Swal.fire({
        icon: "error",
        title: "Update failed",
        text: "Failed to update payment status. Try again.",
      });
    }
  };


  const downloadInvoice = (order: IOrder) => {
    const amount =
      typeof order.total === "number"
        ? order.total
        : order.subtotal ?? 0;

    const win = window.open("", "_blank");
    if (!win) return;

    const doc = win.document;
    doc.write(`
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Invoice #${order._id.slice(-6)}</title>
        <style>
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont,
              "Segoe UI", sans-serif;
            padding: 24px;
            color: #111827;
            background: #f9fafb;
          }
          .invoice {
            max-width: 720px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 10px 30px rgba(15, 23, 42, 0.1);
          }
          h1 {
            font-size: 20px;
            margin-bottom: 4px;
          }
          .muted {
            color: #6b7280;
            font-size: 12px;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin-top: 16px;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 24px;
            font-size: 13px;
          }
          th, td {
            padding: 8px 6px;
            border-bottom: 1px solid #e5e7eb;
            text-align: left;
          }
          th {
            font-weight: 600;
            background: #f9fafb;
          }
          .right { text-align: right; }
          .totals {
            margin-top: 16px;
            font-size: 13px;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            margin-top: 4px;
          }
          .totals-row.total {
            font-weight: 700;
          }
        </style>
      </head>
      <body>
        <div class="invoice">
          <h1>Insomnia Fuel - Tax Invoice</h1>
          <div class="muted">Order #${order._id.slice(
            -6
          )}</div>
          <div class="muted">
            ${formatDateTime(order.createdAt)}
          </div>

          <div class="row">
            <div>
              <strong>Bill to:</strong><br />
              ${order.userName || "Guest"}<br />
              ${order.email || ""}
            </div>
            <div style="text-align:right;">
              <strong>Status:</strong> ${
                order.status
              }<br />
              <strong>Payment:</strong> ${
                order.paymentStatus === "paid"
                  ? "Paid at counter"
                  : "Pay at counter"
              }<br />
              <strong>Items:</strong> ${order.items.reduce(
                (sum, it) => sum + it.quantity,
                0
              )}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th class="right">Price</th>
                <th class="right">Qty</th>
                <th class="right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items
                .map(
                  (it) => `
                <tr>
                  <td>${it.name}</td>
                  <td class="right">$${it.price.toFixed(2)}</td>
                  <td class="right">${it.quantity}</td>
                  <td class="right">$${(it.price * it.quantity).toFixed(
                    2
                  )}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row">
              <span>Subtotal</span>
              <span>$${(order.subtotal ?? amount).toFixed(2)}</span>
            </div>
            <div class="totals-row">
              <span>Service fee</span>
              <span>$${(order.serviceFee ?? 0).toFixed(2)}</span>
            </div>
            <div class="totals-row total">
              <span>Total</span>
              <span>$${amount.toFixed(2)}</span>
            </div>
          </div>

          ${
            order.notes
              ? `<div style="margin-top:16px;font-size:12px;">
                   <strong>Customer notes:</strong><br />
                   ${order.notes}
                 </div>`
              : ""
          }
        </div>

        <script>
          window.print();
        </script>
      </body>
      </html>
    `);

    doc.close();
    win.focus();
  };

  return (
    <div className="space-y-6">
      {/* Header + Refresh */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#1E2B4F]">
            Orders
          </h2>
          <p className="text-sm text-neutral-600">
            Track all customer orders in real time with status and
            totals.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchOrders()}
          className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 cursor-pointer"
          disabled={loading}
        >
          <RefreshCcw
            className={`h-4 w-4 ${
              loading ? "animate-spin text-[#1E2B4F]" : "text-neutral-500"
            }`}
          />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
            Orders today
          </p>
          <p className="mt-2 text-2xl font-bold text-[#1E2B4F]">
            {summary.totalToday}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            Since midnight local time.
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
            Revenue today
          </p>
          <p className="mt-2 text-2xl font-bold text-[#1E2B4F]">
            ${summary.revenueToday.toFixed(2)}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            Excludes cancelled orders.
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
            Pending
          </p>
          <p className="mt-2 text-2xl font-bold text-amber-700">
            {summary.pending}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            Waiting to be started.
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
            In kitchen
          </p>
          <p className="mt-2 text-2xl font-bold text-blue-800">
            {summary.preparing + summary.ready}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            Preparing + ready to serve.
          </p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {statusTabs.map((tab) => {
            const isActive = activeStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveStatus(tab.id)}
                className={[
                  "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs md:text-sm font-medium transition cursor-pointer",
                  isActive
                    ? "bg-[#1E2B4F] border-[#1E2B4F] text-white shadow-sm"
                    : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50",
                ].join(" ")}
              >
                <span>{tab.label}</span>
                <span
                  className={[
                    "inline-flex h-5 min-w-[20px] items-center justify-center rounded-full text-[10px]",
                    isActive
                      ? "bg-white/10"
                      : "bg-neutral-100 text-neutral-600",
                  ].join(" ")}
                >
                  {counts[tab.id]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by name, email, or order ID..."
            className="w-full rounded-full border border-neutral-200 bg-white py-2 pl-9 pr-3 text-xs md:text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1E2B4F]/40"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Date + sort */}
        <div className="flex flex-wrap gap-2 text-xs md:text-sm">
          <select
            value={dateFilter}
            onChange={(e) =>
              setDateFilter(e.target.value as DateFilter)
            }
            className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#1E2B4F]/40 cursor-pointer"
          >
            <option value="all">All dates</option>
            <option value="today">Today</option>
            <option value="7days">Last 7 days</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as SortBy)
            }
            className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#1E2B4F]/40 cursor-pointer"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="amountDesc">Amount: high → low</option>
            <option value="amountAsc">Amount: low → high</option>
          </select>
        </div>
      </div>

      {/* Orders list */}
      <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
        <div className="border-b border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-700 flex items-center justify-between">
          <span>Orders list</span>
          <span className="text-xs text-neutral-500">
            Showing{" "}
            {filteredOrders.length === 0
              ? 0
              : (currentPage - 1) * pageSize +
                paginatedOrders.length}{" "}
            of {filteredOrders.length} filtered orders
            {filteredOrders.length !== orders.length &&
              ` · Total ${orders.length}`}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-700">
              <Loader2 className="h-4 w-4 animate-spin text-[#1E2B4F]" />
              Loading orders...
            </div>
          </div>
        ) : err ? (
          <div className="flex items-center gap-2 px-4 py-4 text-sm text-red-700 bg-red-50 border-t border-red-200">
            <AlertTriangle className="h-4 w-4" />
            {err}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-neutral-600">
            No orders found for this filter yet.
          </div>
        ) : (
          <>
            <div className="divide-y divide-neutral-100">
              {paginatedOrders.map((order) => {
                const itemCount = order.items.reduce(
                  (sum, it) => sum + it.quantity,
                  0
                );
                const isExpanded = expandedId === order._id;
                const age = getAgeBadge(order.createdAt);
                const amount =
                  typeof order.total === "number"
                    ? order.total
                    : order.subtotal ?? 0;
                const isPaid = order.paymentStatus === "paid";

                return (
                  <div
                    key={order._id}
                    className="px-4 py-3 text-sm hover:bg-neutral-50/60 transition-colors"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      {/* left side */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono text-neutral-500">
                            #{order._id.slice(-4)}
                          </span>
                          <span className="inline-flex items-center gap-1 text-neutral-800">
                            <User2 className="h-3 w-3 text-neutral-500" />
                            {order.userName || "Guest"}
                          </span>
                          {order.email && (
                            <span className="inline-flex items-center gap-1 text-neutral-500">
                              <Mail className="h-3 w-3" />
                              {order.email}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDateTime(order.createdAt)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <ShoppingBag className="h-3 w-3" />
                            {itemCount} item
                            {itemCount !== 1 && "s"}
                          </span>
                          <span
                            className={[
                              "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                              age.classes,
                            ].join(" ")}
                          >
                            {age.label}
                          </span>
                        </div>
                      </div>

                      {/* right side */}
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-xs text-neutral-500">
                              Total
                            </div>
                            <div className="text-sm font-semibold text-[#1E2B4F]">
                              ${amount.toFixed(2)}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            <span
                              className={[
                                "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
                                isPaid
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-amber-50 text-amber-800 border-amber-200",
                              ].join(" ")}
                            >
                              {isPaid ? "Paid at counter" : "Pay at counter"}
                            </span>
                            {!isPaid && (
                              <button
                                type="button"
                                onClick={() =>
                                  handlePaymentStatusChange(
                                    order._id,
                                    "paid"
                                  )
                                }
                                className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-[11px] text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                              >
                                Mark paid
                              </button>
                            )}
                          </div>

                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(
                                order._id,
                                e.target.value as OrderStatus
                              )
                            }
                            className={[
                              "cursor-pointer rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize",
                              statusBadgeClasses(order.status),
                            ].join(" ")}
                          >
                            <option value="pending">Pending</option>
                            <option value="preparing">Preparing</option>
                            <option value="ready">Ready</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedId((prev) =>
                                prev === order._id ? null : order._id
                              )
                            }
                            className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] text-[#1E2B4F] hover:bg-neutral-50 cursor-pointer"
                          >
                            {isExpanded ? "Hide items" : "View items"}
                          </button>

                          <button
                            type="button"
                            onClick={() => downloadInvoice(order)}
                            className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                          >
                            <Download className="h-3 w-3" />
                            Invoice
                          </button>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 rounded-xl bg-neutral-50 px-3 py-3 text-xs text-neutral-700 grid gap-3 md:grid-cols-[2fr,1fr]">
                        {/* Items */}
                        <div>
                          <div className="mb-2 text-[11px] font-semibold text-neutral-600">
                            Order items
                          </div>
                          <div className="space-y-1.5">
                            {order.items.map((it) => (
                              <div
                                key={`${order._id}-${it.menuItemId}`}
                                className="flex items-center justify-between gap-2"
                              >
                                <div>
                                  <div className="font-medium">
                                    {it.name}
                                  </div>
                                  <div className="text-[11px] text-neutral-500">
                                    ${it.price.toFixed(2)} ×{" "}
                                    {it.quantity}
                                  </div>
                                </div>
                                <div className="text-[11px] font-semibold text-neutral-800">
                                  ${(it.price * it.quantity).toFixed(2)}
                                </div>
                              </div>
                            ))}
                          </div>

                          {order.notes && (
                            <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-[11px] text-amber-800 border border-amber-200">
                              <span className="font-semibold">
                                Customer notes:
                              </span>{" "}
                              {order.notes}
                            </div>
                          )}
                        </div>

                        {/* Totals */}
                        <div className="border-t md:border-t-0 md:border-l border-neutral-200 pt-2 md:pt-0 md:pl-3 text-[11px] space-y-1">
                          <div className="flex justify-between text-neutral-600">
                            <span>Subtotal</span>
                            <span>
                              ${(order.subtotal ?? amount).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-neutral-600">
                            <span>Service fee</span>
                            <span>
                              ${(order.serviceFee ?? 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between font-semibold text-[#1E2B4F]">
                            <span>Total</span>
                            <span>${amount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3 text-xs text-neutral-600">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((p) => Math.max(1, p - 1))
                  }
                  disabled={currentPage === 1}
                  className="rounded-full border border-neutral-200 bg-white px-3 py-1 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Previous
                </button>

                <span>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(totalPages, p + 1)
                    )
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-full border border-neutral-200 bg-white px-3 py-1 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
