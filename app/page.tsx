import type { Metadata } from "next";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Design Imp",
  description: "Custom websites for small and medium businesses. Craft-led studio, fixed price, one point of contact.",
};
import Hero from "@/components/Hero";
import Work from "@/components/Work";
import About from "@/components/About";
import Team from "@/components/Team";
import Services from "@/components/Services";
import Process from "@/components/Process";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import AnimateIn from "@/components/AnimateIn";
import PlayTeaser from "@/components/PlayTeaser";
import { Testimonials } from "@/components/Testimonial";

// A thin gold rule between sections.
const Rule = () => <div aria-hidden="true" className="mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-accent/40 to-transparent" />;

export default function Home() {
  return (
    <main id="main-content" tabIndex={-1}>
      <Navbar />
      <Hero />
      <AnimateIn><Work /></AnimateIn>
      <AnimateIn><Testimonials ids={["ayuri", "wellsway"]} /></AnimateIn>
      <AnimateIn><PlayTeaser /></AnimateIn>
      <AnimateIn><About /></AnimateIn>
      <AnimateIn><Team /></AnimateIn>
      <Services />
      <Rule />
      <Process />
      <AnimateIn><CTA /></AnimateIn>
      <Footer />
    </main>
  );
}
