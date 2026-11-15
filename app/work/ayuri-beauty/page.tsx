import Navbar from "@/components/Navbar";
import AyuriCaseStudy from "@/components/AyuriCaseStudy";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Ayuri Beauty",
  description: "How a website with online booking and a proper Google listing took Ayuri Beauty from word of mouth to fully booked in three months.",
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
