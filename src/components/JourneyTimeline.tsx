import { motion, useReducedMotion } from "framer-motion";

const STORY = `Welcome to INSOMNIA FUEL – a place where every dish tells a story and every corner celebrates creativity.

My wife and I have journeyed through 72 countries, immersing ourselves in cultures through food, art, and craft — from the vibrant chaos of street markets to the serene beauty of mountain villages.

With over 23 years of experience as a chef, I’ve dedicated my life to turning flavours into stories, while my wife brings her passion for art and handmade creations to every detail of our space.

Our dream was simple: to bring the world home — to create a space where the tastes, textures, and colours of the world come together in harmony; a restaurant and gift shop where authenticity, creativity, and the joy of discovery are at the heart of every visit.

At INSOMNIA FUEL, every dish is made from scratch with love, and every product is crafted with care. It is our shared dream — a little world where flavours, stories, and creativity meet.`;

function AnimatedParagraph({ text }: { text: string }) {
  const shouldReduce = useReducedMotion();
  const tokens = text.split(/(\s+)/);
  const variants = {
    hidden: { opacity: 0, y: 4 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.012, duration: 0.25 },
    }),
  } as const;

  if (shouldReduce) {
    return (
      <p className="whitespace-pre-line text-[#5C5C5C] leading-relaxed text-[15px] md:text-base">
        {text}
      </p>
    );
  }

  return (
    <motion.p
      aria-label={text}
      className="whitespace-pre-line text-[#5C5C5C] leading-relaxed text-[15px] md:text-base"
    >
      {tokens.map((t, i) =>
        /\s+/.test(t) ? (
          <span key={i}>{t}</span>
        ) : (
          <motion.span
            key={i}
            className="inline-block"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.8 }}
            custom={i}
            variants={variants}
          >
            {t}
          </motion.span>
        )
      )}
    </motion.p>
  );
}

export default function JourneyTimeline() {
  return (
    <section className="relative overflow-hidden py-14 px-4 text-center">
      <div className="mx-auto max-w-5xl">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.7 }}
          transition={{ duration: 0.6 }}
          className="relative font-orbitron text-2xl md:text-3xl font-semibold text-[#1E1E1E]"
        >
          Journey of{" "}
          <span
            className="font-semibold tracking-wide bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(90deg, #8B7E6A 0%, #BDAA88 50%, #8B7E6A 100%)",
              textShadow:
                "0 1px 1px rgba(0,0,0,0.15), 0 0 1px rgba(255,255,255,0.25)",
            }}
          >
            INSOMNIA FUEL
          </span>
        </motion.h2>
      </div>

      {/* Paragraph */}
      <div className="mx-auto mt-6 max-w-3xl md:max-w-4xl">
        <AnimatedParagraph text={STORY} />
      </div>

      {/* Cinematic underline sweep */}
      <motion.div
        aria-hidden
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.9 }}
        transition={{
          duration: 1.2,
          ease: "easeInOut",
        }}
        className="pointer-events-none mx-auto mt-10 h-[2px] w-40 origin-left"
        style={{
          background:
            "linear-gradient(90deg, transparent, #BDAA88 40%, transparent)",
        }}
      />
    </section>
  );
}