export default function LeadGenExample() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <div className="mb-12">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-accent">
          Example
        </p>
        <h2 className="text-3xl font-semibold text-foreground md:text-4xl">
          What lands in your sheet.
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-muted leading-loose">
          One row for every business we find, with everything you need to decide who to contact.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xl font-semibold text-foreground">Riverside Café</p>
          <span className="rounded-full bg-accent/10 px-3 py-1 text-sm font-semibold text-accent">
            92% fit
          </span>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-muted">Contact found</p>
            <p className="mt-2 text-base text-foreground">hello@riversidecafe.example</p>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-muted">Found via</p>
            <p className="mt-2 text-base text-foreground">Google Maps, website and reviews</p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted">Draft message</p>
          <p className="mt-2 text-base text-muted leading-loose italic">
            &quot;Hi, I came across Riverside Café and noticed you&apos;ve got 4.8 stars from over 60 reviews, that&apos;s a great reputation for a café by the water. I also noticed there&apos;s no way to see your menu online before visiting...&quot;
          </p>
        </div>

        <p className="mt-6 text-sm text-muted/60">
          Illustrative example. Not a real business or a real message we&apos;ve sent.
        </p>
      </div>
    </section>
  );
}
