import Link from "next/link";

const FOUNDER_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/robdoughts/" },
  { label: "X / Twitter", href: "https://x.com/designimp_com" },
  { label: "rob@designimp.com", href: "mailto:rob@designimp.com" },
];

const COMPANY_LINKS = [
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Work", href: "/#work" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Book a Call", href: "https://cal.com/rob-doughty/30min" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="mx-auto max-w-7xl px-6 py-16">

        <div className="flex flex-col gap-12 md:flex-row md:items-start">
          {/* Work with us — left, takes ~half the width */}
          <div className="md:flex-1">
            <p className="mb-3 text-base text-muted">
              Work with us
            </p>
            <p className="text-2xl font-semibold text-foreground leading-snug max-w-sm">
              Start with a free mockup.
            </p>
            <a
              href="https://cal.com/rob-doughty/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-3 rounded-full border border-foreground/20 px-5 py-3 text-base font-medium text-foreground hover:bg-foreground hover:text-background transition-colors"
            >
              Get your free mockup
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background text-sm">
                →
              </span>
            </a>
          </div>

          {/* Link columns — right side */}
          <div className="flex gap-16 md:gap-20">
            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted">
                Rob Doughty
              </p>
              <ul className="space-y-3">
                {FOUNDER_LINKS.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-base text-muted hover:text-foreground transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted">
                Company
              </p>
              <ul className="space-y-3">
                {COMPANY_LINKS.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-base text-muted hover:text-foreground transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col gap-2 border-t border-border pt-8 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
          <p>© {new Date().getFullYear()} Design Imp. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
