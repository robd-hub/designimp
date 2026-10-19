import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import ChatDemo from "@/components/ChatDemo";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "AI Assistant Demo",
  robots: { index: false, follow: false },
};

const TRY_THESE = [
  "Do you fit combi boilers? Roughly how much?",
  "Water is coming through my kitchen ceiling!",
  "Can someone come and look at a dripping tap next week?",
  "Do you cover Newark?",
];

export default function DemoPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <Navbar />
      <PageHero
        eyebrow="Demo"
        title="An AI assistant for trades websites"
        subtitle="This is a demo for a made-up plumber, Smith Plumbing & Heating. Open the chat in the bottom right corner and talk to it like a customer would."
      />
      <section className="px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-6 text-xl font-semibold text-foreground">Things to try</h2>
          <ul className="space-y-3">
            {TRY_THESE.map((q) => (
              <li key={q} className="rounded-xl border border-white/10 px-5 py-4 text-muted">
                “{q}”
              </li>
            ))}
          </ul>
        </div>
      </section>
      <Footer />
      <ChatDemo />
    </main>
  );
}
