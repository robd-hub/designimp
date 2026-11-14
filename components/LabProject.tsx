import Image from "next/image";
import Link from "next/link";

// A page about one of the Labs projects: what it is, how it works, what it found and what it's built on, with links
// to the live site and the code. The facts come from each project's own README.
export type Lab = {
  name: string;
  track: string;
  tagline: string;
  image: string;
  intro: string[];
  steps: { title: string; body: string }[];
  results?: { title: string; rows: [string, string][]; notes: string[] };
  extra?: { title: string; body: string };
  stack: { name: string; body: string }[];
  links: { label: string; href: string }[];
};

export default function LabProject({ lab }: { lab: Lab }) {
  return (
    <article>
      <div className="relative mt-20 aspect-[21/9] w-full overflow-hidden">
        <Image src={lab.image} alt={`${lab.name} homepage`} fill priority sizes="100vw" className="object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </div>

      <div className="mx-auto max-w-5xl space-y-20 px-6 pb-8 pt-12">
        <div>
          <Link href="/#labs" className="text-sm text-muted transition-colors hover:text-accent">
            ← Labs
          </Link>
          <p className="mb-2 mt-6 text-sm font-semibold uppercase tracking-widest text-accent">{lab.track}</p>
          <h1 className="text-3xl font-semibold text-foreground md:text-5xl">{lab.name}</h1>
          <p className="mt-4 text-xl text-muted">{lab.tagline}</p>
        </div>

        <div className="grid gap-10 md:grid-cols-2 md:items-start">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent">What it is</p>
            <h2 className="text-2xl font-semibold leading-snug text-foreground md:text-3xl">In plain English.</h2>
          </div>
          <div className="space-y-4 text-lg leading-loose text-muted">
            {lab.intro.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent">How it works</p>
          <div className="grid gap-4 md:grid-cols-3">
            {lab.steps.map((s, i) => (
              <div key={s.title} className="rounded-2xl border border-border bg-card p-6">
                <p className="mb-3 text-sm font-semibold text-accent">0{i + 1}</p>
                <h3 className="text-lg font-semibold leading-snug text-foreground">{s.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        {lab.results && (
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent">Results</p>
            <h2 className="mb-8 text-2xl font-semibold leading-snug text-foreground md:text-3xl">{lab.results.title}</h2>
            <div className="divide-y divide-border rounded-2xl border border-border bg-card">
              {lab.results.rows.map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-6 px-6 py-4">
                  <span className="text-base text-muted">{k}</span>
                  <span className="text-right text-lg font-semibold text-foreground">{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-3 text-base leading-loose text-muted">
              {lab.results.notes.map((n) => (
                <p key={n}>{n}</p>
              ))}
            </div>
          </div>
        )}

        {lab.extra && (
          <div className="rounded-2xl border border-accent/40 bg-card p-8">
            <h2 className="text-xl font-semibold text-foreground">{lab.extra.title}</h2>
            <p className="mt-3 text-base leading-loose text-muted">{lab.extra.body}</p>
          </div>
        )}

        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent">Built on</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {lab.stack.map((s) => (
              <div key={s.name} className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-semibold text-foreground">{s.name}</h3>
                <p className="mt-2 text-base leading-relaxed text-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6 border-t border-border pt-12 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-lg font-semibold text-foreground">See it for yourself</p>
          <div className="flex flex-wrap gap-3">
            {lab.links.map((l, i) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  i === 0
                    ? "btn-shine inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-base font-medium text-background"
                    : "inline-flex items-center gap-2 rounded-full border border-foreground/20 px-5 py-3 text-base font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
                }
              >
                {l.label} →
              </a>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
