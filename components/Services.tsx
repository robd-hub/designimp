"use client";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

const FEATURES = [
  {
    title: "Custom design, no templates",
    body: "Every site is built from scratch to fit your business, not adapted from a theme someone else is already using.",
  },
  {
    title: "Fixed price, no surprises",
    body: "Clear scope, timeline, and price upfront. No hourly billing, no scope creep, no mystery invoices.",
  },
  {
    title: "Fast, modern, and yours",
    body: "Sites built to load in under 2 seconds, look great on any device, and that you own outright.",
  },
  {
    title: "One point of contact",
    body: "You work directly with the person building your site, start to finish. No account managers, no handoffs.",
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

export default function Services() {
  const reduced = useReducedMotion();

  return (
    <section id="services" className="mx-auto max-w-7xl px-6 py-28">
      <motion.div
        className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        initial={reduced ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h2
          className="font-semibold text-foreground"
          style={{ fontSize: "clamp(1.875rem, 3vw, 2.25rem)" }}
        >
          What we build, and why it matters.
        </h2>
        <Link
          href="/services"
          className="shrink-0 text-base text-accent hover:text-foreground transition-colors"
        >
          See all services →
        </Link>
      </motion.div>

      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={reduced ? undefined : containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
      >
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            variants={reduced ? undefined : cardVariants}
            className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-foreground/20"
          >
            <p className="mb-4 text-sm font-semibold text-accent">0{i + 1}</p>
            <p className="mb-3 font-semibold text-foreground text-xl leading-snug">
              {f.title}
            </p>
            <p className="text-base text-muted leading-loose">{f.body}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
