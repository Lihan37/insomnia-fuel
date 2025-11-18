// src/pages/Home.tsx
import Hero from "../components/Hero";
import MenuHighlights from "../components/MenuHighlights";
import JourneyTimeline from "../components/JourneyTimeline";
import SEO from "../components/SEO";

export default function Home() {
  return (
    <>
      {/* Journey Timeline section */}
      <JourneyTimeline />
      {/* SEO meta tags */}
      <SEO
        title="Insomnia Fuel"
        description="Smash burgers, espresso, and neon vibes — open late at Insomnia Fuel."
        canonical="https://insomniafuel.example.com/"
        image="/assets/og/og-home.jpg"
      />

      {/* Hero section */}
      <Hero
        title="Fuel Your Nights"
        subtitle="Burgers, brews & beats — open till late. Welcome to Insomnia Fuel."
        videoSrc="/assets/hero/hero.webm"
        posterSrc="/assets/hero/hero-poster.webp"
      />

      {/* Menu Highlights section */}
      <MenuHighlights />
    </>
  );
}
