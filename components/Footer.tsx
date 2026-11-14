import Link from "next/link";

const COLUMNS = [
  [
    { label: "rob@designimp.com", href: "mailto:rob@designimp.com" },
    { label: "Book a call", href: "https://cal.com/rob-doughty/30min" },
  ],
  [
    { label: "Work", href: "/#work" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Services", href: "/services" },
    { label: "About", href: "/about" },
  ],
  [
    { label: "Take a walk round Imp's High Street", href: "/play" },
    { label: "Labs: AI experiments", href: "/labs" },
  ],
  [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
];

const link = "text-base text-muted transition-colors hover:text-foreground";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {COLUMNS.map((col, i) => (
          <ul key={i} className="space-y-3">
            {i === 0 && <li className="text-base font-semibold text-foreground">Rob Doughty</li>}
            {col.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className={link}>
                  {l.label}
                </Link>
              </li>
            ))}
            {i === COLUMNS.length - 1 && (
              <li className="text-sm text-muted">© {new Date().getFullYear()} Design Imp</li>
            )}
          </ul>
        ))}
      </div>
    </footer>
  );
}
