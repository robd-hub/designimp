import Link from "next/link";
import { PLACES } from "./places";
import PlayLeadForm from "./PlayLeadForm";
import s from "./play.module.css";

// The town as a plain page, for browsers that can't draw the 3D scene.
export default function StreetList() {
  return (
    <div className={s.list}>
      <h1>Imp&apos;s High Street</h1>
      <p>
        Your browser can&apos;t show the 3D town, so here is the street as a list. You can also see{" "}
        <Link href="/#work">all of Design Imp&apos;s work</Link>.
      </p>
      {PLACES.filter((p) => p.kind !== "lot").map((p) => (
        <section key={p.id} className={s.card}>
          <div className={s.kicker}>{p.kicker}</div>
          <h2>{p.name}</h2>
          <p>{p.intro[0]}</p>
          {p.link?.external ? (
            <a href={p.link.href} target="_blank" rel="noopener noreferrer">
              {p.link.label} ↗
            </a>
          ) : (
            p.link && <Link href={p.link.href}>{p.link.label} →</Link>
          )}
        </section>
      ))}
      <section className={s.card}>
        <div className={s.kicker}>Vacant plot</div>
        <h2>Your Shop Here</h2>
        <p>Tell me a little about your business and I&apos;ll design a free mockup of your new website before you spend a penny.</p>
        <PlayLeadForm lot="lot" />
      </section>
    </div>
  );
}
