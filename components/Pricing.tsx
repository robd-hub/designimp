// The price menu on the services page: websites at a fixed one-off price, then monthly add-ons to pick and mix,
// with the three most popular as a bundle. Prices are Rob's; change them here.
const SITES = [
  {
    name: "One-page site",
    price: "£100",
    body: "Everything on one page: who you are, what you do and how to get in touch, with a contact form. Works on phones and is set up to show on Google. One round of changes.",
  },
  {
    name: "Small business site",
    price: "£300",
    body: "Up to 5 pages, with a gallery and a link to your booking page or menu. Two rounds of changes.",
  },
  {
    name: "Bigger site",
    price: "£600",
    body: "Up to 10 pages, a blog and a more custom design.",
  },
  {
    name: "Custom build",
    price: "Quoted",
    body: "Online shops, client logins and connections to the tools you already use. Priced after a free call.",
  },
];

const EXTRAS = [
  ["Extra page", "£40"],
  ["Writing the words for you", "£50 a page"],
  ["Google Business Profile set-up", "£50"],
  ["Domain and email set-up", "£30"],
];

const ADDONS = [
  ["Care plan", "Hosting, updates and small edits each month", "£20"],
  ["Review replies", "Replies to your Google reviews drafted in your voice, bad ones flagged the same day", "£15"],
  ["Enquiry replies", "A quick first reply drafted for every contact form or email enquiry", "£15"],
  ["FAQ chat bot", "Answers visitors' questions from your own site, and passes anything else to you", "£20"],
  ["Booking assistant", "The chat bot that also books visits into your calendar", "£35"],
  ["Social posts", "Your photos and notes turned into a week of Facebook and Instagram posts", "£20"],
  ["Blog post", "One short article a month to help you show up on Google", "£25"],
  ["Google profile updates", "Weekly posts, offers and holiday-hours reminders on your Google listing", "£10"],
  ["Monthly report", "Reviews, rating trend, top questions and site visits on one page. Free with any two add-ons", "£10"],
];

export default function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-4xl scroll-mt-24 px-6 py-24">
      <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-accent">Prices</p>
      <h2 className="mb-4 text-3xl font-semibold text-foreground md:text-4xl">Pick what you need.</h2>
      <p className="mb-12 max-w-2xl text-base leading-loose text-muted">
        A website at a fixed price, then add whatever extras suit you. Monthly add-ons roll month to month: no contract, no
        set-up fee, cancel any time.
      </p>

      <h3 className="mb-5 text-xl font-semibold text-foreground">Websites</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {SITES.map((s) => (
          <div key={s.name} className="rounded-2xl border border-border bg-card p-7">
            <div className="flex items-baseline justify-between gap-4">
              <h4 className="text-lg font-semibold text-foreground">{s.name}</h4>
              <span className="shrink-0 text-2xl font-semibold text-accent">{s.price}</span>
            </div>
            <p className="mt-3 text-base leading-relaxed text-muted">{s.body}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">
        <span className="font-medium text-foreground">The site is yours, with or without a care plan.</span> Skip it and at
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

      <h3 className="mb-5 mt-16 text-xl font-semibold text-foreground">Monthly add-ons</h3>
      <div className="mb-6 rounded-2xl border border-accent/60 bg-card p-7">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h4 className="text-lg font-semibold text-foreground">The time-saver bundle</h4>
          <span className="text-2xl font-semibold text-accent">
            £39<span className="text-base font-medium text-muted"> a month</span>
          </span>
        </div>
        <p className="mt-3 text-base leading-relaxed text-muted">
          Review replies, enquiry replies and the FAQ chat bot together, instead of £50 separately.
        </p>
      </div>
      <div className="divide-y divide-border rounded-2xl border border-border bg-card">
        {ADDONS.map(([name, body, price]) => (
          <div key={name} className="flex items-start justify-between gap-6 px-7 py-5">
            <div>
              <h4 className="font-semibold text-foreground">{name}</h4>
              <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
            </div>
            <span className="shrink-0 whitespace-nowrap font-semibold text-accent">
              {price}
              <span className="text-sm font-medium text-muted"> /mo</span>
            </span>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-muted">
        Lead generation and workflow automation are quoted, as every business needs something different.
      </p>
    </section>
  );
}
