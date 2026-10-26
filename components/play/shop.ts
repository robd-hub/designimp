// The visitor's own shop on a To Let plot: what it's called, what kind of business it is and its colour.
// Only ever kept in the browser (localStorage); nothing here is sent anywhere.

export const SHOP_TYPES = [
  { id: "shop", label: "Shop" },
  { id: "salon", label: "Salon" },
  { id: "cafe", label: "Café" },
  { id: "trades", label: "Trades" },
] as const;
export type ShopType = (typeof SHOP_TYPES)[number]["id"];

export const SHOP_COLOURS = ["#ff5a3c", "#3fa7d6", "#4cc25c", "#ffd23f", "#b36bff", "#ff7eb6", "#2b2633"] as const;

export const NAME_MAX = 40;

// Letters, numbers, spaces and a little everyday punctuation, capped in length. Leading spaces and runs
// of spaces go; a single trailing space stays so the visitor can carry on typing the next word.
export function cleanName(v: unknown) {
  if (typeof v !== "string") return "";
  return v
    .normalize("NFC")
    .replace(/[^\p{L}\p{N}\p{M} &'’.,!@+\-]/gu, "")
    .replace(/\s+/g, " ")
    .replace(/^ /, "")
    .slice(0, NAME_MAX);
}

export const cleanType = (v: unknown): ShopType | undefined => SHOP_TYPES.find((t) => t.id === v)?.id;
export const cleanColour = (v: unknown): string | undefined => SHOP_COLOURS.find((c) => c === v);

// Where the "free mockup" call to action goes, carrying the name they typed so the form starts filled in.
export function mockupHref(name: string) {
  const n = name.trim();
  return n ? `/get-started?business=${encodeURIComponent(n)}` : "/get-started";
}
