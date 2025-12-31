import SEO from "@/components/SEO";

export default function Gallery() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <SEO
        title="Gallery"
        description="See the atmosphere at Insomnia Fuel, a cafe in Parramatta with bold coffee and comfort food."
        image="/logo.png"
      />
      <h1 className="text-3xl font-extrabold mb-6">Gallery</h1>
      <p>Filterable grid coming soon.</p>
    </section>
  );
}
