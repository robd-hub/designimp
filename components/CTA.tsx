export default function CTA() {
  return (
    <section
      id="contact"
      className="w-full px-6 py-28 text-center"
      style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 50%, #1a1a2e 0%, #111113 70%)",
      }}
    >
      <div className="mx-auto max-w-3xl">
        <h2
          className="font-semibold text-foreground"
          style={{ fontSize: "clamp(2.2rem, 4vw, 3.5rem)", lineHeight: 1.15 }}
        >
          Ready to level up your online presence?
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-lg text-muted leading-loose">
          Tell us a bit about your business and we&apos;ll put together a free mockup, no call required. If you like it, we&apos;ll talk next steps.
        </p>

      <a
        href="https://cal.com/rob-doughty/30min"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-10 inline-flex items-center gap-3 rounded-full bg-foreground px-6 py-3.5 text-base font-medium text-background transition-opacity hover:opacity-80"
      >
        Get your free mockup
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-background text-foreground text-xs">
          →
        </span>
      </a>
      </div>
    </section>
  );
}
