import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import FAQ from "@/components/FAQ";
import ChatDemo from "@/components/ChatDemo";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "AI Assistant Demo",
  robots: { index: false, follow: false },
};

const ASSISTANT_FAQS = [
  {
    q: "Can it book appointments on my behalf?",
    a: "Yes. It checks your Google Calendar for free slots, offers the customer a time that suits them and books it straight in. You don't need to lift a finger.",
  },
  {
    q: "Can it send clients confirmation emails?",
    a: "Yes. As soon as a booking is made it can send the customer a confirmation by email or text, and let you know at the same time.",
  },
  {
    q: "What happens to the enquiries it takes?",
    a: "Every enquiry is saved with the customer's name, contact details and what they need, to a Google Sheet or the tool you already use. Nothing gets lost, even at 2am.",
  },
  {
    q: "Will it make things up?",
    a: "No. It only answers from the information you give it: your services, prices, areas and policies. If it doesn't know something, it says so and takes their details for you to follow up.",
  },
  {
    q: "What if a customer wants to speak to a real person?",
    a: "It takes their details and passes them straight to you, so you can call them back.",
  },
  {
    q: "Will it work on my existing website?",
    a: "It works on most websites, including WordPress and Squarespace, and comes built in when we design your new site.",
  },
  {
    q: "Can I change what it says?",
    a: "Yes. When your prices, services or opening hours change, we update it so it always gives the right answers.",
  },
  {
    q: "How much does it cost?",
    a: "It depends on what you need it to do, so we agree the price on a quick call. Book one at cal.com/rob-doughty/30min, or ask the assistant.",
  },
];

export default function DemoPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <Navbar />
      <PageHero
        eyebrow="Demo"
        title="Meet the Design Imp assistant"
        subtitle="This is the kind of AI assistant we build for your website. Open the chat in the bottom right corner and ask it anything, or read the common questions below."
      />
      <FAQ items={ASSISTANT_FAQS} heading="What can it do?" />
      <Footer />
      <ChatDemo />
    </main>
  );
}
