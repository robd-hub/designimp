import Link from "next/link";

export default function CTA() {
  return (
    <section
      id="contact"
      className="relative w-full overflow-hidden px-6 py-24 text-center"
      style={{ background: "#111113" }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="glow-b absolute left-1/2 top-1/2 h-[28rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C8973A]/15 blur-[120px]" />
      </div>
      <div className="relative mx-auto max-w-3xl">
        <h2
          className="font-semibold text-foreground"
          style={{ fontSize: "clamp(2.2rem, 4vw, 3.5rem)", lineHeight: 1.15 }}
        >
          See your new website before you pay a penny.
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-lg text-muted leading-loose">
          A free mockup in your inbox within 48 hours.
        </p>

      <Link
        href="/get-started"
        className="btn-shine mt-10 inline-flex items-center gap-3 rounded-full bg-foreground px-6 py-3.5 text-base font-medium text-background transition-transform hover:-translate-y-0.5"
      >
        Get my free mockup
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-background text-foreground text-xs">
          →
        </span>
      </Link>
      </div>
    </section>
  );
}
