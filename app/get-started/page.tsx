import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import GetStartedHero from "@/components/GetStartedHero";
import LeadForm from "@/components/LeadForm";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Get your free mockup",
  description: "Tell us about your business and we'll put together a free mockup of your new site, no call required.",
};

export default function GetStartedPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <Navbar />
      <GetStartedHero />
      <LeadForm />
      <Footer />
    </main>
  );
}
