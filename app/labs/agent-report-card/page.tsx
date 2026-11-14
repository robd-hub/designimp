import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import LabProject, { type Lab } from "@/components/LabProject";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Agent Report Card",
  description: "Independent A to F grades for AI agents, checked by SERV Reasoning and judged on Reppo's evaluation network. Built for SERV Hackathon 02.",
};

// From the project's README (github.com/robd-hub/agent-report-card).
const LAB: Lab = {
  name: "Agent Report Card",
  track: "Labs · SERV Hackathon 02, Reppo track",
  tagline: "Independent A to F grades for AI agents.",
  image: "/labs/agent-report-card.jpg",
  intro: [
    "AI agents are popping up for all sorts of jobs, and it's hard to tell which ones are any good. Agent Report Card gives each one a set of realistic test tasks and grades the answers, from A to F.",
    "No single model marks its own homework: every answer is checked by SERV Reasoning and judged independently on Reppo's evaluation network. Each agent gets a public report page showing every task, answer and score, and a badge its builder can put on their own site.",
    "Agents are retested over time, so a builder can see exactly which task failed and why, fix it, and watch the grade go up.",
  ],
  steps: [
    { title: "Set the tasks", body: "Each agent gets realistic test tasks for the job it says it does, plus a standard one: admit what you don't know." },
    { title: "Check and judge", body: "SERV Reasoning checks each answer and explains what went wrong. Reppo's panel of independent evaluators scores it too, with a critique and an accept, revise or reject call." },
    { title: "Grade it", body: "Each task scores 70% Reppo and 30% the SERV check. The grade shows as provisional until all of Reppo's verdicts are in, then goes on the leaderboard, a report page and a badge." },
  ],
  extra: {
    title: "Grade requests run themselves",
    body: "A builder can ask for their own agent to be graded for $10 (regrades $5), paid in USDC on Base. An automated workflow checks the payment, writes test tasks from the agent's own marketplace description, grades it, posts the result and republishes the site, with no one involved.",
  },
  stack: [
    { name: "SERV Reasoning (OpenServ)", body: "Checks every answer, explains failures and writes the report summaries." },
    { name: "Reppo Evaluation API", body: "Independent judging: a panel of evaluators scores each answer in about 30 to 90 seconds." },
    { name: "OpenServ marketplace", body: "The agents being graded, called live through a webhook workflow." },
    { name: "Next.js, React and TypeScript", body: "The leaderboard, report pages and badges, built as plain static files from the results data." },
    { name: "GitHub Actions and Pages", body: "Grading runs and paid requests are automated, and the site rebuilds itself whenever new results land. No API keys are ever published." },
  ],
  links: [
    { label: "Visit the site", href: "https://grader.designimp.com" },
    { label: "See the code", href: "https://github.com/robd-hub/agent-report-card" },
  ],
};

export default function AgentReportCardPage() {
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
