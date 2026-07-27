import Image from "next/image";
import Link from "next/link";

const PROJECTS = [
  {
    name: "Ayuri Beauty",
    outcome: "Custom website for a Manila-based beauty salon",
    href: "/work/ayuri-beauty",
    image: "/work/ayuri-beauty.jpg",
    cta: "View project →",
    external: false,
  },
];

export default function Work() {
  return (
    <section id="work" className="mx-auto max-w-7xl px-6 py-28">
      <div className="mb-12 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-accent">
            Work
          </p>
          <h2 className="text-3xl font-semibold text-foreground md:text-4xl">
            What we&apos;ve built.
          </h2>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PROJECTS.map((project) => (
          <Link
            key={project.name}
            href={project.href}
            {...(project.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="group block overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-foreground/30"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden">
              <Image
                src={project.image}
                alt={project.name}
                fill
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="px-5 py-4">
              <p className="font-semibold text-foreground text-lg">{project.name}</p>
              <p className="mt-1 text-base text-muted leading-loose">{project.outcome}</p>
              <p className="mt-3 text-base text-muted group-hover:text-foreground transition-colors">
                {project.cta ?? "Visit site →"}
              </p>
            </div>
          </Link>
        ))}

        {/* Placeholder card */}
        <div className="flex aspect-auto min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 px-8 py-12 text-center">
          <p className="text-base font-medium text-muted">More coming soon</p>
          <p className="mt-2 text-base text-muted/60">Next project in progress</p>
        </div>
      </div>
    </section>
  );
}
