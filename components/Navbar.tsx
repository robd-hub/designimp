"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const servicesHref = isHome ? "#services" : "/services";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || menuOpen ? "border-b border-border bg-background/90 backdrop-blur-md" : ""
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo-icon.png" alt="Design Imp icon" width={32} height={32} />
          <span className="text-foreground font-semibold text-lg tracking-tight">designimp.com</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 text-base text-muted">
          <Link href={servicesHref} className="hover:text-foreground transition-colors">
            Services
          </Link>
          <Link href="/about" className="hover:text-foreground transition-colors">
            About
          </Link>
        </div>

        {/* Desktop CTA */}
        <Link
          href="https://cal.com/rob-doughty-ffsaqo"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-base font-medium text-background transition-opacity hover:opacity-80"
        >
          Let&apos;s talk
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background/20 text-sm">
            →
          </span>
        </Link>

        {/* Mobile hamburger */}
        <button
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((o) => !o)}
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted hover:text-foreground transition-colors"
        >
          {menuOpen ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden="true">
              <path d="M0 1h16M0 6h16M0 11h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-border bg-background/95 backdrop-blur-md px-6 py-6 flex flex-col gap-6"
        >
          <Link
            href={servicesHref}
            className="text-base text-muted hover:text-foreground transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Services
          </Link>
          <Link
            href="/about"
            className="text-base text-muted hover:text-foreground transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            About
          </Link>
          <Link
            href="https://cal.com/rob-doughty-ffsaqo"
            target="_blank"
            rel="noopener noreferrer"
            className="self-start inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-base font-medium text-background transition-opacity hover:opacity-80"
            onClick={() => setMenuOpen(false)}
          >
            Let&apos;s talk
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background/20 text-sm">
              →
            </span>
          </Link>
        </div>
      )}
    </header>
  );
}
