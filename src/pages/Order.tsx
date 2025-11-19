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
          return a.name.localeCompare(b.name);
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

  const totalItems = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.quantity, 0),
    [cartItems]
  );

  const scrollToSection = (section: string) => {
    const id = `section-${section.replace(/\s+/g, "-")}`;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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

  return (
    <section className="bg-[#F7F0E8] min-h-[70vh]">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#1E2B4F] tracking-tight mb-4">
          Order Online
        </h1>
        <p className="text-sm md:text-base text-neutral-700 mb-6 max-w-2xl">
          Choose your platters, bowls and sandwiches. Adjust quantities on the
          right and we’ll keep a live total of your order.
        </p>

        <div className="grid gap-4 lg:grid-cols-[230px_minmax(0,1.6fr)_310px]">
          {/* LEFT: catalog */}
          <aside className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden lg:sticky lg:top-24 self-start">
            <div className="border-b border-neutral-200 px-4 py-3 text-xs font-semibold tracking-[0.2em] uppercase text-neutral-500">
              Catalog
            </div>
            <nav className="divide-y divide-neutral-100">
              {sectionNames.map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className="w-full text-left px-4 py-3 text-sm text-neutral-800 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  {section}
                </button>
              ))}
            </nav>
          </aside>

          {/* MIDDLE: items */}
          <main className="space-y-6">
            {sectionNames.map((section) => (
              <div
                key={section}
                id={`section-${section.replace(/\s+/g, "-")}`}
                className="transition-transform duration-200 hover:-translate-y-[1px]"
              >
                <div className="rounded-t-2xl bg-[#CFA878] text-center py-2 shadow-sm">
                  <h2 className="text-sm md:text-base font-semibold text-white tracking-[0.18em] uppercase">
                    {section}
                  </h2>
                </div>

                <div className="bg-white rounded-b-2xl border border-t-0 border-neutral-200 shadow-sm divide-y divide-neutral-100">
                  {sections[section].map((item) => {
                    const key = item._id ?? item.name;
                    const cartEntry = cartItems.find(
                      (c) => c.menuItemId === key
                    );
                    const qty = cartEntry?.quantity ?? 0;

                    return (
                      <div
                        key={key}
                        className="flex items-center gap-4 px-4 py-3 md:px-5 md:py-4 hover:bg-neutral-50/70 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="text-sm md:text-base font-semibold text-[#1E2B4F] truncate">
                              {item.name}
                            </h3>
                            <span className="text-sm md:text-base font-semibold text-[#1E2B4F] whitespace-nowrap">
                              ${item.price.toFixed(2)}
                              <span className="text-xs text-neutral-500 ml-1">
                                /serve
                              </span>
                            </span>
                          </div>
                          {item.description && (
                            <p className="mt-1 text-xs md:text-sm text-neutral-600">
                              {item.description}
                            </p>
                          )}
                        </div>

                        {/* qty controls */}
                        <div className="flex flex-col items-center gap-1">
                          <div className="inline-flex items-center rounded-full border border-neutral-300 bg-white px-3 py-1.5 shadow-sm">
                            {/* Minus */}
                            <button
                              type="button"
                              onClick={() => removeItem(key)}
                              disabled={qty === 0}
                              className="p-1.5 rounded-full cursor-pointer transition-all 
      disabled:opacity-40 disabled:cursor-not-allowed 
      hover:bg-neutral-100 active:bg-neutral-200"
                            >
                              <Minus
                                className={`h-4 w-4 ${
                                  qty === 0
                                    ? "text-neutral-400"
                                    : "text-neutral-700"
                                }`}
                              />
                            </button>

                            {/* Quantity Number */}
                            <span className="mx-3 w-6 text-center text-sm font-semibold text-neutral-900">
                              {qty}
                            </span>

                            {/* Plus */}
                            <button
                              type="button"
                              onClick={() => addItem(item)}
                              disabled={!item.isAvailable}
                              className="p-1.5 rounded-full cursor-pointer transition-all 
      disabled:opacity-40 disabled:cursor-not-allowed 
      hover:bg-neutral-100 active:bg-neutral-200"
                            >
                              <Plus
                                className={`h-4 w-4 ${
                                  item.isAvailable
                                    ? "text-neutral-700"
                                    : "text-neutral-400"
                                }`}
                              />
                            </button>
                          </div>

                          {!item.isAvailable && (
                            <span className="mt-1 text-[10px] font-medium text-red-600">
                              Unavailable
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </main>

          {/* RIGHT: live cart */}
          <aside className="bg-white rounded-2xl border border-neutral-200 shadow-sm lg:sticky lg:top-24 self-start flex flex-col max-h-[70vh]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-500">
                  Order Summary
                </p>
                <p className="text-sm text-neutral-700">
                  {totalItems} item{totalItems === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm">
              {cartItems.length === 0 ? (
                <p className="text-xs text-neutral-500">
                  Your cart is empty. Add a few platters from the list.
                </p>
              ) : (
                cartItems.map((ci) => (
                  <div
                    key={ci.menuItemId}
                    className="flex items-start justify-between gap-3 border-b border-dashed border-neutral-200 pb-2 last:border-b-0"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#1E2B4F]">
                        {ci.name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {ci.quantity} × ${ci.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#1E2B4F] whitespace-nowrap">
                        ${(ci.price * ci.quantity).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeLine(ci.menuItemId)}
                        className="p-1 rounded-full text-neutral-400 hover:text-red-500 hover:bg-red-50 cursor-pointer transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-neutral-200 px-4 py-3 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">Subtotal</span>
                <span className="text-base font-semibold text-[#1E2B4F]">
                  ${total.toFixed(2)}
                </span>
              </div>
              <button
                type="button"
                disabled={total === 0}
                onClick={checkout}
                className="w-full rounded-full bg-[#1E2B4F] py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#263567] disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
