// Clients' own words. Only real quotes go here, word for word (cut with "…", never reworded), each one
// passed on or approved by the client through Rob.
type Quote = { text: string; name: string; business: string; rating?: number };

export const QUOTES = {
  ayuri: {
    text: "Working with DesignImp was a game-changer for our website build at Ayuri Beauty. … a clean, luxury finish that our clients love.",
    name: "Crissy",
    business: "Ayurinails Beauty Lounge",
    rating: 5,
  },
  // Approved by Justyna, November 2026.
  wellsway: {
    text: "I didn't have a website and had no idea where to start. Rob built one around exactly what I wanted, and now people looking for dance classes in Lincoln can find my classes, my prices and how to join, all in one place.",
    name: "Justyna Wells",
    business: "WellSway Dance Studio",
  },
} satisfies Record<string, Quote>;

type Id = keyof typeof QUOTES;

function QuoteBody({ q, large }: { q: Quote; large: boolean }) {
  return (
    <>
      {q.rating && (
        <p className="text-lg tracking-widest text-accent" aria-label={`Rated ${q.rating} out of 5`}>
          {"★".repeat(q.rating)}
        </p>
      )}
      <blockquote
        className={`mt-5 font-medium leading-snug text-foreground ${large ? "text-2xl md:text-3xl" : "text-xl"}`}
      >
        &ldquo;{q.text}&rdquo;
      </blockquote>
      <figcaption className="mt-6 text-base text-muted">
        <span className="font-semibold text-foreground">{q.name}</span>, {q.business}
      </figcaption>
    </>
  );
}

// One quote, centred, for a case study page.
export default function Testimonial({ id }: { id: Id }) {
  return (
    <figure className="mx-auto max-w-3xl px-6 py-16 text-center">
      <QuoteBody q={QUOTES[id]} large />
    </figure>
  );
}

// Several quotes side by side, for the home page.
export function Testimonials({ ids }: { ids: Id[] }) {
  return (
    <section aria-label="What clients say" className="mx-auto grid max-w-7xl gap-6 px-6 py-16 md:grid-cols-2">
      {ids.map((id) => (
        <figure key={id} className="flex flex-col justify-center rounded-2xl border border-border bg-card p-8">
          <QuoteBody q={QUOTES[id]} large={false} />
        </figure>
      ))}
    </section>
  );
}
