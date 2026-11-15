import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Prices",
  description:
    "Websites for small businesses at a fixed price, from £100, plus optional monthly add-ons. Pay once for the build and the site is yours.",
};

// /services redirects here (next.config.ts).
export default function PricesPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <Navbar />
      <PageHero
        eyebrow="Prices"
        title="Simple, fixed prices."
        subtitle="Pay once for the build and the site is yours. Monthly add-ons are optional, roll month to month, and you can cancel any time."
      />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
