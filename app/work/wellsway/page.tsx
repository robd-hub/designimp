import Navbar from "@/components/Navbar";
import WellSwayCaseStudy from "@/components/WellSwayCaseStudy";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export const metadata = {
  title: "WellSway Dance Studio",
  description: "How a custom website and local search presence gave a Lincoln dance studio a home online, built around its teacher's own preferences.",
};

export default function WellSwayPage() {
  return (
    <>
      <Navbar />
      <main>
        <WellSwayCaseStudy />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
