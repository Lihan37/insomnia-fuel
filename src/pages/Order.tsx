// src/pages/Order.tsx
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { IMenuItem, MenuCategory } from "@/types/menu";
import { Loader2, Minus, Plus, Trash2, Star } from "lucide-react";
import { useCart } from "@/context/CartContext";

type TabId = "all" | MenuCategory;

const tabs: { id: TabId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "bowl", label: "Bowls" },
  { id: "sandwich", label: "Sandwiches & Toasties" },
  { id: "wrap", label: "Wraps" },
  { id: "breakfast", label: "Breakfast" },
  { id: "drink", label: "Drinks" },
  { id: "other", label: "Other" },
];

const prettySection = (label: string) =>
  label
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
    .trim();

function getDisplayPrice(item: IMenuItem) {
  if (item.subItems && item.subItems.length > 0) {
    const min = Math.min(...item.subItems.map((s) => s.price || 0));
    if (min > 0) return { label: "From", value: min };
  }
  return { label: "", value: item.price };
}

// Build a stable key for a variant (e.g. Regular/Large) so cart can track separately
const buildVariantKey = (item: IMenuItem, variant: string) =>
  `${item._id || item.name}::${variant}`;

function filterByTab(items: IMenuItem[], activeTab: TabId) {
  if (activeTab === "all") return items;

  if (activeTab === "breakfast") {
    return items.filter((item) => {
      if (item.category === "breakfast") return true;
      if (item.category === "addon") {
        const sec = (item.section || "").toLowerCase();
        return sec.includes("breakfast");
      }
      return false;
    });
  }

  if (activeTab === "drink") {
    return items.filter((item) => {
      if (item.category === "drink") return true;
      if (item.category === "addon") {
        const sec = (item.section || "").toLowerCase();
        return (
          sec.includes("drink") || sec.includes("coffee") || sec.includes("beverage")
        );
      }
      return false;
    });
  }

  return items.filter((item) => item.category === activeTab);
}

const Order = () => {
  const [items, setItems] = useState<IMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const {
    items: cartItems,
    addItem,
    removeItem,
    removeLine,
    total,
    checkout,
  } = useCart();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get<{ items: IMenuItem[] }>("/api/menu");
        const sorted = [...(res.data.items || [])].sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
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

  const filtered = useMemo(
    () => filterByTab(items, activeTab),
    [items, activeTab]
  );

  const sections = useMemo(() => {
    const map: Record<string, IMenuItem[]> = {};
    for (const item of filtered) {
      const key = item.section || "Insomnia Favourites";
      if (!map[key]) map[key] = [];
      map[key].push(item);
    }
    return map;
  }, [filtered]);

  const sectionNames = useMemo(() => Object.keys(sections), [sections]);

  useEffect(() => {
    if (sectionNames.length === 0) return;
    if (!activeSection || !sections[activeSection]) {
      setActiveSection(sectionNames[0]);
    }
  }, [activeSection, sectionNames, sections]);

  const currentSectionName =
    activeSection && sections[activeSection] ? activeSection : sectionNames[0];
  const currentItems =
    currentSectionName && sections[currentSectionName]
      ? sections[currentSectionName]
      : [];

  const totalItems = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.quantity, 0),
    [cartItems]
  );

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
      <div className="max-w-6xl w-full mx-auto px-4 py-8 md:py-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#1E2B4F] tracking-tight mb-2">
          Order Online
        </h1>
        <p className="text-sm md:text-base text-neutral-700 mb-6 max-w-2xl">
          Choose your platters, bowls and sandwiches. Adjust quantities and
          we will keep a live total of your order.
        </p>

        <div className="mb-6 -mx-4 px-4 md:mx-0 md:px-0">
          <div className="overflow-x-auto">
            <div className="inline-flex min-w-full md:min-w-0 gap-2 rounded-full bg-white px-2 py-2 border border-neutral-200 shadow-sm">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setActiveSection(null);
                    }}
                    className={[
                      "relative whitespace-nowrap rounded-full px-4 py-1.5 text-xs md:text-sm font-medium transition-all",
                      isActive
                        ? "bg-[#1E2B4F] text-white shadow-md"
                        : "text-neutral-700 hover:bg-neutral-50",
                    ].join(" ")}
                  >
                    {tab.label}
                    {isActive && (
                      <span className="absolute inset-0 rounded-full ring-2 ring-offset-2 ring-[#1E2B4F]/40 pointer-events-none" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-white border border-neutral-200 px-4 py-8 text-center text-sm text-neutral-600">
            No items found in this category yet.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_320px] items-start">
            <main className="w-full min-w-0">
              <div className="flex gap-2 overflow-x-auto pb-1 mb-5 -mx-4 px-4 md:mx-0 md:px-0">
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
                      {prettySection(section)}
                    </button>
                  );
                })}
              </div>

              <div className="rounded-2xl bg-[#CFA878] text-center py-2 shadow-sm mb-3">
                <h2 className="text-sm md:text-base font-semibold text-white tracking-[0.18em] uppercase">
                  {prettySection(currentSectionName || "")}
                </h2>
              </div>

              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm divide-y divide-neutral-100">
                {currentItems.map((item, idx) => {
                  const key = item._id ?? `${item.name}-${idx}`;
                  const isAvailable = item.isAvailable !== false;
                  const price = getDisplayPrice(item);

                  // Base item entry (no sub-options)
                  const baseEntry = item._id
                    ? cartItems.find((c) => c.menuItemId === item._id)
                    : undefined;
                  const baseQty = baseEntry?.quantity ?? 0;

                  return (
                    <div
                      key={key}
                      className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 py-4 md:px-5 hover:bg-neutral-50/70 transition rounded-xl"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm md:text-base font-semibold text-[#1E2B4F] break-words">
                            {item.name}
                          </p>
                          {item.isFeatured && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                              Signature
                            </span>
                          )}
                          {item.category === "addon" && (
                            <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                              Add-on
                            </span>
                          )}
                          {!isAvailable && (
                            <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                              Unavailable
                            </span>
                          )}
                        </div>

                        {item.description && (
                          <p className="mt-1 text-xs text-neutral-700">
                            {item.description}
                          </p>
                        )}

                        {item.subItems && item.subItems.length > 0 && (
                          <div className="mt-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-800">
                            <div className="mb-1 font-semibold text-neutral-700">
                              Options
                            </div>
                            <div className="grid gap-2 min-w-0">
                              {item.subItems.map((sub, i) => {
                                const variantKey = buildVariantKey(
                                  item,
                                  sub.name
                                );
                                const entry = cartItems.find(
                                  (c) => c.menuItemId === variantKey
                                );
                                const qty = entry?.quantity ?? 0;

                                return (
                                  <div
                                    key={`${key}-sub-${i}`}
                                    className="flex items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">
                                        {sub.name}
                                      </span>
                                      <span className="text-neutral-500">
                                        ${sub.price.toFixed(2)}
                                      </span>
                                    </div>

                                    <div className="inline-flex items-center rounded-full border border-neutral-300 bg-white px-2 py-1 shadow-sm">
                                      <button
                                        onClick={() => removeItem(variantKey)}
                                        disabled={qty === 0}
                                        className="p-1 rounded-full disabled:opacity-40 hover:bg-neutral-100 active:bg-neutral-200"
                                      >
                                        <Minus className="h-3.5 w-3.5 text-neutral-700" />
                                      </button>

                                      <span className="mx-2 w-5 text-center text-xs font-semibold text-neutral-900">
                                        {qty}
                                      </span>

                                      <button
                                        onClick={() =>
                                          addItem({
                                            ...item,
                                            _id: variantKey,
                                            name: `${item.name} (${sub.name})`,
                                            price: sub.price,
                                          })
                                        }
                                        disabled={!isAvailable}
                                        className="p-1 rounded-full disabled:opacity-40 hover:bg-neutral-100 active:bg-neutral-200"
                                      >
                                        <Plus className="h-3.5 w-3.5 text-neutral-700" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-3 md:flex-col md:items-end shrink-0">
                        <div className="text-right">
                          <span className="text-[11px] text-neutral-500">
                            {price.label && `${price.label} `}
                          </span>
                          <span className="text-base font-semibold text-[#1E2B4F]">
                            ${price.value.toFixed(2)}
                          </span>
                        </div>

                        {item.subItems && item.subItems.length > 0 ? (
                          <span className="text-[10px] text-neutral-500">
                            Choose an option to add
                          </span>
                        ) : (
                          <div className="inline-flex items-center rounded-full border border-neutral-300 bg-white px-3 py-1.5 shadow-sm">
                            <button
                              onClick={() => item._id && removeItem(item._id)}
                              disabled={baseQty === 0 || !item._id}
                              className="p-1.5 rounded-full disabled:opacity-40 hover:bg-neutral-100 active:bg-neutral-200"
                            >
                              <Minus className="h-4 w-4 text-neutral-700" />
                            </button>

                            <span className="mx-3 w-6 text-center text-sm font-semibold text-neutral-900">
                              {baseQty}
                            </span>

                            <button
                              onClick={() => item._id && addItem(item)}
                              disabled={!isAvailable || !item._id}
                              className="p-1.5 rounded-full disabled:opacity-40 hover:bg-neutral-100 active:bg-neutral-200"
                            >
                              <Plus className="h-4 w-4 text-neutral-700" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </main>

            <aside className="bg-white rounded-2xl border border-neutral-200 shadow-sm self-start max-h-[70vh] flex flex-col w-full">
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
                          {ci.quantity} x ${ci.price.toFixed(2)}
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
        )}
      </div>
    </section>
  );
};

export default Order;
