import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import LeadForm from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "Get your free mockup",
  description: "See your new website in 48 hours. Tell me about your business and I'll design a free mockup from your own photos and prices. No call needed.",
};

// A slim header instead of the full navbar, so nothing pulls people away from the form.
export default function GetStartedPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo-icon.png" alt="Design Imp icon" width={32} height={32} />
            <span className="text-lg font-semibold text-foreground">designimp.com</span>
          </Link>
          <Link href="/" className="text-sm text-muted transition-colors hover:text-foreground">
            Back to home
          </Link>
        </div>
      </header>
      <LeadForm />
    </main>
  );
}
