import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Labs from "@/components/Labs";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Labs",
  description: "Design Imp's side projects: Agent Parrot, a directory of tested and graded AI agents, AI agents built for the OpenServ SERV Hackathon, and Bullwhip, a community site for supply chain people.",
};

export default function LabsPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <Navbar />
      <Labs />
      <Footer />
    </main>
  );
}
