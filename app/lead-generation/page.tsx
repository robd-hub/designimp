import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import LeadGenExample from "@/components/LeadGenExample";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Automated Lead Generation",
  description:
    "A steady supply of new prospects without the legwork. Every weekday we find businesses that fit your ideal customer, score them and draft a personal first message for you to review.",
};

const LEAD_GEN_FAQS = [
  {
    q: "How does it work?",
    a: "You tell us who your ideal customer is and where they are, for example cafés in Lincoln or builders within 20 miles of Nottingham. Every weekday it searches Google Maps for businesses that match, visits each one's website, and pulls together what it needs to judge whether they're worth contacting.",
  },
  {
    q: "What happens to each business it finds?",
    a: "It checks their online presence (their website, reviews, opening hours and social pages), finds their public contact details, and scores how good a fit they are for you. Businesses it has already found are skipped, so you never see the same one twice.",
  },
  {
    q: "Does it write the messages too?",
    a: "Yes. For every good fit it drafts a short, personal first message that mentions something real about that business, so it doesn't read like a mass mailout. You can edit any draft before it goes.",
  },
  {
    q: "Where do the leads end up?",
    a: "In a shared Google Sheet with the business name, contact details, fit score and draft message on each row. New leads are added every weekday, ready for you to work through with your morning coffee.",
  },
  {
    q: "Will it send messages without me knowing?",
    a: "No. Nothing goes out without your say. You review the leads, pick the ones you like and send the messages yourself, or tell us to send the ones you've approved.",
  },
  {
    q: "Is it GDPR friendly?",
    a: "It only uses information businesses publish about themselves online. Every message says clearly who it's from and includes an easy way to opt out, and anyone who opts out is never contacted again.",
  },
  {
    q: "How many leads will I get?",
    a: "That depends on your area and how specific your ideal customer is. We agree a daily number with you, then tune the search with you in the first couple of weeks so you get fewer, better leads rather than a long list of poor ones.",
  },
  {
    q: "How much does it cost?",
    a: "It depends on how many leads you want and whether we send the messages for you, so we agree the price together, no call required. Tell us about your business through our quick form and we'll follow up with pricing.",
  },
];

export default function LeadGenerationPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <Navbar />
      <PageHero
        eyebrow="Lead generation"
        title="Fresh prospects every weekday"
        subtitle="We find businesses that fit your ideal customer, check them out and draft a personal first message for each one. You review them in a shared sheet and decide who to contact."
      />
      <LeadGenExample />
      <FAQ items={LEAD_GEN_FAQS} heading="Your questions, answered." />
      <CTA />
      <Footer />
    </main>
  );
}
