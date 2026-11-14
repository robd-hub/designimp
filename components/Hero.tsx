import Image from "next/image";
import Link from "next/link";

// The home page hero: who it's for, the 48-hour mockup promise and Ayuri Beauty's site on a laptop and a phone.
export default function Hero() {
  return (
    <section
      className="relative w-full overflow-hidden px-6 pt-32 pb-20 md:pt-40"
      style={{ WebkitFontSmoothing: "antialiased", background: "#111113" }}
    >
      {/* two soft glows, gold and indigo, drifting slowly behind everything */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="glow-a absolute -top-32 left-[8%] h-[34rem] w-[34rem] rounded-full bg-[#C8973A]/20 blur-[120px]" />
        <div className="glow-b absolute top-24 right-[4%] h-[30rem] w-[30rem] rounded-full bg-[#3b3b8f]/30 blur-[120px]" />
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
        <div className="text-center lg:text-left">
          <p className="animate-fade-in-up text-sm font-semibold uppercase tracking-widest text-accent">
            Websites for salons, studios and local businesses
          </p>
          <h1
            className="animate-fade-in-up mt-5 font-semibold leading-tight text-foreground"
            style={{ fontSize: "clamp(2.5rem, 5vw, 4.25rem)", animationDelay: "80ms" }}
          >
            Your best work deserves a better website.
          </h1>

          <p
            className="animate-fade-in-up mx-auto mt-6 max-w-xl text-lg leading-loose text-muted lg:mx-0"
            style={{ animationDelay: "160ms" }}
          >
            See a free mockup of your new site, built from your own photos and prices, within 48 hours. No call, no
            obligation.
          </p>

          <div
            className="animate-fade-in-up mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start"
            style={{ animationDelay: "240ms" }}
          >
            <Link
              href="/get-started"
              className="btn-shine inline-flex items-center gap-3 rounded-full bg-foreground px-6 py-3 text-base font-medium text-background transition-transform hover:-translate-y-0.5"
            >
              Get my free mockup
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-background/20 text-sm">→</span>
            </Link>
            <Link
              href="#pricing"
              className="inline-flex items-center rounded-full border border-foreground/25 px-6 py-3 text-base font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              Sites from £100
            </Link>
          </div>

          <p className="animate-fade-in-up mt-6 text-sm text-muted" style={{ animationDelay: "320ms" }}>
            Fixed price · You own the site · One person from start to finish
          </p>
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: "250ms" }}>
          <Devices />
        </div>
      </div>
    </section>
  );
}

// Ayuri Beauty's real site in a laptop window, with the phone version overlapping its corner.
function Devices() {
  return (
    <Link href="/work/ayuri-beauty" aria-label="Ayuri Beauty case study" className="relative block pb-10 pr-8 sm:pr-14">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_30px_80px_-30px_rgba(200,151,58,0.45)]">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-3 flex-1 truncate rounded-full bg-background/70 px-3 py-1 text-left text-xs text-muted">
            ayuribeauty.com
          </span>
        </div>
        <div className="relative aspect-[16/10] w-full">
          <Image
            src="/work/ayuri-beauty.jpg"
            alt="Ayuri Beauty's website on a laptop"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover object-top"
          />
        </div>
      </div>
      <div className="absolute right-0 bottom-0 w-[30%] max-w-[170px] overflow-hidden rounded-[1.4rem] border-[5px] border-[#2a2a2e] bg-black shadow-2xl">
        <div className="relative aspect-[390/844] w-full">
          <Image
            src="/work/ayuri-beauty-mobile.jpg"
            alt="Ayuri Beauty's website on a phone"
            fill
            sizes="170px"
            className="object-cover object-top"
          />
        </div>
      </div>
    </Link>
  );
}
