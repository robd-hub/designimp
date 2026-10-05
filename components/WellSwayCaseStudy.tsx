import Image from "next/image";
import Link from "next/link";

const DELIVERABLES = [
  {
    title: "A website built around her",
    body: "A custom site designed to her preferences, showing her classes, prices and how to get started, with a clear way to get in touch.",
  },
  {
    title: "Search visibility",
    body: "SEO set up from the start so people searching for dance classes in Lincoln can find the studio.",
  },
  {
    title: "Branding that fits",
    body: "A look and feel shaped by her own taste, carried through the site so the studio feels like hers.",
  },
];

export default function WellSwayCaseStudy() {
  return (
    <article>
      {/* Hero image */}
      <div className="relative w-full aspect-[21/9] overflow-hidden mt-20">
        <Image
          src="/work/wellswaydance.jpg"
          alt="WellSway Dance Studio website"
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
        />
      </div>

      <div className="mx-auto max-w-5xl px-6 pt-16 space-y-20">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-accent mb-2">Case study</p>
          <h1 className="text-3xl font-semibold text-foreground md:text-5xl">WellSway Dance Studio</h1>
        </div>

        {/* The challenge */}
        <div className="grid gap-10 md:grid-cols-2 md:items-start">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent">The challenge</p>
            <h2 className="text-2xl font-semibold text-foreground md:text-3xl leading-snug">
              A great teacher with no website.
            </h2>
          </div>
          <div className="space-y-4 text-lg text-muted leading-loose">
            <p>
              Justyna Wells teaches ballroom, Latin and Salsa Fit classes at Washingborough Community Centre in Lincoln, for adults and children.
            </p>
            <p>
              She had no website and no experience building one, so there was nowhere for new students to find her classes, prices or how to join.
            </p>
          </div>
        </div>

        {/* What we built */}
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent">What we built</p>
          <h2 className="mb-10 text-2xl font-semibold text-foreground md:text-3xl leading-snug">
            A complete online home for the studio.
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {DELIVERABLES.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <h3 className="text-base font-semibold text-foreground leading-snug">{item.title}</h3>
                <p className="mt-3 text-base text-muted leading-loose">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Visit site */}
        <div className="border-t border-border pt-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <p className="text-lg font-semibold text-foreground">See it live</p>
            <p className="mt-1 text-base text-muted">Visit the WellSway Dance Studio website.</p>
          </div>
          <Link
            href="https://wellswaydance.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-base font-medium text-background transition-opacity hover:opacity-80 shrink-0"
          >
            Visit wellswaydance.com
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background/20 text-sm">
              →
            </span>
          </Link>
        </div>

      </div>
    </article>
  );
}
