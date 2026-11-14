import type { Metadata } from "next";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Privacy Policy",
};
import PrivacyHero from "@/components/PrivacyHero";
import PrivacyContent from "@/components/PrivacyContent";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <Navbar />
      <PrivacyHero />
      <PrivacyContent />
      <CTA />
      <Footer />
    </main>
  );
}
