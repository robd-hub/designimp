// Every building on Imp's High Street. Adding a client = adding an entry here.

export type PlaceItem = { title: string; detail: string };

export type Place = {
  id: string;
  name: string; // shown on the building sign
  kicker: string;
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  wall: number;
  roof: number;
  roofType: "pitch" | "flat";
  rot: number;
  image?: { src: string; alt: string };
  intro: string[];
  items?: PlaceItem[];
  link: { href: string; label: string; external?: boolean };
};

export const PLACES: Place[] = [
  {
    id: "ayuri",
    name: "Ayuri Beauty",
    kicker: "Case study · Manila",
    x: -14,
    z: -10,
    w: 9,
    d: 7,
    h: 6,
    wall: 0xff6fa8,
    roof: 0xfff1d6,
    roofType: "pitch",
    rot: 0,
    image: { src: "/work/ayuri-beauty.jpg", alt: "Ayuri Beauty salon website" },
    intro: [
      "A great salon that nobody could find. No website, no online booking and little visibility on Google, so new customers were hard to come by.",
      "Within three months of launch the salon was running at full capacity most days, and the owner is now planning a second salon.",
    ],
    items: [
      { title: "Custom website with direct booking", detail: "Customers reserve appointments instantly, no phone call needed." },
      { title: "Google Maps optimisation", detail: "A built-out Business Profile that surfaces the salon in local search." },
      { title: "High-quality social presence", detail: "Consistent content that built trust and brought people through the door." },
    ],
    link: { href: "/work/ayuri-beauty", label: "Read the case study" },
  },
  {
    id: "wellsway",
    name: "WellSway Dance",
    kicker: "Case study · Lincoln",
    x: 14,
    z: -10,
    w: 10,
    d: 6,
    h: 4.5,
    wall: 0x9b6bff,
    roof: 0xffd23f,
    roofType: "flat",
    rot: 0,
    image: { src: "/work/wellswaydance.jpg", alt: "WellSway Dance Studio website" },
    intro: [
      "Justyna Wells teaches ballroom, Latin and Salsa Fit classes in Lincoln, for adults and children. She had no website, so new students had nowhere to find her classes, prices or how to join.",
    ],
    items: [
      { title: "A website built around her", detail: "Classes, prices and how to get started, with a clear way to get in touch." },
      { title: "Search visibility", detail: "SEO from the start so people searching for dance classes in Lincoln find the studio." },
      { title: "Branding that fits", detail: "A look shaped by her own taste, so the studio feels like hers." },
    ],
    link: { href: "/work/wellsway", label: "Read the case study" },
  },
  {
    id: "workshop",
    name: "The Workshop",
    kicker: "Services",
    x: -14,
    z: 10,
    w: 8,
    d: 7,
    h: 5,
    wall: 0x3d8bff,
    roof: 0x1a1320,
    roofType: "flat",
    rot: Math.PI,
    intro: ["Where the websites get made. Every one is built by hand, from scratch."],
    items: [
      { title: "Custom design, no templates", detail: "Built to fit your business, not adapted from someone else's theme." },
      { title: "Fixed price, no surprises", detail: "Clear scope, timeline and price upfront. No hourly billing." },
      { title: "Fast, modern, and yours", detail: "Loads in under 2 seconds, works on any device, and you own it outright." },
      { title: "One point of contact", detail: "You work directly with the person building your site, start to finish." },
    ],
    link: { href: "/services", label: "See all services" },
  },
  {
    id: "hq",
    name: "Design Imp HQ",
    kicker: "About",
    x: 14,
    z: 10,
    w: 7,
    d: 7,
    h: 11,
    wall: 0x1fb5a8,
    roof: 0xc8973a,
    roofType: "flat",
    rot: Math.PI,
    image: { src: "/Rob Bio pic.jpeg", alt: "Rob Doughty, founder of Design Imp" },
    intro: [
      "I'm Rob. I started Design Imp after noticing the same problem everywhere: small businesses doing brilliant work, held back by a website that didn't do them justice.",
      "The name is a nod to the Lincoln Imp, a medieval stone carving in Lincoln Cathedral and a symbol of the city I'm from. He's the one walking you around town.",
    ],
    link: { href: "/about", label: "More about me" },
  },
  {
    id: "post",
    name: "Mockup Post",
    kicker: "Free mockup",
    x: 0,
    z: -23,
    w: 9,
    d: 6,
    h: 5,
    wall: 0xffb627,
    roof: 0x2b59c3,
    roofType: "pitch",
    rot: 0,
    intro: [
      "Send over your business and I'll design a free mockup of your new site using your own photos and pricing. No obligation.",
    ],
    items: [
      { title: "1. Free mockup", detail: "Your business, your photos, a new design." },
      { title: "2. Refine it together", detail: "Like what you see? We tweak it until it's right." },
      { title: "3. Go live", detail: "We build it and launch it. From as little as £250." },
    ],
    link: { href: "/get-started", label: "Get your free mockup" },
  },
];

export const hex = (c: number) => "#" + c.toString(16).padStart(6, "0");
