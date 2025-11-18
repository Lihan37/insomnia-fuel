// src/pages/dashboard/UserDashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api } from "@/lib/api";

type OrderItem = {
  name: string;
  quantity: number;
};

type Order = {
  _id: string;
  createdAt: string;
  total: number;
  status?: string;
  items: OrderItem[];
};

function DashboardTabs() {
  const location = useLocation();

  const tabs = [
    { label: "Overview", href: "/dashboard" },
    { label: "My Orders", href: "/dashboard/my-orders" },
  ];

  return (
    <div className="mt-6 border-b border-neutral-200">
      <nav className="flex gap-6 text-sm md:text-base">
        {tabs.map((tab) => {
          const active = location.pathname === tab.href;
          return (
            <Link
              key={tab.href}
              to={tab.href}
              className={`pb-3 border-b-2 transition-colors ${
                active
                  ? "border-[#3A2C20] text-[#3A2C20] font-semibold"
                  : "border-transparent text-neutral-500 hover:text-[#3A2C20]"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default function UserDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecent = async () => {
      try {
        const res = await api.get("/api/orders/my");
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error("Failed to load orders:", err);
      } finally {
        setLoading(false);
      }
    };

    loadRecent();
  }, []);

  const recentOrders = useMemo(() => orders.slice(0, 2), [orders]);

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const lastOrder = orders[0];

  return (
    <section className="max-w-6xl mx-auto px-4 py-10 min-h-screen">
      {/* Page heading */}
      <header>
        <h1 className="text-3xl md:text-4xl font-bold text-[#3A2C20]">
          Your Activity
        </h1>
        <p className="mt-2 text-neutral-600">
          Track your recent orders, spending and history in one place.
        </p>
      </header>

      {/* Tabs */}
      <DashboardTabs />

      {/* Main content */}
      {loading && (
        <div className="mt-10 grid gap-5 md:grid-cols-2 animate-pulse">
          <div className="h-28 bg-neutral-200 rounded-xl" />
          <div className="h-28 bg-neutral-200 rounded-xl" />
          <div className="h-32 bg-neutral-200 rounded-xl md:col-span-2" />
        </div>
      )}

      {!loading && totalOrders === 0 && (
        <div className="mt-12 text-center">
          <p className="text-lg font-semibold text-neutral-800">
            No orders yet.
          </p>
          <p className="text-neutral-500 mt-1">
            When you place an order, your activity will appear here.
          </p>
          <Link
            to="/menu"
            className="inline-block mt-6 bg-[#3A2C20] text-white px-6 py-2 rounded-full text-sm hover:bg-black transition"
          >
            Browse Menu
          </Link>
        </div>
      )}

      {!loading && totalOrders > 0 && (
        <div className="mt-10 space-y-8">
          {/* Stats row */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-neutral-500">
                Total Orders
              </p>
              <p className="mt-2 text-2xl font-bold text-[#3A2C20]">
                {totalOrders}
              </p>
              <p className="text-xs mt-1 text-neutral-500">
                Since you first started ordering.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-neutral-500">
                Last Order
              </p>
              {lastOrder ? (
                <>
                  <p className="mt-2 text-sm font-semibold text-[#3A2C20]">
                    {new Date(lastOrder.createdAt).toLocaleDateString()} ·{" "}
                    {new Date(lastOrder.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="text-xs mt-1 text-neutral-500">
                    {lastOrder.items[0]
                      ? `${lastOrder.items[0].quantity}× ${lastOrder.items[0].name}`
                      : "Order placed"}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm text-neutral-500">
                  You haven&apos;t ordered yet.
                </p>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-neutral-500">
                Total Spent
              </p>
              <p className="mt-2 text-2xl font-bold text-[#3A2C20]">
                ${totalSpent.toFixed(2)}
              </p>
              <p className="text-xs mt-1 text-neutral-500">
                Across all completed orders.
              </p>
            </div>
          </div>

          {/* Recent Orders */}
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#3A2C20]">
                Recent Orders
              </h2>
              <Link
                to="/dashboard/my-orders"
                className="text-sm text-[#3A2C20] underline hover:text-black transition"
              >
                View full history →
              </Link>
            </div>

            <div className="mt-4 space-y-5">
              {recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-neutral-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div>
                    <p className="font-semibold text-[#3A2C20] text-sm md:text-base">
                      Order #{order._id.slice(-6)}
                    </p>
                    <p className="text-xs md:text-sm text-neutral-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>

                    <div className="mt-2 text-sm text-neutral-700">
                      {order.items.slice(0, 2).map((i, idx) => (
                        <p key={idx}>
                          {i.quantity}× {i.name}
                        </p>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-xs text-neutral-500">
                          + {order.items.length - 2} more item
                          {order.items.length - 2 > 1 ? "s" : ""}…
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    <p className="font-semibold text-[#3A2C20] text-lg">
                      ${order.total.toFixed(2)}
                    </p>
                    <Link
                      to={`/dashboard/order/${order._id}`}
                      className="inline-block text-xs md:text-sm bg-[#3A2C20] text-white px-4 py-2 rounded-full hover:bg-black transition"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
