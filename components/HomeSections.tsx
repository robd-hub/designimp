import Image from "next/image";
import Link from "next/link";
import { CountUp } from "./HeroLive";
import { QUOTES } from "./Testimonial";
import { SITES } from "./Pricing";
export { HOME_FAQS } from "./faqs";

// The home page's middle sections, in page order: the Ayuri Beauty feature, the stats, recent work, how it works,
// prices, and Rob. Quotes come from Testimonial.tsx (approved by each client); prices from Pricing.tsx.

const eyebrow = "mb-3 text-sm font-semibold uppercase tracking-widest text-accent";
const h2 = "text-3xl font-semibold text-foreground md:text-4xl";
const textLink = "text-base text-accent transition-colors hover:text-foreground";

export function AyuriFeature() {
  return (
    <section className="border-y border-border bg-card/40">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className={eyebrow}>Case study · Ayuri Beauty</p>
          <h2 className={h2}>Fully booked most days within three months of launch.</h2>
          <figure className="mt-8">
            {/* Crissy's approved review, cut with an ellipsis, not reworded */}
            <blockquote className="text-xl leading-relaxed text-foreground">
              &ldquo;Rob built us a beautiful site where clients can book online without having to call … Within three
              months we were fully booked most days, and now I&apos;m planning a second salon.&rdquo;
            </blockquote>
            <figcaption className="mt-4 text-base text-muted">
              <span className="font-semibold text-foreground">{QUOTES.ayuri.name}</span>, owner, {QUOTES.ayuri.business}
            </figcaption>
          </figure>
          <Link href="/work/ayuri-beauty" className={`mt-8 inline-block ${textLink}`}>
            Read the full story →
          </Link>
        </div>
        <Link
          href="https://www.ayuribeauty.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="group block overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-accent/50"
        >
          <div className="relative aspect-[16/10] w-full overflow-hidden">
            <Image
              src="/work/ayuri-beauty.jpg"
              alt="ayuribeauty.com"
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <p className="px-5 py-3 text-sm text-muted">ayuribeauty.com</p>
        </Link>
      </div>
    </section>
  );
}

// Three plain facts about how Rob works (the industry statistics that were here were old and about big companies).
const FACTS = [
  { num: "48 hrs", label: "from your details to a free mockup in your inbox" },
  { num: "£100", label: "for a one-page site, at a fixed price, and you own it" },
  { num: "1", label: "person you deal with, from the first mockup to launch" },
];

export function Stats() {
  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-6 py-20 sm:grid-cols-3">
      {FACTS.map((s) => (
        <div key={s.label}>
          <div className="text-4xl font-semibold text-accent">
            <CountUp value={s.num} />
          </div>
          <p className="mt-2 max-w-xs text-base text-muted">{s.label}</p>
        </div>
      ))}
    </section>
  );
}

const PROJECTS = [
  {
    name: "Ayuri Beauty",
    what: "Beauty salon · Website, online booking, Google profile",
    proof: "Result: fully booked most days within three months",
    href: "/work/ayuri-beauty",
    image: "/work/ayuri-beauty.jpg",
  },
  {
    name: "WellSway Dance Studio, Lincoln",
    what: "Dance classes · Classes, prices and how to join",
    // Justyna's approved quote, cut with an ellipsis
    proof: "“… now people looking for dance classes in Lincoln can find my classes, my prices and how to join, all in one place.” Justyna Wells",
    href: "/work/wellsway",
    image: "/work/wellswaydance.jpg",
  },
];

const card =
  "group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_24px_60px_-24px_rgba(200,151,58,0.45)]";

export function RecentWork() {
  return (
    <section id="work" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-20">
      <h2 className={`mb-10 ${h2}`}>Recent work</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PROJECTS.map((p) => (
          <Link key={p.name} href={p.href} className={card}>
            <div className="relative aspect-[16/10] w-full overflow-hidden">
              <Image
                src={p.image}
                alt={`${p.name} website`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col px-5 py-4">
              <p className="text-lg font-semibold text-foreground">{p.name}</p>
              <p className="mt-1 text-base text-muted">{p.what}</p>
              <p className="mt-4 border-t border-border pt-4 text-sm font-medium text-foreground">{p.proof}</p>
            </div>
          </Link>
        ))}
        <Link
          href="/get-started"
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-foreground/25 p-8 text-center transition-colors hover:border-accent"
        >
          <p className="text-xl font-semibold text-foreground">Your business here?</p>
          <p className="mt-2 max-w-xs text-base text-muted">See what your site could look like before you spend anything.</p>
          <span className={`mt-4 ${textLink}`}>Get a free mockup →</span>
        </Link>
      </div>
    </section>
  );
}

const STEPS = [
  { when: "1 · Within 48 hours", title: "Free mockup", body: "Tell me about your business. I design a mockup from your own photos and prices." },
  { when: "2 · Fixed price first", title: "Refine together", body: "We adjust it until you're happy. Fixed price agreed before any work starts." },
  { when: "3 · Launch", title: "Go live", body: "Your site goes live on your own domain. You own it outright." },
];

export function ClinicCheck() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-4">
      <div className="rounded-3xl border border-border bg-card px-6 py-10 md:px-10 md:py-12">
        <p className={eyebrow}>For clinics</p>
        <h2 className={h2}>Own a clinic?</h2>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
          Paste your website. In about 20 seconds you&apos;ll get a score out of 100 and a plain list of what&apos;s
          putting patients off.
        </p>
        <Link
          href="https://check.designimp.com"
          className="btn-shine mt-8 inline-flex items-center gap-3 rounded-full bg-foreground px-6 py-3 text-base font-medium text-background transition-transform hover:-translate-y-0.5"
        >
          Check my site
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-background/20 text-sm">→</span>
        </Link>
      </div>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section className="border-y border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <h2 className={`mb-10 ${h2}`}>From free mockup to live site</h2>
        <div className="grid gap-10 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.title}>
              <p className="text-sm font-semibold text-accent">{s.when}</p>
              <h3 className="mt-2 text-xl font-semibold text-foreground">{s.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Short versions of the first three sites in Pricing.tsx; the prices themselves come from there.
const SHORT: Record<string, string> = {
  "One-page site": "Who you are, what you do, how to reach you. Contact form, set up for Google.",
  "Small business site": "Up to 5 pages, gallery, link to your booking page or menu.",
  "Bigger site": "Up to 10 pages, a blog and a more custom design.",
};

export function PricingSummary() {
  const sites = SITES.filter((s) => s.name in SHORT);
  return (
    <section id="pricing" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-20">
      <h2 className={h2}>Simple, fixed prices</h2>
      <p className="mt-3 text-lg text-muted">Pay once for the build. Monthly extras are optional and you can cancel any time.</p>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {sites.map((s) => {
          const popular = s.name === "Small business site";
          return (
            <div key={s.name} className={`rounded-2xl border bg-card p-7 ${popular ? "border-accent/70" : "border-border"}`}>
              <h3 className="text-base font-semibold text-foreground">
                {s.name}
                {popular && <span className="text-accent"> · most popular</span>}
              </h3>
              <p className="mt-2 text-4xl font-semibold text-foreground">{s.price}</p>
              <p className="mt-3 text-base leading-relaxed text-muted">{SHORT[s.name]}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-5 rounded-2xl border border-border bg-card/40 p-6">
        <h3 className="font-semibold text-foreground">Don&apos;t want a monthly fee?</h3>
        <p className="mt-2 text-base leading-relaxed text-muted">
          You don&apos;t need one. At launch you get all of your site&apos;s files to host wherever you like. Or keep it
          simple with the care plan at £20 a month: hosting, updates and small edits.
        </p>
      </div>
      <Link href="/prices" className={`mt-8 inline-block ${textLink}`}>
        See all prices and add-ons →
      </Link>
    </section>
  );
}

export function HiRob() {
  return (
    <section className="border-y border-border bg-card/40">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-20 md:flex-row md:items-center md:gap-14">
        <div className="relative aspect-square w-48 shrink-0 overflow-hidden rounded-2xl md:w-56">
          <Image src="/Rob Bio pic.jpeg" alt="Rob Doughty" fill sizes="224px" className="object-cover" />
        </div>
        <div className="max-w-2xl">
          <h2 className={h2}>Hi, I&apos;m Rob.</h2>
          <p className="mt-4 text-lg leading-loose text-muted">
            I build websites for small businesses from Lincoln. You deal with me from the first mockup to launch, with
            no account managers and no hourly billing. The name comes from the Lincoln Imp.
          </p>
          <Link href="/get-started" className={`mt-6 inline-block ${textLink}`}>
            Start with a free mockup →
          </Link>
        </div>
      </div>
    </section>
  );
}
