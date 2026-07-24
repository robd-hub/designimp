import Image from "next/image";

export default function Team() {
  return (
    <section id="team" className="py-28 px-6 bg-card">
      <div className="mx-auto max-w-5xl">

        {/* Centered header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold text-foreground md:text-4xl leading-tight">
            The person behind the work.
          </h2>
          <p className="mt-4 mx-auto max-w-2xl text-lg text-muted leading-loose">
            I believe every business deserves a website it can be proud of — and I built designimp.com to make that happen.
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
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-4xl font-semibold text-muted select-none tracking-tight">
                  RD
                </span>
              </div>
            </div>
          </div>

          {/* Info right */}
          <div className="flex flex-col justify-center">
            <h3 className="text-2xl font-semibold text-foreground">Rob Doughty</h3>
            <div className="mt-1 text-base text-muted">Founder</div>
            <p className="mt-4 text-lg text-muted leading-loose">
              I started designimp.com in 2026 after seeing first-hand the massive impact a quality website had on a local boutique beauty salon. It changed their business — and I want to do the same for other business owners.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
