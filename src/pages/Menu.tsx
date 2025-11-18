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
    <section className="max-w-6xl mx-auto px-4 py-10 md:py-14">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#1E2B4F] tracking-tight">
          Our Menu
        </h1>
        <p className="mt-2 text-sm md:text-base text-neutral-600 max-w-2xl">
          Global flavours, crafted in Parramatta. Bowls, toasties, wraps and
          more — all designed to keep your day fuelled.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-2 md:gap-3 min-w-max">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={[
                  "whitespace-nowrap rounded-full border px-3 py-1.5 text-xs md:text-sm font-medium transition",
                  isActive
                    ? "bg-[#1E2B4F] text-white border-[#1E2B4F] shadow-sm"
                    : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50",
                ].join(" ")}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm border border-neutral-200">
            <Loader2 className="h-4 w-4 animate-spin text-[#1E2B4F]" />
            <span className="text-sm text-neutral-700">Loading menu...</span>
          </div>
        </div>
      ) : err ? (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-white border border-neutral-200 px-4 py-10 text-center text-sm text-neutral-600">
          No items found in this category yet.
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedBySection).map(([section, sectionItems]) => (
            <div key={section}>
              {/* Section heading */}
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm md:text-base tracking-[0.25em] uppercase text-[#1E2B4F]">
                  {section}
                </h2>
              </div>

              {/* Cards grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                {sectionItems.map((item) => (
                  <article
                    key={item._id ?? item.name}
                    className="group flex flex-col rounded-2xl border border-neutral-200 bg-white/90 p-5 shadow-sm backdrop-blur-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm md:text-base font-semibold text-[#1E2B4F] leading-snug">
                          {item.name}
                        </h3>

                        <p className="mt-2 text-xs md:text-sm text-neutral-700">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm md:text-base font-bold text-[#1E2B4F]">
                          ${item.price.toFixed(2)}
                        </span>

                        {item.isFeatured && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
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

                    {/* Footer: category pill only */}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-neutral-500">
                        {item.category}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
