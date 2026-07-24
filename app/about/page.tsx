import type { Metadata } from "next";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "About",
  description: "The story behind Design Imp — a small, craft-led studio helping small and medium businesses get websites they can be proud of.",
};
import AboutHero from "@/components/AboutHero";
import LogoBar from "@/components/LogoBar";
import About from "@/components/About";
import Team from "@/components/Team";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <Navbar />
      <AboutHero />
      <LogoBar />
      <About full />
      <Team />
      <CTA />
      <Footer />
    </main>
  );
}
