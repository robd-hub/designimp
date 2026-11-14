import Link from "next/link";
import { CountUp, Showcase, WhoFor } from "./HeroLive";

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
      className="relative w-full overflow-hidden px-6 pt-32 pb-16 md:pt-40"
      style={{ WebkitFontSmoothing: "antialiased", background: "#111113" }}
    >
      {/* two soft glows, gold and indigo, drifting slowly behind everything */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="glow-a absolute -top-32 left-[8%] h-[34rem] w-[34rem] rounded-full bg-[#C8973A]/20 blur-[120px]" />
        <div className="glow-b absolute top-24 right-[4%] h-[30rem] w-[30rem] rounded-full bg-[#3b3b8f]/30 blur-[120px]" />
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
        <div className="text-center lg:text-left">
          <h1
            className="animate-fade-in-up font-semibold leading-tight text-foreground"
            style={{ fontSize: "clamp(2.5rem, 5vw, 4.25rem)", animationDelay: "0ms" }}
          >
            Your best work deserves a better website.
          </h1>

          <div className="animate-fade-in-up mt-6" style={{ animationDelay: "120ms" }}>
            <WhoFor />
          </div>

          <p
            className="animate-fade-in-up mt-4 max-w-xl text-lg text-muted leading-loose mx-auto lg:mx-0"
            style={{ animationDelay: "200ms" }}
          >
            You&apos;ve put years into what you do. Your website should carry that same weight.
          </p>

          <div className="animate-fade-in-up mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start" style={{ animationDelay: "300ms" }}>
            <Link
              href="/get-started"
              className="btn-shine inline-flex items-center gap-3 rounded-full bg-foreground px-6 py-3 text-base font-medium text-background transition-transform hover:-translate-y-0.5"
            >
              Get your free mockup
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-background/20 text-sm">→</span>
            </Link>
            <Link href="/services#pricing" className="text-base text-accent transition-colors hover:text-foreground">
              Sites from £100 →
            </Link>
          </div>
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: "250ms" }}>
          <Showcase />
        </div>
      </div>

      {/* Stats */}
      <div
        className="animate-fade-in-up relative mx-auto mt-16 flex max-w-5xl flex-wrap justify-center gap-x-12 gap-y-6 text-center"
        style={{ animationDelay: "400ms" }}
      >
        {STATS.map((s) => (
          <div key={s.label}>
            <div className="text-2xl font-semibold text-accent">
              <CountUp value={s.num} />
            </div>
            <div className="mt-0.5 text-base text-muted">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
