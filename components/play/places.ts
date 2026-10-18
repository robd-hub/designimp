// Every building on Imp's High Street. Adding a client = adding an entry here.

export type PlaceItem = { title: string; detail: string };

export type Place = {
  id: string;
  // defaults to shop; tank is drawn by the fountain; lots open the mockup form
  kind?: "shop" | "cathedral" | "lot" | "stadium" | "tank" | "castle" | "street" | "water";
  name: string; // shown on the building sign
  kicker: string;
  nav?: string; // label in the "Go to" list, when the kicker is too long
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  wall: number;
  roof: number;
  roofType: "pitch" | "flat";
  rot: number; // 0, PI or ±PI/2 so footprints stay axis-aligned
  image?: { src: string; alt: string };
  intro: string[];
  items?: PlaceItem[];
  link: { href: string; label: string; external?: boolean };
};

// What a plot's sign says once a visitor has typed their business name there.
export const SIGN_MAX = 22;
export function shopSign(name: string) {
  const t = name.trim();
  return t.length > SIGN_MAX ? `${t.slice(0, SIGN_MAX - 1).trimEnd()}…` : t;
}

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
    x: -14,
    z: -30,
    w: 9,
    d: 6,
    h: 5,
    wall: 0xffb627,
    roof: 0x2b59c3,
    roofType: "pitch",
    rot: Math.PI / 2,
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
  {
    id: "townhall",
    name: "Town Hall",
    kicker: "Questions",
    x: 14,
    z: -30,
    w: 10,
    d: 7,
    h: 7,
    wall: 0xe8e1d0,
    roof: 0x2f8f5b,
    roofType: "pitch",
    rot: -Math.PI / 2,
    intro: ["The answers to everything people usually ask before we start."],
    items: [
      { title: "How long does a project take?", detail: "Most sites are delivered within 4 weeks. Larger builds may take 6–8 weeks, and you'll always have a clear timeline first." },
      { title: "Who owns the website when it's done?", detail: "You do, completely. Code, design files and assets are yours, with no platform fees or lock-in." },
      { title: "How many revisions do I get?", detail: "We work in rounds of feedback and most projects are finalised within two." },
      { title: "Do you handle hosting?", detail: "Yes. We set up fast, reliable hosting and hand you full control of the account at launch." },
      { title: "How does payment work?", detail: "Fixed price: 50% to start, 50% on launch. No hourly billing." },
      { title: "What if I need changes after launch?", detail: "Small tweaks in the first 30 days are included. After that, a small retainer or a quote per update." },
    ],
    link: { href: "/get-started", label: "Ask me anything else" },
  },
  {
    id: "lot",
    kind: "lot",
    name: "Your Shop Here",
    kicker: "Vacant plot",
    nav: "Your shop here",
    x: 36,
    z: -11,
    w: 10,
    d: 8,
    h: 0,
    wall: 0xff5a3c,
    roof: 0xffd23f,
    roofType: "flat",
    rot: 0,
    intro: [
      "This plot is waiting for its first shop. Every Design Imp client gets a building on the high street, and this one could be yours.",
      "Send me your business and I'll design a free mockup of your new site before you spend a penny.",
    ],
    link: { href: "/get-started", label: "Claim this plot" },
  },
  {
    id: "tolet-east",
    kind: "lot",
    name: "To Let",
    kicker: "Shop to let",
    nav: "To let (east)",
    x: 36,
    z: 11,
    w: 10,
    d: 8,
    h: 0,
    wall: 0x1fb5a8,
    roof: 0xffd23f,
    roofType: "flat",
    rot: Math.PI,
    intro: [
      "Picture your business here. Tell me a little about it and I'll design a free mockup of your new website before you spend a penny.",
    ],
    link: { href: "/get-started", label: "Open the full form" },
  },
  {
    id: "tolet-west",
    kind: "lot",
    name: "To Let",
    kicker: "Shop to let",
    nav: "To let (west)",
    x: -36,
    z: 11,
    w: 10,
    d: 8,
    h: 0,
    wall: 0x3d8bff,
    roof: 0xffd23f,
    roofType: "flat",
    rot: Math.PI,
    intro: [
      "Picture your business here. Tell me a little about it and I'll design a free mockup of your new website before you spend a penny.",
    ],
    link: { href: "/get-started", label: "Open the full form" },
  },
  {
    id: "cathedral",
    kind: "cathedral",
    name: "Lincoln Cathedral",
    kicker: "Where the name comes from",
    nav: "Cathedral",
    x: 0,
    z: -62,
    w: 14,
    d: 30,
    h: 10,
    wall: 0xd9cbb0,
    roof: 0x5b6b7a,
    roofType: "pitch",
    rot: 0,
    image: { src: "/Lincoln Cathedral monochrome.png", alt: "Lincoln Cathedral" },
    intro: [
      "Design Imp is named after the Lincoln Imp, a little stone carving high up inside Lincoln Cathedral, in the city I'm from.",
      "Legend says a pair of imps were blown into the cathedral and started causing mischief, until an angel turned one of them to stone. He's been sitting there for over 700 years.",
      "Look closely above the door. He's up there.",
    ],
    link: { href: "https://lincolncathedral.com/", label: "Visit lincolncathedral.com", external: true },
  },
  {
    id: "sincil-bank",
    kind: "stadium",
    name: "Sincil Bank",
    kicker: "Home of the Imps",
    nav: "Sincil Bank",
    x: 44,
    z: 42,
    w: 34,
    d: 24,
    h: 5,
    wall: 0xe03a3e,
    roof: 0xffffff,
    roofType: "flat",
    rot: -Math.PI / 2,
    intro: [
      "Lincoln City have played at Sincil Bank since 1895, and their nickname is the Imps, after the same little carving in the cathedral.",
      "It's the other place in Lincoln where you'll find a lot of imps in one spot, and they're League 1 Champions for 2025/26.",
      "Come by on a Saturday and it's matchday, with a full crowd.",
    ],
    link: { href: "https://www.weareimps.com/", label: "Visit weareimps.com", external: true },
  },
  {
    id: "tank",
    kind: "tank",
    name: "Lincoln Tank Memorial",
    kicker: "Birthplace of the tank",
    nav: "Tank",
    x: 0,
    z: 0,
    w: 6.4,
    d: 6.4,
    h: 0,
    wall: 0x7a6a45,
    roof: 0x564a32,
    roofType: "flat",
    rot: 0,
    intro: [
      "The tank was invented here in Lincoln in 1915, by engineers at William Foster & Co. working with William Tritton.",
      "The real memorial stands on the roundabout at the start of Tritton Road, named after him, and shows the shape of those first tanks.",
    ],
    link: {
      href: "https://www.visitlincoln.com/listing/lincoln-tank-memorial/96660101/",
      label: "See it on Visit Lincoln",
      external: true,
    },
  },
  {
    id: "castle",
    kind: "castle",
    name: "Lincoln Castle",
    kicker: "Next door to the cathedral",
    nav: "Castle",
    x: -24,
    z: -62,
    w: 22,
    d: 18,
    h: 7,
    wall: 0xb8a98a,
    roof: 0x8a7b5e,
    roofType: "flat",
    rot: 0,
    intro: [
      "William the Conqueror started building Lincoln Castle in 1068, right next to where the cathedral now stands.",
      "Today it's home to an original 1215 Magna Carta, and you can walk right round the medieval walls.",
    ],
    link: { href: "https://www.lincolncastle.com/", label: "Visit lincolncastle.com", external: true },
  },
  {
    id: "steep-hill",
    kind: "street",
    name: "Steep Hill",
    kicker: "Lincoln's famous street",
    nav: "Steep Hill",
    x: 0,
    z: -24.5,
    w: 15.8,
    d: 35,
    h: 0,
    wall: 0xe8a33d,
    roof: 0x8a3b2e,
    roofType: "pitch",
    rot: 0,
    intro: [
      "Steep Hill climbs from the city centre up to the cathedral and castle (keep walking north to reach them), lined with independent shops, cafés and some of the oldest houses in England.",
      "It's often called one of Britain's best streets, and it's every bit as steep as it sounds.",
    ],
    items: [
      { title: "Small businesses, big character", detail: "Exactly the kind of shops that deserve a website as good as their shopfront." },
    ],
    link: {
      href: "https://www.visitlincoln.com/listing/steep-hill/97229101/",
      label: "See it on Visit Lincoln",
      external: true,
    },
  },
  {
    id: "brayford",
    kind: "water",
    name: "Brayford Waterfront",
    kicker: "Down by the water",
    nav: "Brayford",
    x: -46,
    z: -30,
    w: 32,
    d: 22,
    h: 0,
    wall: 0x4fc3ff,
    roof: 0xffffff,
    roofType: "flat",
    rot: 0,
    intro: [
      "Brayford Pool is where the River Witham meets the Fossdyke, a canal thought to date back to the Romans and still in use today.",
      "These days it's a marina lined with bars and restaurants, with the University of Lincoln's campus on the waterfront and plenty of swans.",
    ],
    link: {
      href: "https://www.visitlincoln.com/explore/areas-of-lincoln/brayford-waterfront/",
      label: "See it on Visit Lincoln",
      external: true,
    },
  },
];

// Axis-aligned footprint, accounting for buildings turned to face a side road.
export function footprint(p: Place) {
  const side = Math.abs(Math.sin(p.rot)) > 0.5;
  const hw = (side ? p.d : p.w) / 2,
    hd = (side ? p.w : p.d) / 2;
  return { x0: p.x - hw, x1: p.x + hw, z0: p.z - hd, z1: p.z + hd };
}

export const hex = (c: number) => "#" + c.toString(16).padStart(6, "0");
