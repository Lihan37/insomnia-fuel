import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import type { IOrder, OrderStatus } from "@/types/order";
import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock,
  Loader2,
  Package,
  Receipt,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";

const statusStyles: Record<
  OrderStatus,
  { label: string; badge: string; dot: string }
> = {
  pending: {
    label: "Pending",
    badge: "bg-amber-100 text-amber-800",
    dot: "bg-amber-500",
  },
  preparing: {
    label: "Preparing",
    badge: "bg-blue-100 text-blue-800",
    dot: "bg-blue-500",
  },
  ready: {
    label: "Ready",
    badge: "bg-emerald-100 text-emerald-800",
    dot: "bg-emerald-500",
  },
  completed: {
    label: "Completed",
    badge: "bg-neutral-200 text-neutral-800",
    dot: "bg-neutral-600",
  },
  cancelled: {
    label: "Cancelled",
    badge: "bg-red-100 text-red-700",
    dot: "bg-red-500",
  },
};

const statusFlow: OrderStatus[] = [
  "pending",
  "preparing",
  "ready",
  "completed",
];

const formatDateTime = (value: string) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-AU", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function OrderDetails() {
  const { orderId } = useParams<{ orderId?: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        setErr(null);

        let targetId = orderId;

        // If no id provided (e.g. from checkout success), fall back to latest order
        if (!targetId) {
          const res = await api.get<{ orders?: IOrder[] }>("/api/orders/my");
          const latest = res.data.orders?.[0]?._id;
          targetId = latest || null;
        }

        if (!targetId) {
          setErr("We could not find any orders associated with your account yet.");
          return;
        }

        const res = await api.get(`/api/orders/${encodeURIComponent(targetId)}`);
        const data =
          res.data?.order ||
          res.data?.item ||
          res.data?.data ||
          res.data;

        if (!data || !data._id) {
          throw new Error("Order missing from response");
        }

        setOrder(data as IOrder);
      } catch (e) {
        console.error(e);
        setErr("Failed to load this order. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  const itemCount = useMemo(
    () => order?.items.reduce((sum, i) => sum + i.quantity, 0) || 0,
    [order]
  );

  const activeIndex = useMemo(() => {
    if (!order) return -1;
    return statusFlow.findIndex((s) => s === order.status);
  }, [order]);

  if (loading) {
    return (
      <section className="bg-[#F7F0E8] min-h-screen flex items-center justify-center px-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm border border-neutral-200">
          <Loader2 className="h-4 w-4 animate-spin text-[#3A2C20]" />
          <span className="text-sm text-neutral-700">Fetching your order...</span>
        </div>
      </section>
    );
  }

  if (err || !order) {
    return (
      <section className="bg-[#F7F0E8] min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-neutral-200 shadow-sm rounded-2xl p-6 space-y-4 text-center">
          <AlertCircle className="h-6 w-6 text-red-500 mx-auto" />
          <div>
            <h1 className="text-lg font-semibold text-[#3A2C20]">Order not found</h1>
            <p className="text-sm text-neutral-600 mt-1">
              {err || "We could not retrieve this order right now. Please try again."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="rounded-full border border-neutral-200 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition"
            >
              Go back
            </button>
            <Link
              to="/dashboard/my-orders"
              className="rounded-full bg-[#3A2C20] px-4 py-2 text-sm font-semibold text-white hover:bg-black transition"
            >
              View all orders
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const statusMeta = statusStyles[order.status];

  return (
    <section className="bg-[#F7F0E8] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-10 md:py-12 space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <span className="text-xs text-neutral-500">
            Order #{order._id.slice(-6)}
          </span>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 p-5 md:p-7 space-y-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                Order Details
              </p>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#3A2C20]">
                Order #{order._id.slice(-6)}
              </h1>
              <p className="text-sm text-neutral-600 flex items-center gap-2">
                <Clock className="h-4 w-4 text-neutral-400" />
                Placed {formatDateTime(order.createdAt)}
              </p>
            </div>

            <div className="text-right space-y-2">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.badge}`}
              >
                <span className={`h-2 w-2 rounded-full ${statusMeta.dot}`} />
                {statusMeta.label}
              </span>
              <div>
                <p className="text-xs uppercase tracking-wide text-neutral-500">
                  Total Paid
                </p>
                <p className="text-2xl font-bold text-[#3A2C20]">
                  ${order.total.toFixed(2)}
                </p>
                <p className="text-xs text-neutral-500">
                  {order.currency?.toUpperCase() || "AUD"} •{" "}
                  {(order.paymentStatus || "paid").toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-3">
              <div className="flex items-center gap-3">
                <Receipt className="h-5 w-5 text-[#3A2C20]" />
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-neutral-500">
                    Items
                  </p>
                  <p className="text-base font-semibold text-[#3A2C20]">
                    {itemCount} item{itemCount === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-3">
              <div className="flex items-center gap-3">
                <CalendarClock className="h-5 w-5 text-[#3A2C20]" />
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-neutral-500">
                    Last updated
                  </p>
                  <p className="text-base font-semibold text-[#3A2C20]">
                    {formatDateTime(order.updatedAt || order.createdAt)}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-3">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-[#3A2C20]" />
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-neutral-500">
                    Payment
                  </p>
                  <p className="text-base font-semibold text-[#3A2C20]">
                    {order.paymentStatus === "unpaid"
                      ? "Awaiting payment"
                      : "Paid in full"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            {statusFlow.map((step, idx) => {
              const meta = statusStyles[step];
              const isCompleted = activeIndex >= idx;
              const isCurrent = activeIndex === idx;

              return (
                <div key={step} className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center border-2 ${
                      isCompleted
                        ? "border-[#3A2C20] bg-[#3A2C20] text-white"
                        : "border-neutral-200 bg-white text-neutral-500"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <span className="text-xs font-semibold">
                        {idx + 1}
                      </span>
                    )}
                  </div>
                  <div className="min-w-[90px]">
                    <p
                      className={`text-sm font-semibold ${
                        isCompleted ? "text-[#3A2C20]" : "text-neutral-500"
                      }`}
                    >
                      {meta.label}
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      {isCurrent ? "In progress" : isCompleted ? "Done" : "Waiting"}
                    </p>
                  </div>
                  {idx < statusFlow.length - 1 && (
                    <div className="h-px w-10 bg-neutral-200 hidden md:block" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_1fr]">
          <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-[#3A2C20]" />
                <h2 className="text-lg font-semibold text-[#3A2C20]">
                  Items in this order
                </h2>
              </div>
              <span className="text-xs text-neutral-500">
                {itemCount} item{itemCount === 1 ? "" : "s"}
              </span>
            </div>

            <div className="divide-y divide-neutral-100">
              {order.items.map((item) => (
                <div
                  key={item.menuItemId}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="h-8 w-8 rounded-full bg-[#F7F0E8] text-[#3A2C20] font-semibold flex items-center justify-center text-sm">
                      {item.quantity}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#3A2C20] leading-tight">
                        {item.name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-[#3A2C20]">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {order.notes && (
              <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                <p className="font-semibold">Customer notes</p>
                <p className="text-xs text-amber-700 mt-1">{order.notes}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <ShoppingBag className="h-5 w-5 text-[#3A2C20]" />
                <h3 className="text-base font-semibold text-[#3A2C20]">
                  Order summary
                </h3>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-neutral-700">
                  <span>Subtotal</span>
                  <span>${(order.subtotal ?? order.total).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-700">
                  <span>Service fee</span>
                  <span>${(order.serviceFee ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-neutral-200 text-base font-semibold text-[#3A2C20]">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-[#3A2C20]" />
                <h3 className="text-base font-semibold text-[#3A2C20]">
                  Need help?
                </h3>
              </div>
              <p className="text-sm text-neutral-600">
                If something looks off with this order, reach out and we will help
                sort it out quickly.
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href="mailto:hello@insomniafuel.com"
                  className="rounded-full bg-[#3A2C20] text-white px-4 py-2 text-sm font-semibold hover:bg-black transition"
                >
                  Email support
                </a>
                <Link
                  to="/dashboard/my-orders"
                  className="rounded-full border border-neutral-200 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition"
                >
                  Back to orders
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
