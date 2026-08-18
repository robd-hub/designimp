import Link from "next/link";

const STATS = [
  { num: "75%", label: "of users judge credibility by design alone" },
  { num: "88%", label: "won't return after a bad experience" },
  { num: "2.6×", label: "avg. revenue lift from good UX" },
  { num: "53%", label: "abandon if load time exceeds 3 seconds" },
  { num: "38%", label: "stop engaging with unattractive layouts" },
];

export default function Hero() {
  return (
    <section
      className="relative flex w-full flex-col items-center justify-center px-6 text-center pt-32 pb-16 md:pt-40 md:pb-16"
      style={{
        minHeight: "calc(80svh - 5em)",
        WebkitFontSmoothing: "antialiased",
        background: "radial-gradient(ellipse 80% 60% at 50% 40%, #1a1a2e 0%, #111113 70%)",
      }}
    >
      <div className="mx-auto w-full max-w-4xl">

        <h1
          className="animate-fade-in-up font-semibold leading-tight text-foreground"
          style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", animationDelay: "0ms" }}
        >
          Your best work deserves a better website.
        </h1>

        <p
          className="animate-fade-in-up mt-6 mx-auto max-w-2xl text-lg text-muted leading-loose"
          style={{ animationDelay: "120ms" }}
        >
          You&apos;ve put years into what you do. Your website should carry that same weight.
        </p>

        {/* Stats */}
        <div
          className="animate-fade-in-up mt-10 flex flex-wrap justify-center gap-x-12 gap-y-6"
          style={{ animationDelay: "240ms" }}
        >
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-semibold text-accent">{s.num}</div>
              <div className="mt-0.5 text-base text-muted">{s.label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="animate-fade-in-up mt-10" style={{ animationDelay: "360ms" }}>
          <Link
            href="https://cal.com/rob-doughty/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 rounded-full bg-foreground px-6 py-3 text-base font-medium text-background transition-opacity hover:opacity-80"
          >
            Get your free mockup
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-background/20 text-sm">
              →
            </span>
          </Link>
        </div>

      </div>
    </section>
  );
}
