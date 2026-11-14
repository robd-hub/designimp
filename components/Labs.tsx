import Image from "next/image";
import Link from "next/link";

// Rob's own projects, away from client work. They live on /labs (linked from the footer) rather than the home page,
// which stays about websites for local businesses.
const PROJECTS = [
  {
    name: "Agent Report Card",
    outcome: "Independent A to F grades for AI agents, judged on Reppo's evaluation network",
    href: "/labs/agent-report-card",
    image: "/labs/agent-report-card.jpg",
    cta: "How it works →",
    external: false,
  },
  {
    name: "Cheap First",
    outcome: "Answers with a cheap AI model and only pays for a premium one when a check fails, 80% cheaper in testing",
    href: "/labs/cheap-first",
    image: "/labs/cheap-first.jpg",
    cta: "How it works →",
    external: false,
  },
  {
    name: "Bullwhip",
    outcome: "News, forum and jobs site for the supply chain and logistics community. Still being built.",
    href: "https://supply-chain-talent.vercel.app",
    image: "/work/bullwhip.jpg",
    cta: "Visit site →",
    external: true,
  },
];

export default function Labs() {
  return (
    <section id="labs" className="mx-auto max-w-7xl px-6 pt-32 pb-20 md:pt-40">
      <div className="mb-12">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-accent">Labs</p>
        <h1 className="text-3xl font-semibold text-foreground md:text-5xl">Things we build for ourselves.</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted leading-loose">
          Side projects, away from client work: two AI agents built for the OpenServ SERV Hackathon, and a community
          site for the supply chain world.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PROJECTS.map((project) => (
          <Link
            key={project.name}
            href={project.href}
            {...(project.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="group block overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_24px_60px_-24px_rgba(200,151,58,0.45)]"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden">
              <Image
                src={project.image}
                alt={`${project.name} homepage`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="px-5 py-4">
              <p className="font-semibold text-foreground text-lg">{project.name}</p>
              <p className="mt-1 text-base text-muted leading-loose">{project.outcome}</p>
              <p className="mt-3 text-base text-accent group-hover:text-foreground transition-colors">{project.cta}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
