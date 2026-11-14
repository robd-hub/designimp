import type { Metadata } from "next";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Terms of Service",
};
import TermsHero from "@/components/TermsHero";
import TermsContent from "@/components/TermsContent";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <Navbar />
      <TermsHero />
      <TermsContent />
      <CTA />
      <Footer />
    </main>
  );
}
