// src/components/MenuHighlights.tsx
import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

type MenuItem = {
  id: string;
  name: string;
  image: string;
  description: string;
};

const menuItems: MenuItem[] = [
  {
    id: "breakfast-burger",
    name: "Breakfast Burger",
    image: "/assets/menu/Breakfast%20Burger.png",
    description:
      "Toasted bun with egg, cheese, and a juicy patty finished with smoky sauce.",
  },
  {
    id: "deli-sandwich",
    name: "Deli Sandwich",
    image: "/assets/menu/Deli%20Sandwich.jpeg",
    description:
      "Layered deli cuts, crisp lettuce, pickles, and mustard on fresh bread.",
  },
  {
    id: "healthy-bowl",
    name: "Healthy Bowl",
    image: "/assets/menu/Healthy%20Bowl.jpeg",
    description:
      "A hearty bowl of grains, greens, roasted veg, and our house dressing.",
  },
  {
    id: "wrap",
    name: "Wrap",
    image: "/assets/menu/Wrap.jpeg",
    description:
      "Warm wrap packed with grilled chicken, salad crunch, and a creamy sauce.",
  },
];

const MenuHighlights: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const introInitial = shouldReduceMotion
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: 18 };
  const introInView = { opacity: 1, y: 0 };
  const easeOut = [0.16, 1, 0.3, 1] as const;
  const gridVariants = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.08 },
    },
  };
  const cardVariants = {
    hidden: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: easeOut },
    },
  };

  return (
    <section
      id="menu"
      className="relative w-full py-20 text-[#1E1E1E]"
      aria-label="Menu Highlights"
    >
      <motion.div
        className="mx-auto max-w-7xl px-4 text-center"
        initial={introInitial}
        whileInView={introInView}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.7, ease: easeOut }}
      >
        <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
          <span className="text-[#350404]">Signature</span>{" "}
          <span className="text-[#1E1E1E]">Highlights</span>
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-[#5C5C5C]">
          All-day favorites, freshly made with bold flavor and cafe comfort.
        </p>
      </motion.div>

      <motion.div
        className="mx-auto mt-12 grid max-w-7xl grid-cols-1 gap-8 px-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={gridVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
      >
        {menuItems.map((item) => (
          <motion.div
            key={item.id}
            className="group relative overflow-hidden rounded-3xl border border-[#E8E1D8] bg-white/80 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(53,4,4,0.35)]"
            variants={cardVariants}
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-[#F6F0E7]">
              <img
                src={item.image}
                alt={item.name}
                loading="lazy"
                className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.01]"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent" />
            </div>

            <div className="space-y-2 px-5 pb-6 pt-4">
              <h3 className="text-xl font-semibold text-[#1E1E1E]">
                {item.name}
              </h3>
              <p className="text-sm leading-relaxed text-[#5C5C5C]">
                {item.description}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="mt-12 text-center"
        initial={introInitial}
        whileInView={introInView}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.7, ease: easeOut, delay: 0.05 }}
      >
        <Link
          to="/menu"
          className="inline-block rounded-full bg-[#350404] px-8 py-3 font-semibold text-white transition hover:bg-[#e60046] focus:outline-none focus:ring-2 focus:ring-[#350404]/50"
        >
          View Full Menu
        </Link>
      </motion.div>
    </section>
  );
};

export default MenuHighlights;
