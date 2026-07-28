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
            Quality Websites.
          </h2>

          <div className="space-y-4 text-lg text-muted leading-loose">
            <p>
              I started designimp.com after noticing the same problem everywhere: small businesses doing brilliant work, held back by a website that didn&apos;t do them justice. I wanted to fix that.
            </p>
            <p>
              The name is a nod to the Lincoln Imp, a medieval stone carving in Lincoln Cathedral and a symbol of the city I&apos;m from. Mischievous, distinctive, and built to last.
            </p>
            <p>
              I help small and medium businesses dramatically increase their online presence and credibility through high quality, modern websites built with the latest design and technology.
            </p>

            {full && (
              <>
                <p>
                  Every project runs on a fixed-price, fixed-scope model. Before we start, you know exactly what you&apos;re getting, what it costs, and when it&apos;ll be done. No surprises, no scope creep, no mystery invoices.
                </p>
                <p>
                  There are no account managers or handoffs. You work directly with me from the first call to launch day — and I&apos;m still on hand after. That direct line is what keeps quality high and timelines short.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Photo column */}
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl">
          <Image
            src="/Lincoln Cathedral monochrome.png"
            alt="Lincoln Cathedral"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-center"
          />
        </div>
      </div>
    </section>
  );
}
