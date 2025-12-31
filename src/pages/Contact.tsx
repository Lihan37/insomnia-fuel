// src/pages/Contact.tsx
import { useState } from "react";
import Swal from "sweetalert2";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import SEO from "@/components/SEO";

export default function Contact() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);

      // Optional: use logged-in user’s email/name if not filled
      const payload = {
        name: form.name || user?.displayName || "Guest",
        email: form.email || user?.email || "",
        message: form.message,
      };

      await api.post("/api/contact", payload);

      setSubmitted(true);
      setForm({ name: "", email: "", message: "" });

      await Swal.fire({
        icon: "success",
        title: "Message sent!",
        text: "Thanks for reaching out. We’ll get back to you soon.",
        timer: 1600,
        showConfirmButton: false,
      });

      setTimeout(() => setSubmitted(false), 4000);
    } catch (err: any) {
      console.error("Contact submit failed:", err);
      await Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text:
          err?.response?.data?.message ||
          "We couldn’t send your message. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative py-20 overflow-hidden text-[#1E1E1E]">
      <SEO
        title="Contact"
        description="Find Insomnia Fuel in Parramatta. Get directions, opening hours, and contact the cafe."
        image="/logo.png"
      />
      {/* Subtle warm background tint */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 60% at 50% 50%, rgba(255,0,76,0.05), transparent 80%)",
        }}
      />

      <div className="mx-auto max-w-6xl px-4 relative">
        {/* Heading */}
        <h1 className="text-center text-4xl md:text-5xl font-bold tracking-tight mb-10">
          <span className="text-[#350404]">Get in Touch</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Left: Info */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-[#1E1E1E]">
              Visit Us
            </h2>
            <p className="text-[#5C5C5C] mb-6 leading-relaxed">
              <span className="font-semibold text-[#1E1E1E]">Insomnia Fuel</span>{" "}
              — where burgers, brews, and creativity meet the night. We’re open
              until late every evening.
            </p>

            <ul className="space-y-2 text-sm text-[#5C5C5C]">
              <li>📍 Shop-2, 60 Park Street, Sydney, NSW 2000</li>
              <li>
                📞{" "}
                <a
                  href="tel:00000"
                  className="hover:text-[#350404] transition-colors"
                >
                  00000
                </a>
              </li>
              <li>
                ✉️{" "}
                <a
                  href="mailto:insomniafuel12@gmail.com"
                  className="hover:text-[#350404] transition-colors"
                >
                  insomniafuel12@gmail.com
                </a>
              </li>
              <li>🕓 Mon – Sun : 4 PM – 2 AM</li>
            </ul>

            {/* Map embed */}
            <div className="mt-6 overflow-hidden rounded-xl border border-[#E8E1D8] shadow-[0_8px_20px_-8px_rgba(0,0,0,0.1)]">
              <iframe
                title="Insomnia Fuel Location"
                src="https://www.google.com/maps?q=60+Park+Street,+Sydney,+NSW+2000&output=embed"
                width="100%"
                height="300"
                loading="lazy"
                className="filter contrast-110 rounded-xl"
                allowFullScreen
              ></iframe>
            </div>
          </div>

          {/* Right: Contact form */}
          <div className="bg-[#FAF6EF] border border-[#E8E1D8] rounded-2xl p-8 shadow-[0_8px_20px_-8px_rgba(0,0,0,0.1)]">
            <h2 className="text-2xl font-semibold mb-6 text-[#1E1E1E]">
              Send us a message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                required
                name="name"
                type="text"
                placeholder="Your Name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-lg bg-[#FAF6EF] border border-[#E8E1D8] px-4 py-3 text-[#1E1E1E] placeholder-[#9C8E7A] focus:border-[#FF004C] focus:ring-1 focus:ring-[#FF004C]/40 focus:outline-none"
              />
              <input
                required
                name="email"
                type="email"
                placeholder="Your Email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-lg bg-[#FAF6EF] border border-[#E8E1D8] px-4 py-3 text-[#1E1E1E] placeholder-[#9C8E7A] focus:border-[#FF004C] focus:ring-1 focus:ring-[#FF004C]/40 focus:outline-none"
              />
              <textarea
                required
                name="message"
                rows={5}
                placeholder="Your Message"
                value={form.message}
                onChange={handleChange}
                className="w-full rounded-lg bg-[#FAF6EF] border border-[#E8E1D8] px-4 py-3 text-[#1E1E1E] placeholder-[#9C8E7A] focus:border-[#FF004C] focus:ring-1 focus:ring-[#FF004C]/40 focus:outline-none"
              ></textarea>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[#350404] py-3 font-semibold text-white hover:opacity-90 transition focus:ring-2 focus:ring-[#FF004C]/60 disabled:opacity-70"
              >
                {loading
                  ? "Sending..."
                  : submitted
                  ? "Message Sent ✓"
                  : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
