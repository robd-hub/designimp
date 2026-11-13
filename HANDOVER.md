# Handover

Written 2026-10-31 when Rob moved this project from Claude Projects (cloud threads) to Claude Code run from Google Antigravity. Read `CLAUDE.md` first for stack, layout and rules. This file is the history and the state of play.

## What this is

Design Imp is Rob's studio for fixed-price small-business websites. The site (Next.js 16, dark with gold `#C8973A`) has case studies for Ayuri Beauty and WellSway Dance Studio, an AI website assistant demo (`/demo`) and lead generation (`/lead-generation`).

`/play` is **Imp's High Street**: a walkable Lincoln where each client is a shopfront linking to its case study, a Lincoln Imp guide walks you in, and the HQ building holds the mockup form. Empty "to let" plots invite a visitor to type their business name onto the sign, then request a free mockup. It also works as a portfolio piece that stands apart from other game-style portfolios (closest rival found: AMIX Town).

## Timeline and decisions

- 2026-10-16: concept chosen, "Imp's High Street", built as `/play` in PR #1. Play link added to the nav; merged and live 2026-10-17.
- 2026-10-17: Rob wants real Lincoln geography respected (Steep Hill up to the cathedral, Sincil Bank east of the south road).
- 2026-10-18: PR #6 (type your business onto an empty plot, Imp welcome, list fallback and no-WebGL fallback), PR #8 (Steep Hill, Brayford and Tank cards link to Visit Lincoln), PRs #11 and #12 (University of Lincoln, footpaths and walkers).
- 2026-10-20: PR #24 Front Desk (AI assistant, `/demo`) and Lead Exchange (`/lead-generation`) on the south high street, mockup post price £100; PR #25 RAF Scampton with the Red Arrows. Vercel project changed to **lanna-labs**.
- 2026-10-21: PR #26 north road and Steep Hill climb with night ghost; #27 Castle Square pedestrianised with farmers' market and cannons; #28 Stonebow as a place, castle west and cathedral east facing the square; #29 railway (passenger and tanker trains, level crossing); #30 detailed cathedral; #31 south road more than doubled.
- 2026-10-24 to 25: bus station and buses (#39), east footbridge (#40), High Street layout review (#42), Cornhill and Corn Exchange (#43), external links on landmark cards (#44, #45), Guildhall Street and Saltergate (#46), townsfolk based on Rob's family (Elizabeth, Alan, Steve; #46 to #48), synthesised sound (#49), NPC chats and speech bubbles switched off (#50), Crissy restyled (#51).
- 2026-10-26: Brayford Wharf (#52); landmarks pushed north (#53, NORTH now -164); Bailgate with 10 fronts and The Magna Carta pub (#54 to #56); Steep Hill steeper, RISE 9 to 16 (#57); some of Rob's own PR #60 parts kept and some reverted (#61, #62); Witham south arm and St Marks (#63, #64).
- 2026-10-27: Exchequer Gate and Minster Yard re-added properly (#65).
- 2026-10-31: Jew's House renamed Norman's House (#66); Lindum Hill, Broadgate and Pelham Bridge flyover (#67); University Bridge over the Witham (#68); Lindum Hill road shifted so Broadgate no longer merges with the bus station exit (#69); map widened east, `EAST` 100 to 140, Arboretum at x 120 (#70).

Decisions worth knowing:

- Never fabricate client quotes. Imp hunt reward is a badge only, no discounts.
- Outreach messages never mention the game or the To Let plots (Rob's call).
- NPC-to-NPC chat is off via `CHAT.on=false` in `Townsfolk.tsx`; player E-talk still works.
- Rob keeps the Arboretum, Ellis Mill and the Christmas market from his PR #60; the Engine Shed, Bailgate Roman markers and IBCC were removed.
- Lindum Hill has a bend at the top: an in-game compromise because the Minster Yard south houses block a straight run to Eastgate.
- Some cards deliberately have no link yet (Newport Arch, Lindum Hill, Magna Carta, St Marks was given one in #64). Only add a link when Rob supplies it.
- Made-up shop names are used on Bailgate, Lindum Hill and Steep Hill; St Marks uses plain trade signs.

## What is live

`main` includes everything through PR #70 and deploys to designimp.com automatically via Vercel project lanna-labs. In town now: High Street and Stonebow, Waterside, Brayford Wharf and Wharf East, the University and its bridge, Cornhill, Castle Square, Steep Hill, Bailgate, cathedral and Minster Yard, Exchequer Gate, castle, Lindum Hill, Broadgate, Pelham Bridge, the Arboretum, Usher Gallery, Bishop's Old Palace, railway and station, bus station, St Marks, the long south road with Sincil Bank and RAF Scampton, Front Desk and Lead Exchange, townsfolk, cars, buses, trains, a night-only ghost, weather, matchday, a December Christmas market, and sound behind a speaker button.

## Open ideas (nothing here is started or approved)

- Analytics on `/play`: which buildings visitors open, how many reach the mockup form.
- A "your business on the High Street" prospect shopfront: a personalised plot for a named prospect.
- An Arboretum walk (paths, bandstand, things to find).
- Castle walls (the castle is currently a gatehouse building).
- A stadium for Lincoln City.
- A Bonfire Night mode in the style of the December Christmas market (`season` mechanism in `places.ts`).
- Pitch the game locally in Lincoln; grow the street per client.

Ask Rob before starting any of these.

## Outreach

Not part of the repo, but part of the business.

- Lead lists live in Google Sheets: "Prospect Outreach Tracker" (tab "Outreach Tracker") and "Leads sheet" (tab "Prospects"). Rows from about 421 are Facebook-only "To review" leads; Lincoln leads were added at rows 501 to 522.
- Cadence: intro, follow-up about 5 days later, second follow-up about a week after, final about a week after that. The tracker's "Next Follow-up Date" is often stale; judge from the dates in the message columns.
- Rob's drafts and follow-up lists are in `/mnt/project-files/outreach/` in the Claude Projects workspace (files from 2026-10-22). They are not in this repo; ask Rob to export them if you need them.
- Rob's writing style: use his standard intro shape, no game references, Facebook drafts are checked by Rob before sending.

## Running and verifying locally

1. `npm install`, then `npm run dev` and open http://localhost:3000/play.
2. Set `RESEND_API_KEY` in `.env.local` only if you need the mockup form to send email; it goes to rob@designimp.com. Do not commit it.
3. Check the change by eye: day and night, street view, minimap, phone width, the list fallback. Walk the Imp to the new place using the Go-to list.
4. `npm run lint` and `npm run build`.
5. Open a PR; Rob reviews and says when to merge. Vercel deploys `main` on merge.

## Gotchas

- Everything is tuned in world units; when moving landmarks, move their `APPROACH` point, minimap entry, any NPC loops and walkers, and check `crossings()`.
- Slopes: use `groundY(z)` and `groundTilt(z)`; Pelham Bridge uses `deckY`.
- The map edges are constants in `colliders.ts`; hills, clouds and the minimap follow them.
- `streetHouses()` drops Steep Hill houses under a pub or old-house footprint.
- Sandbox users: Turbopack fails on the Google font, use `next dev --webpack` (see `CLAUDE.md`).
- The older shared-folder `CLAUDE.md` and `PLAN.md` ("Pixel Falls") describe a different prototype project, not this repo. Ignore them.
