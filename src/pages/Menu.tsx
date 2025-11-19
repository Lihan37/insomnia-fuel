// src/pages/Menu.tsx
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { IMenuItem, MenuCategory } from "@/types/menu";
import { Loader2, Star } from "lucide-react";

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

export default function Menu() {
  const [items, setItems] = useState<IMenuItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get<{ items: IMenuItem[] }>("/api/menu");
        const sorted = [...(res.data.items || [])].sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return a.name.localeCompare(b.name);
        });
        setItems(sorted);
      } catch (error) {
        console.error(error);
        setErr("Failed to load menu. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered =
    activeTab === "all"
      ? items
      : items.filter((item) => item.category === activeTab);

  const groupedBySection = filtered.reduce<Record<string, IMenuItem[]>>(
    (acc, item) => {
      const key = item.section || "Insomnia Favourites";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    },
    {}
  );

  return (
    <section className="bg-[#FFF7EC]">
      <div className="max-w-6xl mx-auto px-4 py-14 md:py-20">
        {/* Hero / Intro block */}
        <div className="flex flex-col items-center text-center mb-10 md:mb-14 space-y-6">
          {/* Floating coffee icon */}
          <div className="inline-flex items-center justify-center rounded-full border border-amber-200 bg-white/80 px-5 py-2 shadow-sm backdrop-blur-sm transition-transform duration-500 hover:-translate-y-0.5">
            <span className="text-xl mr-2">☕</span>
            <span className="text-xs tracking-[0.25em] uppercase text-[#6B4A2F]">
              Crafted With Insomnia Fuel
            </span>
          </div>

          {/* Copy like your reference image */}
          <p className="max-w-3xl text-lg md:text-2xl font-serif text-[#1E2B4F] leading-relaxed">
            Experience bold flavours and comforting classics, designed to keep
            late nights, early mornings and everything in between deliciously
            fuelled.
          </p>

          {/* Divider with icon */}
          <div className="flex items-center w-full max-w-3xl">
            <span className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-200 to-amber-400" />
            <span className="mx-3 text-2xl md:text-3xl transition-transform duration-700 hover:rotate-6">
              ☕
            </span>
            <span className="flex-1 h-px bg-gradient-to-l from-transparent via-amber-200 to-amber-400" />
          </div>

          {/* Big title */}
          <h1 className="text-3xl md:text-5xl font-serif text-[#3B2416] tracking-wide">
            Our All-Day Menu
          </h1>
        </div>

        {/* Tabs */}
        <div className="mb-8 overflow-x-auto">
          <div className="inline-flex gap-2 md:gap-3 rounded-full bg-white/70 px-2 py-2 border border-amber-100 shadow-sm">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={[
                    "relative whitespace-nowrap rounded-full px-4 py-1.5 text-xs md:text-sm font-medium transition-all duration-300",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1E2B4F]",
                    isActive
                      ? "bg-[#1E2B4F] text-amber-50 shadow-md"
                      : "text-[#4A3A28] hover:bg-amber-50/80",
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

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 shadow-sm border border-neutral-200">
              <Loader2 className="h-4 w-4 animate-spin text-[#1E2B4F]" />
              <span className="text-sm text-neutral-700">Brewing menu…</span>
            </div>
          </div>
        ) : err ? (
          <div className="rounded-2xl bg-red-50/80 border border-red-200 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl bg-white/80 border border-neutral-200 px-4 py-10 text-center text-sm text-neutral-600">
            No items found in this category yet.
          </div>
        ) : (
          <div className="space-y-10 md:space-y-12">
            {Object.entries(groupedBySection).map(([section, sectionItems], i) => (
              <div
                key={section}
                className="animate-[fadeInUp_0.6s_ease-out_forwards]"
                style={{ animationDelay: `${i * 120}ms` as string }}
              >
                {/* Section heading */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">✶</span>
                    <h2 className="text-xs md:text-sm tracking-[0.25em] uppercase text-[#6B4A2F]">
                      {section}
                    </h2>
                  </div>
                </div>

                {/* Cards grid */}
                <div className="grid gap-4 md:gap-5 sm:grid-cols-2">
                  {sectionItems.map((item, idx) => (
                    <article
                      key={item._id ?? `${item.name}-${idx}`}
                      className="group flex flex-col rounded-3xl border border-amber-100 bg-white/80 p-5 md:p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm md:text-base font-semibold text-[#1E2B4F] leading-snug">
                            {item.name}
                          </h3>

                          <p className="mt-2 text-xs md:text-sm text-neutral-700 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span className="inline-flex items-baseline gap-0.5 text-sm md:text-base font-semibold text-[#3B2416]">
                            <span className="text-[11px] md:text-xs align-super">
                              $
                            </span>
                            {item.price.toFixed(2)}
                          </span>

                          {item.isFeatured && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100/90 px-2 py-0.5 text-[10px] font-medium text-amber-800 shadow-[0_0_0_1px_rgba(251,191,36,0.4)]">
                              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                              Signature
                            </span>
                          )}

                          {!item.isAvailable && (
                            <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">
                              Unavailable
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="mt-4 flex items-center justify-between">
                        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-amber-800">
                          {item.category}
                        </span>
                        <span className="text-[10px] text-neutral-400 group-hover:text-neutral-600 transition-colors">
                          Served all day · Fresh
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* simple keyframes for fade in (Tailwind doesn't know but CSS will) */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
