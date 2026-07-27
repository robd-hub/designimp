import Navbar from "@/components/Navbar";
import AyuriCaseStudy from "@/components/AyuriCaseStudy";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Ayuri Beauty",
  description: "How a custom website, Google Maps presence, and strong socials took Ayuri Beauty from empty chairs to full capacity in three months.",
};

export default function AyuriPage() {
  return (
    <>
      <Navbar />
      <main>
        <AyuriCaseStudy />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
