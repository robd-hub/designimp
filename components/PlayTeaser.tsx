import Image from "next/image";
import Link from "next/link";

// A way into Imp's High Street from the home page: a picture of the town, panning slowly, and a button to /play.
// For the website only: the game isn't mentioned in outreach.
export default function PlayTeaser() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid items-center gap-10 overflow-hidden rounded-3xl border border-accent/30 bg-[radial-gradient(ellipse_at_top_left,#2a2214_0%,#1c1c1e_60%)] p-6 md:p-10 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-accent">Imp&apos;s High Street</p>
          <h2 className="text-3xl font-semibold text-foreground md:text-4xl">Take a walk round Lincoln.</h2>
          <p className="mt-4 max-w-md text-base leading-loose text-muted">
            A little 3D Lincoln I built, where every building is a project, a service or a landmark. Walk the Imp up Steep
            Hill, walk along the top of the castle walls and look out for the imps hiding round town.
          </p>
          <Link
            href="/play"
            className="btn-shine mt-8 inline-flex items-center gap-3 rounded-full bg-accent px-6 py-3 text-base font-medium text-background transition-transform hover:-translate-y-0.5"
          >
            Start walking
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-background/20 text-sm">→</span>
          </Link>
        </div>
        <Link href="/play" className="group relative block aspect-[16/10] overflow-hidden rounded-2xl border border-border" aria-label="Play Imp's High Street">
          <Image
            src="/play/town.jpg"
            alt="Lincoln Castle, Castle Square and Ellis Mill in Imp's High Street, with the Imp at the castle gate"
            fill
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="slow-pan object-cover"
          />
          <span className="absolute bottom-4 right-4 rounded-full bg-background/80 px-4 py-2 text-sm font-medium text-foreground backdrop-blur-sm transition-colors group-hover:text-accent">
            Play in your browser →
          </span>
        </Link>
      </div>
    </section>
  );
}
