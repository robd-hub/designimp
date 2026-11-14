import type { Metadata } from "next";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Services",
  description: "Website design and build for small businesses from £100, fixed price, plus monthly add-ons like review replies and an AI chat bot. Pick what you need.",
};
import ServicesHero from "@/components/ServicesHero";
import ServicesDetail from "@/components/ServicesDetail";
import Pricing from "@/components/Pricing";
import Process from "@/components/Process";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function ServicesPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <Navbar />
      <ServicesHero />
      <ServicesDetail />
      <Pricing />
      <Process />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
