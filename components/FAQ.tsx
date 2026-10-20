"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "How long does a project take?",
    a: "Most websites are delivered within 4 weeks from the kick-off call. Larger or more complex builds may take 6–8 weeks. You'll always have a clear timeline before work begins.",
  },
  {
    q: "Who owns the website when it's done?",
    a: "You do — completely. All code, design files, and assets are yours. There are no ongoing platform fees or vendor lock-in.",
  },
  {
    q: "How many revisions do I get?",
    a: "We work in rounds of feedback, and most projects are finalised within two. Because we start from a detailed brief, large changes are rare. We'd rather get it right than limit revisions.",
  },
  {
    q: "Do you handle hosting?",
    a: "We recommend and set up hosting as part of the project. We use fast, reliable providers (typically Vercel or similar) and hand you full control of the account at launch.",
  },
  {
    q: "How does payment work?",
    a: "Fixed price, split into two parts: 50% to start, 50% on launch. No hourly billing, no surprise invoices.",
  },
  {
    q: "What if I need changes after launch?",
    a: "Small tweaks in the first 30 days are included. For ongoing changes or new features, we can agree a small retainer or quote per update — whatever suits you.",
  },
];

type FAQProps = {
  items?: { q: string; a: string }[];
  heading?: string;
};

export default function FAQ({ items = FAQS, heading = "Common questions." }: FAQProps) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="mx-auto max-w-4xl px-6 py-28">
      <div className="mb-12">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-accent">
          FAQ
        </p>
        <h2 className="text-3xl font-semibold text-foreground md:text-4xl">
          {heading}
        </h2>
      </div>

      <div className="flex flex-col divide-y divide-border">
        {items.map((item, i) => (
          <div key={i}>
            <button
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
              aria-expanded={open === i}
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span className="text-xl font-medium text-foreground">{item.q}</span>
              <span
                className="shrink-0 text-muted transition-transform duration-200"
                style={{ transform: open === i ? "rotate(45deg)" : "rotate(0deg)" }}
                aria-hidden="true"
              >
                +
              </span>
            </button>
            {open === i && (
              <p className="pb-5 text-base text-muted leading-loose max-w-2xl">
                {item.a}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
