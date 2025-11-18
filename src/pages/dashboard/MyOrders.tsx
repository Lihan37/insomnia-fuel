// src/pages/dashboard/MyOrders.tsx
import { useEffect, useState } from "react";
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

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/api/orders/my");
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error("Failed to load user orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-4 py-10 min-h-screen">
      <header>
        <h1 className="text-3xl md:text-4xl font-bold text-[#3A2C20]">
          My Orders
        </h1>
        <p className="text-neutral-600 mt-2">
          Track your full order history and see details for each order.
        </p>
      </header>

      <DashboardTabs />

      {loading && (
        <div className="mt-10 space-y-4 animate-pulse">
          <div className="h-24 bg-neutral-200 rounded-xl" />
          <div className="h-24 bg-neutral-200 rounded-xl" />
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="mt-12 text-center">
          <p className="text-lg font-semibold text-neutral-800">
            No orders yet.
          </p>
          <p className="text-neutral-500 mt-1">
            Your order history will appear here once you order something.
          </p>
          <Link
            to="/menu"
            className="inline-block mt-6 bg-[#3A2C20] text-white px-6 py-2 rounded-full hover:bg-black transition"
          >
            Browse Menu
          </Link>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="mt-10 space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-100"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="font-bold text-lg text-[#3A2C20]">
                    Order #{order._id.slice(-6)}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {new Date(order.createdAt).toLocaleDateString()} ·{" "}
                    {new Date(order.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 text-xs rounded-full capitalize ${
                      order.status === "served"
                        ? "bg-green-100 text-green-700"
                        : order.status === "preparing"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-neutral-200 text-neutral-700"
                    }`}
                  >
                    {order.status || "pending"}
                  </span>
                  <p className="font-semibold text-[#3A2C20]">
                    ${order.total.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-4 text-sm text-neutral-700 space-y-1">
                {order.items.map((i, idx) => (
                  <p key={idx}>
                    {i.quantity} × {i.name}
                  </p>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <p className="text-xs text-neutral-500">
                  Need help with this order?{" "}
                  <a
                    href="mailto:hello@insomniafuel.com"
                    className="underline"
                  >
                    Contact us
                  </a>
                  .
                </p>

                <Link
                  to={`/dashboard/order/${order._id}`}
                  className="text-sm bg-[#3A2C20] text-white px-4 py-2 rounded-full hover:bg-black transition"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
