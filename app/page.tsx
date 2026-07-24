import type { Metadata } from "next";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Design Imp",
  description: "Custom websites for small and medium businesses. Craft-led studio, fixed price, one point of contact.",
};
import Hero from "@/components/Hero";
import LogoBar from "@/components/LogoBar";
import Work from "@/components/Work";
import About from "@/components/About";
import Team from "@/components/Team";
import Services from "@/components/Services";
import Process from "@/components/Process";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import AnimateIn from "@/components/AnimateIn";

export default function Home() {
  return (
    <main id="main-content" tabIndex={-1}>
      <Navbar />
      <Hero />
      <LogoBar />
      <AnimateIn><Work /></AnimateIn>
      <AnimateIn><About /></AnimateIn>
      <AnimateIn><Team /></AnimateIn>
      <Services />
      <Process />
      <CTA />
      <Footer />
    </main>
  );
}
