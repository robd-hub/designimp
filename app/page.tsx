import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { AyuriFeature, Stats, RecentWork, HowItWorks, PricingSummary, HiRob, HOME_FAQS } from "@/components/HomeSections";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import AnimateIn from "@/components/AnimateIn";

export const metadata: Metadata = {
  title: "Design Imp",
  description:
    "Websites for salons, studios and local businesses. See a free mockup of your new site within 48 hours. Fixed price, you own the site, one person from start to finish.",
};

export default function Home() {
  return (
    <main id="main-content" tabIndex={-1}>
      <Navbar />
      <Hero />
      <AyuriFeature />
      <AnimateIn><Stats /></AnimateIn>
      <AnimateIn><RecentWork /></AnimateIn>
      <HowItWorks />
      <AnimateIn><PricingSummary /></AnimateIn>
      <HiRob />
      <FAQ items={HOME_FAQS} heading="Common questions" />
      <CTA />
      <Footer />
    </main>
  );
}
