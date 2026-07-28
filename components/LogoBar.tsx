type LogoItem = {
  name: string;
  mark?: React.ReactNode;
};

const LOGOS: LogoItem[] = [
  { name: "Anthropic" },
  {
    name: "Lovable",
    mark: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-auto shrink-0" aria-hidden="true">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z"/>
      </svg>
    ),
  },
  {
    name: "Figma",
    mark: (
      <svg viewBox="0 0 38 57" fill="currentColor" className="h-5 w-auto shrink-0" aria-hidden="true">
        <path d="M19 28.5a9.5 9.5 0 0 1 19 0 9.5 9.5 0 0 1-19 0z"/>
        <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 0 1-19 0z"/>
        <path d="M19 0v19h9.5a9.5 9.5 0 0 0 0-19H19z"/>
        <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z"/>
        <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z"/>
      </svg>
    ),
  },
  {
    name: "Vercel",
    mark: (
      <svg viewBox="0 0 116 100" fill="currentColor" className="h-4 w-auto shrink-0" aria-hidden="true">
        <path d="M57.5 0L115 100H0L57.5 0Z"/>
      </svg>
    ),
  },
  { name: "n8n" },
  { name: "OpenAI" },
  { name: "Antigravity" },
  { name: "Cursor" },
];

export default function LogoBar() {
  const items = [...LOGOS, ...LOGOS, ...LOGOS, ...LOGOS];

  return (
    <section className="border-y border-border py-5 px-6" aria-label="Platforms we build with">
      <div className="flex items-center gap-8">
        <p className="shrink-0 text-sm text-muted tracking-wide whitespace-nowrap" aria-hidden="true">
          Built with
        </p>

        <ul className="sr-only">
          {LOGOS.map((l) => (
            <li key={l.name}>{l.name}</li>
          ))}
        </ul>

        <div className="overflow-hidden flex-1" aria-hidden="true">
          <div
            className="marquee-track flex w-max items-center"
            style={{ animation: "marquee 20s linear infinite" }}
          >
            {items.map((logo, i) => (
              <span
                key={i}
                className="whitespace-nowrap text-base font-medium text-muted tracking-wide pr-16"
              >
                {logo.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
