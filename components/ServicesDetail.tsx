const SERVICES = [
  {
    number: "01",
    title: "Website design and build",
    description:
      "A custom website built from scratch to represent your business properly. Fast, mobile-friendly, and designed to convert visitors into customers.",
    available: true,
    pricing: "Fixed price — scope in a free call",
  },
  {
    number: "02",
    title: "AI assistant for your website",
    description:
      "A chat assistant on your website that answers questions, takes enquiry details and books visits straight into your calendar. Every lead is saved, even out of hours.",
    available: true,
    link: { href: "/demo", label: "Try the demo →" },
  },
  {
    number: "03",
    title: "Automated lead generation",
    description:
      "A steady supply of new prospects without the legwork. Every weekday it finds businesses in your area that fit your ideal customer, checks their online presence, scores how good a fit they are and drafts a personal first message for each one. They land in a shared sheet for you to review and send, so nothing goes out without your say.",
    available: true,
    link: { href: "https://cal.com/rob-doughty/30min", label: "Talk it through on a call →" },
  },
  {
    number: "04",
    title: "Workflow automation",
    description:
      "Automate the repetitive tasks that eat into your day. From client onboarding to follow-ups, we connect your tools so you can focus on the work that matters.",
    available: false,
  },
];

export default function ServicesDetail() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-24">
      <h2 className="mb-12 text-3xl font-semibold text-foreground md:text-4xl">
        What we offer.
      </h2>

      <div className="flex flex-col gap-4">
        {SERVICES.map((s) => (
          <div
            key={s.title}
            className={`rounded-2xl border p-8 transition-colors ${
              s.available
                ? "border-border bg-card"
                : "border-border/40 bg-card/40"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <span className="text-sm font-semibold text-accent">{s.number}</span>
                <h3
                  className={`mt-1 text-3xl font-semibold ${
                    s.available ? "text-foreground" : "text-muted"
                  }`}
                >
                  {s.title}
                </h3>
                <p className="mt-4 max-w-2xl text-base text-muted leading-loose">
                  {s.description}
                </p>
                {s.pricing && (
                  <p className="mt-5 text-sm font-medium text-accent">{s.pricing}</p>
                )}
                {s.link && (
                  <a
                    href={s.link.href}
                    className="mt-3 inline-block text-sm text-muted hover:text-foreground transition-colors"
                  >
                    {s.link.label}
                  </a>
                )}
              </div>
              {!s.available && (
                <div className="flex shrink-0 flex-col items-end gap-3">
                  <span className="rounded-full border border-border/60 px-3 py-1 text-sm text-muted">
                    Coming soon
                  </span>
                  <a
                    href="mailto:rob@designimp.com?subject=Interested in upcoming service"
                    className="text-sm text-muted hover:text-foreground transition-colors"
                  >
                    Get notified →
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
