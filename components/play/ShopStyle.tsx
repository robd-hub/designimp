"use client";

import Link from "next/link";
import { usePlay } from "./store";
import { SHOP_TYPES, SHOP_COLOURS, mockupHref } from "./shop";
import x from "./extras.module.css";

// Dress the plot's new shop: what kind of business it is (which sets the window display) and the colour
// of its front. Saved in the browser along with the name; nothing is sent anywhere.
export default function ShopStyle({ lot }: { lot: string }) {
  const shop = usePlay((st) => (st.shop?.lot === lot ? st.shop : null));
  const styleShop = usePlay((st) => st.styleShop);
  const type = shop?.type ?? "shop";
  return (
    <div className={x.style}>
      <div className={x.pick} role="group" aria-label="Type of shop">
        {SHOP_TYPES.map((t) => (
          <button key={t.id} type="button" aria-pressed={type === t.id} onClick={() => styleShop(lot, { type: t.id })}>
            {t.label}
          </button>
        ))}
      </div>
      <div className={x.swatches} role="group" aria-label="Shopfront colour">
        {SHOP_COLOURS.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`Colour ${c}`}
            aria-pressed={(shop?.colour ?? SHOP_COLOURS[0]) === c}
            style={{ background: c }}
            onClick={() => styleShop(lot, { colour: c })}
          />
        ))}
      </div>
      {shop?.name.trim() && (
        <Link className={x.mockup} href={mockupHref(shop.name)}>
          Get a free mockup of your real website →
        </Link>
      )}
    </div>
  );
}
