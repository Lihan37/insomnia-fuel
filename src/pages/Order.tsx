// src/pages/Order.tsx
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { IMenuItem } from "@/types/menu";
import { Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";

const Order = () => {
  const [items, setItems] = useState<IMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const {
    items: cartItems,
    addItem,
    removeItem,
    removeLine,
    total,
    checkout,
  } = useCart();

  // ---------- fetch menu ----------
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get<{ items: IMenuItem[] }>("/api/menu");

        const sorted = [...(res.data.items || [])].sort((a, b) => {
          const sa = a.section || "";
          const sb = b.section || "";
          if (sa !== sb) return sa.localeCompare(sb);
          // sort foods by PRICE low → high
          return a.price - b.price;
        });

        setItems(sorted);
      } catch (e) {
        console.error(e);
        setErr("Failed to load menu. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ---------- grouped sections ----------
  const sections = useMemo(() => {
    const map: Record<string, IMenuItem[]> = {};
    for (const item of items) {
      const key = item.section || "Insomnia Favourites";
      if (!map[key]) map[key] = [];
      map[key].push(item);
    }
    return map;
  }, [items]);

  const sectionNames = useMemo(() => Object.keys(sections), [sections]);

  useEffect(() => {
    if (!activeSection && sectionNames.length > 0) {
      setActiveSection(sectionNames[0]);
    }
  }, [activeSection, sectionNames]);

  const totalItems = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.quantity, 0),
    [cartItems]
  );

  // ---------- render ----------
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm border border-neutral-200">
          <Loader2 className="h-4 w-4 animate-spin text-[#1E2B4F]" />
          <span className="text-sm text-neutral-700">Loading menu...</span>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="max-w-3xl mx-auto mt-10 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
        {err}
      </div>
    );
  }

  const currentSectionName =
    activeSection && sections[activeSection] ? activeSection : sectionNames[0];

  const currentItems =
    currentSectionName && sections[currentSectionName]
      ? sections[currentSectionName]
      : [];

  return (
    <section className="bg-[#F7F0E8] min-h-[70vh]">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#1E2B4F] tracking-tight mb-2">
          Order Online
        </h1>
        <p className="text-sm md:text-base text-neutral-700 mb-6 max-w-2xl">
          Choose your platters, bowls and sandwiches. Adjust quantities and
          we’ll keep a live total of your order.
        </p>

        {/* GRID → stacks on mobile, side-by-side on desktop */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_320px]">
          {/* LEFT: menu */}
          <main className="w-full">
            {/* Category pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 mb-5">
              {sectionNames.map((section) => {
                const isActive = section === currentSectionName;
                return (
                  <button
                    key={section}
                    onClick={() => setActiveSection(section)}
                    className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs md:text-sm font-medium transition-all ${
                      isActive
                        ? "bg-[#1E2B4F] text-white border-[#1E2B4F]"
                        : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"
                    }`}
                  >
                    {section}
                  </button>
                );
              })}
            </div>

            {/* Section title */}
            <div className="rounded-2xl bg-[#CFA878] text-center py-2 shadow-sm mb-3">
              <h2 className="text-sm md:text-base font-semibold text-white tracking-[0.18em] uppercase">
                {currentSectionName}
              </h2>
            </div>

            {/* FOOD LIST */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm divide-y divide-neutral-100">
              {currentItems.map((item) => {
                const key = item._id ?? item.name;
                const entry = cartItems.find((c) => c.menuItemId === key);
                const qty = entry?.quantity ?? 0;

                return (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-4 px-4 py-4 md:px-5 hover:bg-neutral-50/70 transition rounded-xl"
                  >
                    {/* Name + Price */}
                    <div className="flex-1">
                      <p className="text-sm md:text-base font-semibold text-[#1E2B4F]">
                        {item.name}
                      </p>
                      <p className="text-sm font-semibold text-[#1E2B4F]">
                        ${item.price.toFixed(2)}
                        <span className="text-xs text-neutral-500 ml-1">
                          /serve
                        </span>
                      </p>
                    </div>

                    {/* QTY CONTROLS */}
                    <div className="flex items-center">
                      <div className="inline-flex items-center rounded-full border border-neutral-300 bg-white px-3 py-1.5 shadow-sm">
                        {/* minus */}
                        <button
                          onClick={() => removeItem(key)}
                          disabled={qty === 0}
                          className="p-1.5 rounded-full disabled:opacity-40 hover:bg-neutral-100 active:bg-neutral-200"
                        >
                          <Minus className="h-4 w-4 text-neutral-700" />
                        </button>

                        <span className="mx-3 w-6 text-center text-sm font-semibold text-neutral-900">
                          {qty}
                        </span>

                        {/* plus */}
                        <button
                          onClick={() => addItem(item)}
                          disabled={!item.isAvailable}
                          className="p-1.5 rounded-full disabled:opacity-40 hover:bg-neutral-100 active:bg-neutral-200"
                        >
                          <Plus className="h-4 w-4 text-neutral-700" />
                        </button>
                      </div>

                      {!item.isAvailable && (
                        <span className="ml-2 text-[10px] font-medium text-red-600">
                          Unavailable
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </main>

          {/* RIGHT: CART — responsive */}
          <aside className="bg-white rounded-2xl border border-neutral-200 shadow-sm self-start max-h-[70vh] flex flex-col">
            <div className="px-4 py-3 border-b border-neutral-200">
              <p className="text-xs font-semibold tracking-[0.2em] text-neutral-500 uppercase">
                Order Summary
              </p>
              <p className="text-sm text-neutral-700">
                {totalItems} item{totalItems === 1 ? "" : "s"}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {cartItems.length === 0 ? (
                <p className="text-xs text-neutral-500">Your cart is empty.</p>
              ) : (
                cartItems.map((ci) => (
                  <div
                    key={ci.menuItemId}
                    className="flex justify-between items-start border-b border-dashed border-neutral-200 pb-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#1E2B4F]">
                        {ci.name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {ci.quantity} × ${ci.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#1E2B4F]">
                        ${(ci.price * ci.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeLine(ci.menuItemId)}
                        className="p-1 rounded-full text-neutral-400 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-neutral-200 px-4 py-3 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Subtotal</span>
                <span className="text-base font-semibold text-[#1E2B4F]">
                  ${total.toFixed(2)}
                </span>
              </div>

              <button
                onClick={checkout}
                disabled={total === 0}
                className="w-full rounded-full bg-[#1E2B4F] py-2.5 text-sm font-semibold text-white hover:bg-[#263567] disabled:opacity-60"
              >
                Checkout
              </button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default Order;
