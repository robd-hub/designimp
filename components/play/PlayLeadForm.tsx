"use client";

import { useState } from "react";
import { usePlay } from "./store";
import { HIDDEN } from "./hidden";
import s from "./play.module.css";

const BUSINESS_TYPES = ["Hair Salon", "Barbershop", "Spa / Beauty", "Nail Salon", "Other"];

// The free mockup form from the main site, dressed for the game. Posts to the same /api/lead.
export default function PlayLeadForm() {
  const spotter = usePlay((st) => st.found.length >= HIDDEN.length);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const tag = `[Imp's High Street${spotter ? ", Imp Spotter" : ""}]`;
    setState("sending");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, notes: `${tag} ${f.notes ?? ""}`.trim() }),
      });
      setState(res.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "sent")
    return (
      <p className={s.sent}>
        <b>Thanks!</b> Rob will be in touch about your free mockup soon.
      </p>
    );

  return (
    <form className={s.form} onSubmit={onSubmit}>
      <label>
        Your name
        <input name="name" required autoComplete="name" />
      </label>
      <label>
        Email
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label>
        Business name
        <input name="businessName" required autoComplete="organization" />
      </label>
      <label>
        Type of business
        <select name="businessType" required defaultValue="">
          <option value="" disabled>
            Choose one
          </option>
          {BUSINESS_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label>
        Current website (if you have one)
        <input name="businessUrl" type="url" placeholder="https://" />
      </label>
      <label>
        Anything else?
        <textarea name="notes" rows={3} />
      </label>
      <input name="company" tabIndex={-1} autoComplete="off" className={s.hp} aria-hidden />
      <button className={s.cta} type="submit" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Get my free mockup →"}
      </button>
      {state === "error" && <p role="alert">That didn&apos;t send. Please try again, or use the form on the Get Started page.</p>}
    </form>
  );
}
