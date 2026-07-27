import Image from "next/image";
import Link from "next/link";

const STATS = [
  { value: "3 months", label: "From launch to full capacity" },
  { value: "Full capacity", label: "Most days of the week" },
  { value: "2nd salon", label: "Already in planning" },
];

const DELIVERABLES = [
  {
    title: "Custom website with direct booking",
    body: "A clean, professional site built from scratch with an integrated booking system — so customers could reserve appointments instantly, without needing to call.",
  },
  {
    title: "Google Maps optimisation",
    body: "A fully built-out Google Business Profile with photos, services, and regular updates to surface Ayuri Beauty at the top of local search results.",
  },
  {
    title: "High-quality social presence",
    body: "A consistent social media strategy with professional content that built brand trust and drove a steady stream of new customers through the door.",
  },
];

export default function AyuriCaseStudy() {
  return (
    <article>
      {/* Hero image */}
      <div className="relative w-full aspect-[21/9] overflow-hidden mt-20">
        <Image
          src="/work/ayuri-beauty.jpg"
          alt="Ayuri Beauty salon website"
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 px-6 pb-10 md:px-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent mb-2">Case study</p>
          <h1 className="text-3xl font-semibold text-foreground md:text-5xl">Ayuri Beauty</h1>
        </div>
      </div>

      {/* Stats strip */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {STATS.map((stat) => (
            <div key={stat.value}>
              <p className="text-2xl font-semibold text-accent md:text-3xl">{stat.value}</p>
              <p className="mt-1 text-base text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-20 space-y-20">

        {/* The challenge */}
        <div className="grid gap-10 md:grid-cols-2 md:items-start">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent">The challenge</p>
            <h2 className="text-2xl font-semibold text-foreground md:text-3xl leading-snug">
              A great salon that nobody could find.
            </h2>
          </div>
          <div className="space-y-4 text-lg text-muted leading-loose">
            <p>
              Ayurinails Beauty Salon had everything it needed to succeed — skilled staff, a welcoming space, and a loyal handful of regulars. What it didn&apos;t have was an online presence that matched.
            </p>
            <p>
              With no website, no way to book online, and little visibility on Google, the salon was relying entirely on word of mouth. New customers were hard to come by, and the appointment book was far from full.
            </p>
          </div>
        </div>

        {/* What we built */}
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent">What we built</p>
          <h2 className="mb-10 text-2xl font-semibold text-foreground md:text-3xl leading-snug">
            A complete digital presence, built to convert.
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

        {/* Results */}
        <div className="grid gap-10 md:grid-cols-2 md:items-start">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent">The results</p>
            <h2 className="text-2xl font-semibold text-foreground md:text-3xl leading-snug">
              Full capacity in three months.
            </h2>
          </div>
          <div className="space-y-4 text-lg text-muted leading-loose">
            <p>
              Within three months of launching the new website and marketing strategy, Ayuri Beauty was running at full capacity on most days. The owner went from chasing bookings to managing a waitlist.
            </p>
            <p>
              The results have been strong enough that she&apos;s now planning to open a second salon — a goal she&apos;d never have considered possible before the rebrand.
            </p>
          </div>
        </div>

        {/* Visit site */}
        <div className="border-t border-border pt-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <p className="text-lg font-semibold text-foreground">See it live</p>
            <p className="mt-1 text-base text-muted">Visit the Ayuri Beauty website.</p>
          </div>
          <Link
            href="https://www.ayuribeauty.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-base font-medium text-background transition-opacity hover:opacity-80 shrink-0"
          >
            Visit ayuribeauty.com
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background/20 text-sm">
              →
            </span>
          </Link>
        </div>

      </div>
    </article>
  );
}
