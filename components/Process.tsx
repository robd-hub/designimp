"use client";
import { motion, useReducedMotion } from "framer-motion";

const STEPS = [
  {
    num: "01",
    title: "Free mockup",
    body: "Send over your business and we'll design a free mockup of your new site using your own photos and pricing. No obligation.",
  },
  {
    num: "02",
    title: "Refine together",
    body: "Like what you see? We'll refine it with you until it's right.",
  },
  {
    num: "03",
    title: "Launch",
    body: "Once you're happy, we build it and get it live. From as little as £250.",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

export default function Process() {
  const reduced = useReducedMotion();

  return (
    <section className="mx-auto max-w-7xl px-6 py-28">
      <motion.div
        className="mb-12"
        initial={reduced ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-accent">
          How it works
        </p>
        <h2
          className="font-semibold text-foreground"
          style={{ fontSize: "clamp(1.875rem, 3vw, 2.25rem)" }}
        >
          From free mockup to live site in three steps.
        </h2>
      </motion.div>

      <motion.div
        className="grid gap-px bg-border sm:grid-cols-3 rounded-2xl overflow-hidden"
        variants={reduced ? undefined : containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
      >
        {STEPS.map((step) => (
          <motion.div
            key={step.num}
            variants={reduced ? undefined : cardVariants}
            className="bg-card p-8"
          >
            <p className="mb-4 text-sm font-semibold text-accent">{step.num}</p>
            <h3 className="mb-3 text-xl font-semibold text-foreground">{step.title}</h3>
            <p className="text-base text-muted leading-relaxed">{step.body}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
