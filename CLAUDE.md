@AGENTS.md

# Design Imp (designimp.com)

Rob's one-person studio site: fixed-price websites for small businesses (case studies: Ayuri Beauty, WellSway Dance Studio), an AI website assistant demo (`/demo`), lead generation (`/lead-generation`), and **Imp's High Street** (`/play`), a walkable 3D version of Lincoln where each client, service or landmark is a building. See `HANDOVER.md` for history, what is live and open ideas.

Brand: dark with gold `#C8973A`. Owner: Rob (GitHub `robd-hub`).

## Stack

- Next.js 16 (App Router) and React 19. **This is a newer Next.js than your training data**: read the relevant guide in `node_modules/next/dist/docs/` before changing routing, config or APIs (see `AGENTS.md`).
- Tailwind CSS 4 (`@tailwindcss/postcss`), framer-motion, clsx, tailwind-merge.
- `/play` is three.js through `@react-three/fiber` and `@react-three/drei`, with zustand for game state. Everything is built from primitives, with no model or audio files.
- Resend for the mockup-request email (`app/api/lead/route.ts`, env `RESEND_API_KEY`, sends to rob@designimp.com). The chat demos use the n8n chat widget (`components/N8nChat.tsx`).
- Deployed on Vercel.

## Commands

```
npm install
npm run dev      # next dev, http://localhost:3000 ; the game is at /play
npm run build
npm run lint
```

- No test suite. Verify by running the app and looking (see "Verifying changes").
- In the cloud sandbox Turbopack fails on the Google font download, so use `NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt npx next dev --webpack`. On a normal machine plain `npm run dev` is fine.
- Dev-only URL switches on `/play`: `?place=<id>` opens a card, `?weather=<sky>`, `?matchday=1`, `?season=xmas` (or `off`). The Christmas market is only in town in December otherwise.

## Repo layout

```
app/                      # routes: page.tsx (home), about, services, get-started, work/*, demo,
                          # lead-generation, privacy, terms, play, api/lead
components/*.tsx          # marketing site sections
components/play/          # the whole game (below)
public/                   # images, logos, client assets
docs/screenshots/         # kept verification screenshots
```

### components/play (the game)

- `PlayClient.tsx` loads `Town` dynamically (client only) with a WebGL check, an error guard and the plain `StreetList` fallback. The site must stay usable without WebGL.
- `places.ts`: every building (`PLACES`), as data: kind, position, size, colours, card text, optional link. **Adding a client or landmark starts here.** `kind` picks the drawing code; `season: "xmas"` hides it outside December.
- `colliders.ts`: the town's geometry and walking rules: map edges (`BOUND`, `EAST`, `NORTH`, `SOUTH`), paved areas, `SHOPFRONTS`, `FOOTPATHS`, `CLOSE` (Castle Square), `CORNHILL`, `WITHAM`/`RIVER` bridges, `LINDUM`, `PELHAM`, `STONEBOW_STREETS`, the `APPROACH` points the Imp walks to for each place, and `crossings()` which routes walks across rivers, rails and gates.
- `terrain.tsx`: ground height. `groundY(z)` depends on z only (Steep Hill `RISE` 16 units, `BAIL_RISE` 1.4), `deckY` lifts the Imp over Pelham Bridge. Anything standing on a slope must use these.
- `store.ts`: zustand store (open card, nearby place or NPC, night, street view, `walkTo` routing). `npcs.ts`: townsfolk (Elizabeth, Alan, Steve, Maya, Frank, Christine/Crissy and others). `Townsfolk.tsx` draws and moves them (`CHAT.on=false` keeps NPC-to-NPC chat switched off).
- Scene files: `Town.tsx` (canvas, roads, shopfronts), `Landmarks.tsx` and `MoreLandmarks.tsx` (cathedral, castle, Stonebow and the rest), `Bailgate.tsx`, `MinsterYard.tsx`, `LindumHill.tsx`, `StMarks.tsx`, `Wharf.tsx`, `Waterside.tsx`, `Witham.tsx`, `Railway.tsx`, `Station.tsx`, `BusStation.tsx`, `CornExchange.tsx`, `Cars.tsx`, `Taxi.tsx`, `Matchday.tsx`, `Weather.tsx`, `Ghost.tsx` (night only), `Hunt.tsx` (imp hunt), `Imp.tsx` (the player).
- UI: `Hud.tsx` (cards, Go-to list, buttons), `Minimap.tsx`, `Joystick.tsx`, `PlayLeadForm.tsx` and `shop.ts` (the visitor types their business name onto an empty plot's sign, then the mockup form).
- Sound: `sound.ts` (synthesised Web Audio, off by default, saved in localStorage `imp-sound`) and `Soundscape.tsx`.
- `toon.tsx`: shared toon materials. Reuse them and the existing geometry helpers; do not create materials or geometries inside render loops.

## Conventions

- Data first: describe a building in `places.ts` and reuse an existing `kind` before writing new scene code. New geometry gets its own file in `components/play/` and is mounted from `Town.tsx`.
- Axis-aligned footprints: `rot` is 0, PI or ±PI/2. Keep `colliders.ts` and the drawing in step, and add an `APPROACH` entry so click-to-walk and the Go-to list reach the new place.
- The map is deterministic (`seeded()` random), so the town looks the same on every visit.
- New landmarks also need a minimap entry (`Minimap.tsx`) and, where it has a card, either an external link Rob supplied or none. Do not invent links.
- Keep a mobile path working: touch controls, pinch zoom, street view.
- TypeScript strict, Tailwind classes inline on the marketing pages, CSS module (`play.module.css`) for the game UI. Keep code plain; do not over-abstract.
- Commit in small steps with clear messages; one PR per ask.

## Standing rules (from Rob)

- **Never fabricate client quotes, testimonials, stats or reviews.** Shop names on made-up streets must be plainly fictional.
- **Imp hunt reward is a badge only.** No discounts or offers.
- **Never mention the game in outreach** messages to prospects (Rob's call).
- **Respect real Lincoln geography**: Steep Hill climbs from the Stonebow to the cathedral and castle; castle west, cathedral east, both facing Castle Square; Sincil Bank east of the south road, RAF Scampton west; the Witham and the railway cut across the town; Brayford and the University west. When unsure, ask Rob rather than guessing, and say where the game compromises with the real layout.
- **Merge and deploy only with Rob's explicit OK** in the thread. Open the PR, say what changed, wait.
- Vercel: designimp.com and lannalabs.com are on the project **lanna-labs** (team designimp-projects), which auto-deploys production from `main` on merge. No manual deploy; after a merge just check the production deployment for the merge commit is READY. (The old project "lannlabs-website" no longer exists.)
- **designimp.com, visitlincoln.com and Facebook are blocked from the cloud sandbox.** Work from the repo. Use links Rob supplies verbatim (strip UTM tags) without trying to read them.
- Do not put secrets in the repo, in docs or in commit messages.
- PR bodies from Claude sessions carry Rob's attribution block at the top (the project's session context supplies it).

## Verifying changes

1. Run the dev server and open `/play`. Check day and night (the night button), street view, the minimap, a phone-width viewport and the "Prefer a list?" fallback.
2. Take screenshots with the pre-installed Playwright/Chromium (or `puppeteer`, already a devDependency) and look at them. For WebGL in headless Chromium use `--use-gl=swiftshader` style flags if the canvas is blank. Check the changed area from the default map camera and from street view, and walk the Imp there (`?place=<id>` or the Go-to list) to prove the route works.
3. Run `npm run lint` and `npm run build` before opening a PR.
4. Put kept screenshots under `docs/screenshots/` only when they are worth keeping.

## Marketing pages from a reference image

When Rob supplies a screenshot to recreate: write Tailwind (the site already uses it), use the supplied classes and colours verbatim, screenshot the result, compare spacing, type, colour, radii and alignment, fix and repeat at least two rounds until within about 2 to 3px. Do not add content or "improve" the design. Use `https://placehold.co/` for missing images.
