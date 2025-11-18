// src/components/MenuHighlights.tsx
import React from "react";
import { Link } from "react-router-dom";

type MenuItem = {
  id: string;
  name: string;
  price: string;
  tag?: string;
  image: string;
  description: string;
};

const menuItems: MenuItem[] = [
  { id: "smash", name: "Insomnia Smash", price: "$12.90", tag: "Best Seller", image: "/assets/menu/smash.webp", description: "Double-patty smash burger with melted cheese and house-made fuel sauce." },
  { id: "fries", name: "Midnight Fries", price: "$5.90", tag: "New", image: "/assets/menu/fries.webp", description: "Crispy fries tossed with truffle oil, herbs, and insomnia dust." },
  { id: "shake", name: "Espresso Shake", price: "$7.90", tag: "Caffeine Boost", image: "/assets/menu/shake.webp", description: "Rich vanilla ice cream blended with double espresso and chocolate drizzle." },
  { id: "vegan", name: "Vegan Glow Burger", price: "$11.50", tag: "Plant Power", image: "/assets/menu/vegan.webp", description: "Smoky vegan patty, avocado, and roasted peppers on a soft bun." },
];

const MenuHighlights: React.FC = () => {
  return (
    <section id="menu" className="relative w-full py-20 text-[#1E1E1E]" aria-label="Menu Highlights">
      {/* no background override → inherits beige from MainLayout */}

      <div className="mx-auto max-w-7xl px-4 text-center">
        <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
          <span className="text-[#350404]">Signature</span>{" "}
          <span className="text-[#1E1E1E]">Highlights</span>
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-[#5C5C5C]">
          The late-night favorites that made us famous — hand-smashed, perfectly brewed, and built to fuel your night.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-7xl grid-cols-1 gap-8 px-4 sm:grid-cols-2 lg:grid-cols-4">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className="group relative overflow-hidden rounded-2xl border border-[#E8E1D8] bg-[#FAF6EF] p-4 shadow-[0_6px_18px_-10px_rgba(0,0,0,0.15)] transition-transform duration-300 hover:scale-[1.02] hover:shadow-[0_14px_30px_-12px_rgba(255,0,76,0.18)]"
          >
            <div className="aspect-square overflow-hidden rounded-xl">
              <img
                src={item.image}
                alt={item.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <span className="font-semibold text-[#350404]">{item.price}</span>
            </div>

            {item.tag && (
              <span className="absolute left-4 top-4 rounded-full bg-[#350404] px-3 py-1 text-xs font-semibold text-white shadow-sm">
                {item.tag}
              </span>
            )}

            <p className="mt-2 text-sm text-[#5C5C5C]">{item.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link
          to="/menu"
          className="inline-block rounded-full bg-[#350404] px-8 py-3 font-semibold text-white transition hover:bg-[#e60046] focus:outline-none focus:ring-2 focus:ring-[#350404]/50"
        >
          View Full Menu →
        </Link>
      </div>
    </section>
  );
};

export default MenuHighlights;
