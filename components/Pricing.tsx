import Link from "next/link";

// The price list on the prices page: websites at a fixed one-off price, then a short menu of monthly add-ons, with
// the three that go together as a bundle. Prices are Rob's; change them here (the home page summary reads SITES).
export const SITES = [
  {
    name: "One-page site",
    price: "£100",
    body: "Everything on one page: who you are, what you do and how to get in touch, with a contact form. Works on phones and is set up to show on Google. One round of changes.",
  },
  {
    name: "Small business site",
    price: "£450",
    body: "Up to 5 pages, with a gallery and a link to your booking page or menu. Two rounds of changes.",
  },
  {
    name: "Bigger site",
    price: "£800",
    body: "Up to 10 pages, a blog and a more custom design. Two rounds of changes.",
  },
  {
    name: "Custom build",
    price: "Quoted",
    body: "Online shops, client logins and connections to the tools you already use. Priced after a free call.",
  },
];

const EXTRAS = [
  ["Extra page", "£40"],
  ["Writing the words for you", "£30 a page"],
  ["Local SEO set-up", "£150"],
  ["Domain and email set-up", "£30"],
];

const SOON = "Coming soon";
const ADDONS = [
  ["Care plan", "Hosting, updates and small edits each month", "£20"],
  ["Review replies", "Replies to your Google reviews drafted in your voice, bad ones flagged the same day", "£15"],
  ["Social posts", "Your photos and notes turned into a week of Facebook and Instagram posts", "£20"],
  ["Local SEO", "Weekly Google posts and offers, review requests, page tweaks from what people search for, and a one-page report of your calls, direction requests and searches", "£40"],
  ["FAQ chat bot", "Answers visitors' questions from your own site, and passes anything else to you", SOON],
  ["Booking assistant", "The chat bot that also books visits into your calendar", SOON],
];

export default function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-4xl scroll-mt-24 px-6 pb-24 pt-8">
      <h2 className="mb-5 text-xl font-semibold text-foreground">Websites</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {SITES.map((s) => {
          const popular = s.name === "Small business site";
          return (
            <div key={s.name} className={`rounded-2xl border bg-card p-7 ${popular ? "border-accent/70" : "border-border"}`}>
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-lg font-semibold text-foreground">
                  {s.name}
                  {popular && <span className="text-accent"> · most popular</span>}
                </h3>
                <span className="shrink-0 text-2xl font-semibold text-accent">{s.price}</span>
              </div>
              <p className="mt-3 text-base leading-relaxed text-muted">{s.body}</p>
            </div>
          );
        })}
      </div>
      <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">
        <span className="font-medium text-foreground">The site is yours, with or without a care plan.</span>{" "}Skip it and at
        launch you get all of your site&apos;s files to host wherever you like. Changes after the first 30 days are then
        quoted one at a time.
      </p>
      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
        {EXTRAS.map(([name, price]) => (
          <span key={name}>
            {name} <span className="font-medium text-foreground">{price}</span>
          </span>
        ))}
      </div>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        Local SEO set-up gets you found on Google Maps and in &ldquo;near me&rdquo; searches: your Google Business Profile done
        properly, Search Console, page titles and local business details on the site, and listings on Apple Maps, Bing,
        Yell and Facebook.
      </p>

      <h2 className="mb-2 mt-16 text-xl font-semibold text-foreground">Monthly add-ons</h2>
      <p className="mb-6 max-w-2xl text-base leading-relaxed text-muted">Optional, month to month: no contract, no set-up fee, cancel any time.</p>
      <div className="mb-6 rounded-2xl border border-accent/60 bg-card p-7">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h3 className="text-lg font-semibold text-foreground">Looked after</h3>
          <span className="text-2xl font-semibold text-accent">
            £45<span className="text-base font-medium text-muted"> a month</span>
          </span>
        </div>
        <p className="mt-3 text-base leading-relaxed text-muted">
          The care plan, review replies and social posts together, instead of £55 separately. Your site hosted and kept up
          to date, your reviews answered and a week of posts, every month, without you lifting a finger.
        </p>
      </div>
      <div className="divide-y divide-border rounded-2xl border border-border bg-card">
        {ADDONS.map(([name, body, price]) => (
          <div key={name} className="flex items-start justify-between gap-6 px-7 py-5">
            <div>
              <h3 className="font-semibold text-foreground">{name}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
            </div>
            {price === SOON ? (
              <span className="shrink-0 whitespace-nowrap rounded-full border border-border px-3 py-1 text-sm font-medium text-muted">{SOON}</span>
            ) : (
              <span className="shrink-0 whitespace-nowrap font-semibold text-accent">
                {price}
                <span className="text-sm font-medium text-muted"> /mo</span>
              </span>
            )}
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-muted">
        Lead generation is quoted, as every business needs something different.{" "}
        <Link href="/lead-generation" className="text-accent transition-colors hover:text-foreground">
          See how it works →
        </Link>
      </p>
    </section>
  );
}
