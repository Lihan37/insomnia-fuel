// src/pages/Home.tsx
import Hero from "../components/Hero";
import MenuHighlights from "../components/MenuHighlights";
import JourneyTimeline from "../components/JourneyTimeline";
import SEO from "../components/SEO";

export default function Home() {
  return (
    <>
      {/* SEO meta tags */}
      <SEO
        title="Insomnia Fuel"
        description="Smash burgers, espresso, and neon vibes open late at Insomnia Fuel."
        canonical="https://insomniafuel.example.com/"
        image="/assets/og/og-home.jpg"
      />

      {/* Hero section */}
      <Hero />

      {/* Journey Timeline section */}
      <JourneyTimeline />

      {/* Menu Highlights section */}
      <MenuHighlights />
    </>
  );
}
