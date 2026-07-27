const LOGOS = [
  "Anthropic",
  "Lovable",
  "Figma",
  "Vercel",
  "n8n",
  "OpenAI",
  "Antigravity",
  "Cursor",
];

export default function LogoBar() {
  return (
    <section className="border-y border-border py-5 px-6" aria-label="Platforms we build with">
      <div className="flex items-center gap-8">
        <p className="shrink-0 text-sm text-muted tracking-wide whitespace-nowrap" aria-hidden="true">
          Platforms we build with
        </p>

        {/* Screen-reader-only static list */}
        <ul className="sr-only">
          {LOGOS.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>

        {/* Animated marquee — decorative, hidden from screen readers */}
        <div className="overflow-hidden flex-1" aria-hidden="true">
          <div
            className="marquee-track flex w-max items-center"
            style={{ animation: "marquee 20s linear infinite" }}
          >
            {[...LOGOS, ...LOGOS, ...LOGOS, ...LOGOS].map((name, i) => (
              <span
                key={i}
                className="whitespace-nowrap text-base font-medium text-muted tracking-wide pr-16"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
