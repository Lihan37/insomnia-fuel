// src/pages/Home.tsx
import Hero from "../components/Hero";
import MenuHighlights from "../components/MenuHighlights";
import JourneyTimeline from "../components/JourneyTimeline";
import SEO from "../components/SEO";

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "CafeOrCoffeeShop",
  name: "Insomnia Fuel",
  description:
    "Late-night cafe in Parramatta serving smash burgers, specialty coffee, and comfort food.",
  areaServed: "Parramatta NSW",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Parramatta",
    addressRegion: "NSW",
    addressCountry: "AU",
  },
  servesCuisine: ["Coffee", "Burgers", "Brunch"],
};

export default function Home() {
  return (
    <>
      {/* SEO meta tags */}
      <SEO
        title="Cafe in Parramatta"
        description="Late-night cafe in Parramatta for smash burgers, espresso, and comfort food at Insomnia Fuel."
        image="/logo.png"
        schema={localBusinessSchema}
      />

      {/* Journey Timeline section */}
      <JourneyTimeline />

      {/* Hero section */}
      <Hero />

      

      {/* Menu Highlights section */}
      <MenuHighlights />
    </>
  );
}
