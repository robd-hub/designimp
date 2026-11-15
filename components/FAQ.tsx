"use client";

import { useState } from "react";

import { FAQS } from "./faqs";

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
