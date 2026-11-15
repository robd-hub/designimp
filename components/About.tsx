import Image from "next/image";

interface AboutProps {
  full?: boolean;
}

export default function About({ full = false }: AboutProps) {
  return (
    <section id="story" className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid gap-16 md:grid-cols-2 md:items-center">
        {/* Text column */}
        <div>
          <h2 className="mb-8 text-3xl font-semibold text-foreground md:text-4xl">
            Why I started this.
          </h2>

          <div className="space-y-4 text-lg text-muted leading-loose">
            <p>
              I started designimp.com after noticing the same problem everywhere: small businesses doing brilliant work, held back by a website that didn&apos;t do them justice. I wanted to fix that.
            </p>
            <p>
              The name is a nod to the Lincoln Imp, a medieval stone carving in Lincoln Cathedral and a symbol of my home city.
            </p>
            <p>
              I build fast, modern websites that make a small business look as good online as it does in person, and that bring in the bookings and enquiries to match.
            </p>

            {full && (
              <>
                <p>
                  Every project is a fixed price and a fixed scope. Before we start, you know exactly what you&apos;re getting, what it costs and when it&apos;ll be done. No surprises, no scope creep, no mystery invoices.
                </p>
                <p>
                  There are no account managers or handoffs. You work directly with me from the first mockup to launch day, and I&apos;m still on hand after. That direct line is what keeps the quality high and the timeline short.
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
