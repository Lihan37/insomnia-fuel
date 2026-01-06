// src/components/Hero.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import GlowSkeleton from "./GlowSkeleton";

import resPic from "../assets/res pic.png"; // ✅ your restaurant image

const Hero: React.FC = () => {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <section className="relative w-full overflow-hidden bg-base text-text">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(1200px 600px at 35% 55%, rgba(255,216,210,0.10), transparent 70%)",
        }}
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-16 md:grid-cols-2 md:py-24 lg:gap-16">
        
        {/* LEFT AREA */}
        <div className="flex flex-col justify-center">

          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#B08A5A]">
            Parramatta • All Day Café & Burgers
          </p>

          <h1 className="mt-3 text-balance text-4xl font-extrabold leading-tight tracking-tight text-[#1E1E1E] md:text-6xl">
            Made to Fuel Your Day
          </h1>

          <p className="mt-4 max-w-xl text-lg md:text-xl leading-relaxed text-[#5C5C5C]">
            From your first coffee to your late-afternoon snacks — serving comfort, flavour and good energy all day at Insomnia Fuel.
          </p>

          {/* BADGES */}
          <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-[#5C5C5C]">
            <span className="rounded-full border border-border/80 bg-white/80 px-3 py-1">
              Specialty Coffee
            </span>
            <span className="rounded-full border border-border/80 bg-white/80 px-3 py-1">
              Deli Sandwiches
            </span>
            <span className="rounded-full border border-border/80 bg-white/80 px-3 py-1">
              Brunch & Late Lunch
            </span>
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/menu"
              className="group inline-flex items-center gap-2 rounded-full bg-[#1E1E1E] px-7 py-3 text-sm font-semibold tracking-wide text-[#FAF5EF] shadow-lg shadow-black/15 transition-transform hover:-translate-y-0.5 hover:bg-black"
            >
              Order / View Menu
              <span className="text-lg transition-transform group-hover:translate-x-0.5">
                ↗
              </span>
            </Link>

            <Link
              to="/contact"
              className="group inline-flex items-center gap-2 rounded-full border border-[#D6C7AE] bg-white/70 px-7 py-3 text-sm font-semibold text-[#1E1E1E] shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-white"
            >
              Find Us
              <span className="text-base transition-transform group-hover:translate-x-0.5">
                📍
              </span>
            </Link>
          </div>

          <div className="mt-6 text-sm text-[#7A6A53]">
            Rated 4.9★ by day dwellers & night owls • Dine-in, pickup & delivery
          </div>
        </div>

        {/* RIGHT — IMAGE ONLY */}
        <div className="relative">
          <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
            
            {!imgLoaded && (
              <GlowSkeleton className="absolute inset-0" rounded="rounded-2xl" />
            )}

            <img
              src={resPic}
              alt="Insomnia Fuel Parramatta"
              className={`h-full w-full object-cover transition-opacity duration-300 ${
                imgLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImgLoaded(true)}
            />
          </div>

          <div
            className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] blur-2xl"
            style={{
              background:
                "conic-gradient(from 180deg at 50% 50%, rgba(255,216,210,0.10), transparent 45%, rgba(255,216,210,0.10))",
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
