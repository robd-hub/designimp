"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { BUSINESS_TYPES } from "./businessTypes";

// The /get-started page body: the mockup form on the left, and on the right what happens next, the Ayuri result
// and a way to book a call instead. Copy is Rob's (revised form, November 2026).

const CALL_URL = "https://cal.com/rob-doughty/30min";

const NEXT_STEPS = [
  "I look at your business and your photos the same day.",
  "Your mockup lands in your inbox within 48 hours.",
  "If you like it, we agree a fixed price. If not, that's the end of it.",
];

const inputClasses =
  "w-full rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground/40 transition-colors";
const labelClasses = "mb-2 block text-sm font-medium text-foreground";

function Sidebar() {
  return (
    <aside className="space-y-5">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">What happens next</h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-base leading-relaxed text-muted marker:text-accent">
          {NEXT_STEPS.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </div>

      <Link
        href="/work/ayuri-beauty"
        className="group block overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-accent/50"
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <Image
            src="/work/ayuri-beauty.jpg"
            alt="Ayuri Beauty website"
            fill
            sizes="(max-width: 1024px) 100vw, 400px"
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="px-5 py-4">
          <p className="font-semibold text-foreground">Ayuri Beauty</p>
          <p className="mt-1 text-sm text-muted">Fully booked most days within three months of launch.</p>
          <p className="mt-2 text-sm text-accent transition-colors group-hover:text-foreground">Read the case study →</p>
        </div>
      </Link>

      <p className="text-sm text-muted">
        Rather talk first?{" "}
        <a href={CALL_URL} target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-2 hover:text-accent">
          Book a 30-minute call
        </a>
      </p>
    </aside>
  );
}

export default function LeadForm() {
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const businessRef = useRef<HTMLInputElement>(null);

  // Arriving from the game's "Your Shop Here" plot, the business name comes along as ?business=.
  useEffect(() => {
    const name = new URLSearchParams(window.location.search).get("business");
    const input = businessRef.current;
    if (name && input && !input.value) input.value = name.replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 80);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("pending");

    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      businessName: form.get("businessName"),
      businessType: form.get("businessType"),
      businessUrl: form.get("businessUrl"),
      notes: form.get("notes"),
      company: form.get("company"),
    };

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-6 pt-28 pb-20 md:pt-32 lg:grid-cols-[1.6fr_1fr]">
      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-accent">Free mockup</p>
        <h1 className="font-semibold leading-tight text-foreground" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
          See your new website in 48 hours.
        </h1>

        {status === "success" ? (
          <div className="mt-8 rounded-2xl border border-border bg-card p-8">
            <p className="text-2xl font-semibold text-foreground">Thanks, that&apos;s in.</p>
            <p className="mt-3 text-lg leading-loose text-muted">
              I&apos;ll look at your business today, and your mockup will be in your inbox within 48 hours.
            </p>
          </div>
        ) : (
          <>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
              Tell me a little about your business. I&apos;ll design a mockup from your own photos and prices. No call,
              no obligation.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className={labelClasses}>Your name *</label>
                  <input id="name" name="name" type="text" required autoComplete="name" className={inputClasses} />
                </div>
                <div>
                  <label htmlFor="email" className={labelClasses}>Email *</label>
                  <input id="email" name="email" type="email" required autoComplete="email" className={inputClasses} />
                </div>
                <div>
                  <label htmlFor="businessName" className={labelClasses}>Business name *</label>
                  <input ref={businessRef} id="businessName" name="businessName" type="text" required autoComplete="organization" className={inputClasses} />
                </div>
                <div>
                  <label htmlFor="businessType" className={labelClasses}>What kind of business? *</label>
                  <select id="businessType" name="businessType" required defaultValue="" className={inputClasses}>
                    <option value="" disabled>Choose one</option>
                    {BUSINESS_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="businessUrl" className={labelClasses}>Where can I see your work and prices?</label>
                <input
                  id="businessUrl"
                  name="businessUrl"
                  type="text"
                  placeholder="Instagram, Facebook, Google listing or current website"
                  className={inputClasses}
                />
                <p className="mt-2 text-sm text-muted">A link is plenty. I&apos;ll use your real photos so the mockup feels like yours.</p>
              </div>

              <div>
                <label htmlFor="notes" className={labelClasses}>Anything else? (optional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  placeholder="What you'd like more of: bookings, enquiries, a better first impression…"
                  className={`${inputClasses} resize-none`}
                />
              </div>

              {status === "error" && (
                <p className="text-base text-muted">Something went wrong sending that. Mind trying again?</p>
              )}

              <div>
                <button
                  type="submit"
                  disabled={status === "pending"}
                  className="inline-flex items-center gap-3 rounded-full bg-foreground px-6 py-3.5 text-base font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-50"
                >
                  {status === "pending" ? "Sending…" : "Send me my free mockup"}
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-background text-xs text-foreground">→</span>
                </button>
                <p className="mt-4 text-sm text-muted">
                  I&apos;ll only use your details to make and send your mockup.{" "}
                  <Link href="/privacy" className="underline underline-offset-2 hover:text-accent">Privacy policy</Link>
                </p>
              </div>
            </form>
          </>
        )}
      </div>

      <Sidebar />
    </section>
  );
}
