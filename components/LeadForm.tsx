"use client";

import { useState } from "react";

const BUSINESS_TYPES = ["Hair Salon", "Barbershop", "Spa / Beauty", "Nail Salon", "Other"];

const inputClasses =
  "w-full rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground/40 transition-colors";
const labelClasses = "mb-2 block text-sm font-medium text-foreground";

export default function LeadForm() {
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");

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
        <p className="text-2xl font-semibold text-foreground">Thanks, that's in.</p>
        <p className="mt-3 text-lg text-muted leading-loose">
          I'll put together your free mockup and be in touch shortly.
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
          <input id="businessName" name="businessName" type="text" required className={inputClasses} />
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

        {status === "error" && (
          <p className="text-base text-muted">
            Something went wrong sending that. Mind trying again?
          </p>
        )}

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
