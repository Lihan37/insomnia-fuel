import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Coffee, Loader2 } from "lucide-react";
import SEO from "@/components/SEO";
import { api } from "@/lib/api";
import type { IMenuItem } from "@/types/menu";

type SectionGroup = {
  title: string;
  items: IMenuItem[];
};

const formatServePrice = (price: number) => {
  if (!Number.isFinite(price)) return "$0/Serve";
  const formatted = Number.isInteger(price) ? price.toString() : price.toFixed(2);
  return `$${formatted}/Serve`;
};

export default function Catering() {
  const [items, setItems] = useState<IMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get<{ items: IMenuItem[] }>(
          "/api/menu?category=catering"
        );
        setItems(res.data.items || []);
      } catch (error) {
        console.error(error);
        setErr("Failed to load catering menu. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const sections = useMemo<SectionGroup[]>(() => {
    const map = new Map<string, IMenuItem[]>();
    items.forEach((item) => {
      const key = item.section?.trim() || "Catering Menu";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    });
    return Array.from(map.entries()).map(([title, list]) => ({
      title,
      items: list,
    }));
  }, [items]);

  return (
    <section className="bg-[#FFF7EC]">
      <SEO
        title="Catering"
        description="Sydney CBD cafe catering for events, meetings, and late-night gatherings from Insomnia Fuel."
        image="/logo.png"
      />
      <div className="max-w-5xl mx-auto px-4 py-14 md:py-20">
        <div className="flex flex-col items-center text-center mb-6 md:mb-8 space-y-6">
          <div className="inline-flex items-center justify-center rounded-full border border-amber-200 bg-white/80 px-5 py-2 shadow-sm backdrop-blur-sm transition-transform duration-500 hover:-translate-y-0.5">
            <Coffee className="mr-2 h-4 w-4 text-[#6B4A2F]" aria-hidden="true" />
            <span className="text-xs tracking-[0.25em] uppercase text-[#6B4A2F]">
              Catering Menu
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-serif text-[#3B2416] tracking-wide">
            Catering Menu
          </h1>

          <div className="flex items-center w-full max-w-3xl">
            <span className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-200 to-amber-400" />
            <Coffee
              className="mx-3 h-5 w-5 text-[#6B4A2F] transition-transform duration-700 hover:rotate-6 md:h-6 md:w-6"
              aria-hidden="true"
            />
            <span className="flex-1 h-px bg-gradient-to-l from-transparent via-amber-200 to-amber-400" />
          </div>
        </div>

        <div className="mb-10 flex justify-center">
          <Link
            to="/order/catering"
            className="inline-flex items-center justify-center rounded-full bg-[#350404] px-8 py-3 text-sm font-semibold text-white shadow-sm hover:shadow-md hover:bg-[#790808] transition"
          >
            Order Now
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 shadow-sm border border-neutral-200">
              <Loader2 className="h-4 w-4 animate-spin text-[#1E2B4F]" />
              <span className="text-sm text-neutral-700">
                Loading catering menu...
              </span>
            </div>
          </div>
        ) : err ? (
          <div className="rounded-2xl bg-red-50/80 border border-red-200 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        ) : sections.length === 0 ? (
          <div className="rounded-2xl bg-white/80 border border-neutral-200 px-4 py-10 text-center text-sm text-neutral-600">
            No catering items yet. Add items in the admin menu.
          </div>
        ) : (
          <div className="space-y-12">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-2xl md:text-3xl font-serif text-[#2B1B10] mb-6">
                  {section.title}
                </h2>
                <div className="divide-y divide-amber-200/70 rounded-3xl border border-amber-100 bg-white/85 shadow-sm">
                  {section.items.map((item) => (
                    <div
                      key={item._id ?? item.name}
                      className="px-6 py-5 md:px-8 md:py-6"
                    >
                      <div className="flex items-start justify-between gap-6">
                        <div className="max-w-2xl">
                          <h3 className="text-base md:text-lg font-semibold text-[#1E2B4F]">
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className="mt-1 text-sm text-neutral-600">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 text-right text-sm md:text-base font-semibold text-[#3B2416]">
                          {formatServePrice(item.price)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <Link
            to="/order/catering"
            className="inline-flex items-center justify-center rounded-full bg-[#350404] px-8 py-3 text-sm font-semibold text-white shadow-sm hover:shadow-md hover:bg-[#790808] transition"
          >
            Order Now
          </Link>
        </div>
      </div>
    </section>
  );
}
