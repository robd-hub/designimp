import type { Metadata } from "next";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "About",
  description: "Rob Doughty builds websites for small businesses from Lincoln: one person from the first mockup to launch, fixed prices, and you own the site.",
};
import AboutHero from "@/components/AboutHero";
import About from "@/components/About";
import Team from "@/components/Team";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <Navbar />
      <AboutHero />
      <About full />
      <Team />
      <CTA />
      <Footer />
    </main>
  );
}
