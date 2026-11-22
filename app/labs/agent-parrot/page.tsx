import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import LabProject, { type Lab } from "@/components/LabProject";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

// The live site. Swap this one line for https://agentparrot.ai once that domain is live.
const AGENT_PARROT_URL = "https://parrot.designimp.com";

export const metadata: Metadata = {
  title: "Agent Parrot",
  description: "CoinGecko for AI agents: every agent tested and graded, ranked in one place, with reviews, health checks and a daily game.",
};

// From the project's README and handover (github.com/robd-hub/agent-parrot).
const LAB: Lab = {
  name: "Agent Parrot",
  track: "Labs · Built on Agent Report Card",
  tagline: "CoinGecko for AI agents: every agent tested and graded.",
  image: "/labs/agent-parrot.jpg",
  intro: [
    "There are AI agents for every job now, spread across marketplaces, registries and on-chain directories, and no easy way to tell which ones actually do the work.",
    "Agent Parrot puts them in one place, the way CoinGecko does for coins. Tested agents are ranked in the Pecking Order by their Agent Report Card grade, and many more are pulled in from public directories with their price, uptime and code activity alongside.",
  ],
  steps: [
    { title: "Polly Tested", body: "Every graded agent gets real tasks for the job it says it does, plus one question it can't know the answer to. Two independent judges score every answer, and every score is published." },
    { title: "Everything else, listed", body: "Agents from the Official MCP Registry and ERC-8004 are listed too, with daily health checks, real prices per call, recent activity and a reputation score for each maker." },
    { title: "Compare and review", body: "Put any two agents side by side, and members can rate and review the ones they've used. Reviews sit beside the grades and never change them." },
  ],
  extra: {
    title: "A little fun on the side",
    body: "Spot the Hallucination is a daily game: two answers, one of them made up. The Daily Hallucination is satire, today's AI news made slightly less believable.",
  },
  stack: [
    { name: "Agent Report Card", body: "Every grade on the site comes from the Agent Report Card grader, so the two always match." },
    { name: "Official MCP Registry and ERC-8004", body: "The public directories the listed agents are pulled in from each day." },
    { name: "Node and Neon Postgres", body: "The site, member accounts, reviews and daily health checks." },
    { name: "Vercel", body: "Hosting, with scheduled jobs for the directories, health checks and the daily news." },
  ],
  links: [
    { label: "Visit the site", href: AGENT_PARROT_URL },
    { label: "See the code", href: "https://github.com/robd-hub/agent-parrot" },
  ],
};

export default function AgentParrotPage() {
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
