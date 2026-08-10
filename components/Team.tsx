import Image from "next/image";

export default function Team() {
  return (
    <section
      id="team"
      className="py-28 px-6"
      style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 40%, #1a1a2e 0%, #111113 70%)",
      }}
    >
      <div className="mx-auto max-w-5xl">

        {/* Centered header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold text-foreground md:text-4xl leading-tight">
            The person behind the work.
          </h2>
          <p className="mt-4 mx-auto max-w-2xl text-lg text-muted leading-loose">
            I believe every business deserves a website it can be proud of.
          </p>
        </div>

        {/* Single founder — photo left, info right */}
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:gap-16">
          {/* Photo card */}
          <div className="w-full md:w-80 shrink-0">
            <div
              className="relative w-full overflow-hidden rounded-2xl"
              style={{ aspectRatio: "4/4.5", background: "#2a2a2e" }}
            >
              <Image
                src="/Rob Bio pic.jpeg"
                alt="Rob Doughty"
                fill
                className="object-cover"
                sizes="(min-width: 768px) 320px, 100vw"
              />
            </div>
          </div>

          {/* Info right */}
          <div className="flex flex-col justify-center">
            <h3 className="text-2xl font-semibold text-foreground">Rob Doughty</h3>
            <div className="mt-1 text-base text-muted">Founder</div>
            <p className="mt-4 text-lg text-muted leading-loose">
              I started designimp.com in 2026 after working with a local boutique beauty salon and watching their business change completely once they had a website that actually reflected how good they were.
            </p>
            <p className="mt-4 text-lg text-muted leading-loose">
              It made me realise how many great businesses are being held back by websites that don&apos;t do them justice. That&apos;s what designimp.com is here to fix.
            </p>
            <p className="mt-4 text-lg text-muted leading-loose">
              Every client works directly with me from the first call to launch. No account managers, no handoffs, no surprises.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
