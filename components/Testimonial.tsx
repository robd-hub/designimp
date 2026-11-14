// Clients' own words. Only real quotes go here, word for word (cut with "…", never reworded), each one
// passed on by Rob from the client. Add Justyna's from WellSway when it comes in.
export const QUOTES = {
  ayuri: {
    text: "Working with DesignImp was a game-changer for our website build at Ayuri Beauty. … a clean, luxury finish that our clients love.",
    name: "Crissy",
    business: "Ayurinails Beauty Lounge",
    rating: 5,
  },
} as const;

export default function Testimonial({ id }: { id: keyof typeof QUOTES }) {
  const q = QUOTES[id];
  return (
    <figure className="mx-auto max-w-3xl px-6 py-16 text-center">
      <p className="text-lg tracking-widest text-accent" aria-label={`Rated ${q.rating} out of 5`}>
        {"★".repeat(q.rating)}
      </p>
      <blockquote className="mt-5 text-2xl font-medium leading-snug text-foreground md:text-3xl">
        &ldquo;{q.text}&rdquo;
      </blockquote>
      <figcaption className="mt-6 text-base text-muted">
        <span className="font-semibold text-foreground">{q.name}</span>, {q.business}
      </figcaption>
    </figure>
  );
}
