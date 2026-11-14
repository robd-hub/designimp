import Image from "next/image";
import Link from "next/link";

const PROJECTS = [
  {
    name: "Agent Report Card",
    outcome: "Independent A to F grades for AI agents, judged on Reppo's evaluation network",
    href: "/labs/agent-report-card",
    image: "/labs/agent-report-card.jpg",
  },
  {
    name: "Cheap First",
    outcome: "Answers with a cheap AI model and only pays for a premium one when a check fails, 80% cheaper in testing",
    href: "/labs/cheap-first",
    image: "/labs/cheap-first.jpg",
  },
];

export default function Labs() {
  return (
    <section id="labs" className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-12">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-accent">
          Labs
        </p>
        <h2 className="text-3xl font-semibold text-foreground md:text-4xl">
          AI projects we&apos;ve built.
        </h2>
        <p className="mt-4 max-w-2xl text-base text-muted leading-loose">
          Our own experiments with AI agents, built for the OpenServ SERV Hackathon.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {PROJECTS.map((project) => (
          <Link
            key={project.name}
            href={project.href}
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
              <p className="mt-3 text-base text-accent group-hover:text-foreground transition-colors">
                How it works →
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
