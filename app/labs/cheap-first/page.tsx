import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import LabProject, { type Lab } from "@/components/LabProject";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Cheap First",
  description: "Answers with a cheap AI model first and only pays for a premium one when a check fails: 80% cheaper on a 143-question benchmark. Built for SERV Hackathon 02.",
};

// From the project's README (github.com/robd-hub/cheap-first).
const LAB: Lab = {
  name: "Cheap First",
  track: "Labs · SERV Hackathon 02, Dolphin track",
  tagline: "Frontier quality at cheap-model prices.",
  image: "/labs/cheap-first.jpg",
  intro: [
    "Most questions don't need the most expensive AI model, but teams send everything to one because they can't tell in advance which answers will go wrong.",
    "Cheap First makes that call one question at a time. A cheap model answers, a cheap checker marks the answer, and only the answers that fail the check are paid for at premium prices.",
  ],
  steps: [
    { title: "A cheap model answers", body: "DeepSeek V4.1 Flash on the Dolphin network answers first, at $0.01 in and $0.07 out per million tokens." },
    { title: "SERV checks it", body: "A small SERV Reasoning model scores the answer from 0 to 100: is it correct, did it follow the instructions, and was anything made up?" },
    { title: "Escalate only if needed", body: "Below 75, the question goes to Claude Opus 5.5 on SERV and that answer is sent instead." },
  ],
  results: {
    title: "143 questions, run both ways.",
    rows: [
      ["Total cost, Cheap First", "$0.27"],
      ["Total cost, premium model only", "$1.33"],
      ["Saving", "80%"],
      ["Answered by the cheap model alone", "139 of 143"],
      ["Average quality score", "99.7 (premium only: 98.0)"],
    ],
    notes: [
      "The saving was 98% on 104 everyday questions and 66% on 39 stress tests. Every cost comes from the token counts the APIs returned, and both sets of answers were graded by the same checker.",
      "The safety net works: the checker escalated 4 questions. Three were real catches (a wrong count, and blank answers on a 40-digit multiplication and the \"world's hardest Sudoku\"), and the premium model got all three right. The fourth was a false alarm on a correct answer, shown openly on the results page. In a separate test, the checker failed all 8 deliberately wrong answers it was given.",
    ],
  },
  stack: [
    { name: "Dolphin", body: "The cheap first answer: DeepSeek V4.1 Flash on the Dolphin network." },
    { name: "SERV Reasoning (OpenServ)", body: "The checker that scores each answer, and the route to the premium model when an answer fails." },
    { name: "TypeScript and Node", body: "The answer, check and escalate loop, and the benchmark that records the real cost of every call." },
    { name: "Vercel and GitHub Pages", body: "A small serverless function powers the \"try it live\" box, with the keys kept on the server and limits on use; the results page is plain HTML built from the benchmark data." },
  ],
  links: [
    { label: "Visit the site", href: "https://cheapfirst.designimp.com" },
    { label: "Watch the demo", href: "https://youtu.be/QisYhwqbiME" },
    { label: "See the code", href: "https://github.com/robd-hub/cheap-first" },
  ],
};

export default function CheapFirstPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <LabProject lab={LAB} />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
