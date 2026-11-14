"use client";

import { useEffect, useRef, useState } from "react";

import { BUSINESS_TYPES } from "./businessTypes";

const inputClasses =
  "w-full rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground/40 transition-colors";
const labelClasses = "mb-2 block text-sm font-medium text-foreground";

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
      socials: form.get("socials"),
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

  if (status === "success") {
    return (
      <section className="mx-auto max-w-2xl px-6 py-20 text-center">
        <p className="text-2xl font-semibold text-foreground">Thanks, that&apos;s in.</p>
        <p className="mt-3 text-lg text-muted leading-loose">
          Your free mockup will be in your inbox within 48 hours. If anything&apos;s unclear I&apos;ll email you before then.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl px-6 py-20">
      <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-8 space-y-6">
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
        />

        <div>
          <label htmlFor="name" className={labelClasses}>Your name</label>
          <input id="name" name="name" type="text" required className={inputClasses} />
        </div>

        <div>
          <label htmlFor="email" className={labelClasses}>Email</label>
          <input id="email" name="email" type="email" required className={inputClasses} />
        </div>

        <div>
          <label htmlFor="businessName" className={labelClasses}>Business name</label>
          <input ref={businessRef} id="businessName" name="businessName" type="text" required className={inputClasses} />
        </div>

        <div>
          <label htmlFor="businessType" className={labelClasses}>Business type</label>
          <select id="businessType" name="businessType" required defaultValue="" className={inputClasses}>
            <option value="" disabled>Select one</option>
            {BUSINESS_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="businessUrl" className={labelClasses}>Business website (if applicable)</label>
          <input id="businessUrl" name="businessUrl" type="url" placeholder="https://" className={inputClasses} />
        </div>

        <div>
          <label htmlFor="socials" className={labelClasses}>Instagram or Facebook page (optional)</label>
          <input id="socials" name="socials" type="text" placeholder="@yourbusiness or a link" className={inputClasses} />
          <p className="mt-2 text-sm text-muted">We&apos;ll use your own photos from here, so the mockup looks like your business.</p>
        </div>

        <div>
          <label htmlFor="notes" className={labelClasses}>Tell us about your business (optional)</label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            placeholder="What you do, who your customers are, any colours or styles you like..."
            className={`${inputClasses} resize-none`}
          />
        </div>

        {status === "error" && (
          <p className="text-base text-muted">
            Something went wrong sending that. Mind trying again?
          </p>
        )}

        <p className="text-sm text-muted">Your mockup arrives by email within 48 hours. Free, and no obligation.</p>

        <button
          type="submit"
          disabled={status === "pending"}
          className="inline-flex items-center gap-3 rounded-full bg-foreground px-6 py-3.5 text-base font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {status === "pending" ? "Sending…" : "Get my free mockup"}
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-background text-foreground text-xs">
            →
          </span>
        </button>
      </form>
    </section>
  );
}
