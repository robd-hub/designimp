import Image from "next/image";

interface AboutProps {
  full?: boolean;
}

export default function About({ full = false }: AboutProps) {
  return (
    <section id="story" className="mx-auto max-w-7xl px-6 py-28">
      <div className="grid gap-16 md:grid-cols-2 md:items-center">
        {/* Text column */}
        <div>
          <h2 className="mb-8 text-3xl font-semibold text-foreground md:text-4xl">
            Design Imp.
          </h2>

          <div className="space-y-4 text-lg text-muted leading-loose">
            <p>
              Rob started Design Imp after noticing the same problem everywhere: small businesses doing great work, let down by the website representing them. He built the studio to close that gap.
            </p>
            <p>
              The name is a nod to the Lincoln Imp — a medieval stone carving in Lincoln Cathedral and a symbol of the city Rob is from. Mischievous, distinctive, and built to last.
            </p>
            <p>
              Today Design Imp helps small and medium companies dramatically increase their online presence
              and credibility by creating high quality, agile websites using the latest design and technology.
            </p>

            {full && (
              <>
                <p>
                  Every project runs on a fixed-price, fixed-scope model. Before any work begins you know exactly what you&apos;re getting, what it costs, and when it&apos;ll be done. No surprises, no scope creep, no mystery invoices.
                </p>
                <p>
                  There are no account managers or handoffs here. You work directly with Rob — the same person on your first call is the same person who launches your site. That direct line is what keeps quality high and timelines short.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Photo column */}
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl">
          <Image
            src="/thailand.jpg"
            alt="Doi Inthanon, Lanna region, Thailand"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-center"
          />
        </div>
      </div>
    </section>
  );
}
