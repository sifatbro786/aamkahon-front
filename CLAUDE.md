# Aamkahon frontend — working context

Next.js 16.4.5 App Router (JS), Cache Components + Partial Prefetching + React
Compiler, Tailwind v4. Storefront now, admin at /admin in Phase 5 (port of the
Footpath Vite admin, grey dashboard style). Backend: sibling repo
`amkahon-back` (read its CLAUDE.md: envelopes, pricing rules, new endpoints).
Project status and next steps: `HANDOVER.md`. Read
`node_modules/next/dist/docs/` before using a Next API (AGENTS.md).

## Run

```bash
npm install
npm run dev            # needs amkahon-back on :5030 when DATA_MODE=api
npm run build && npm start
npx eslint app components context lib   # 0 errors expected
```

Env: see `.env.example`. `NEXT_PUBLIC_DATA_MODE=static` builds the Vercel demo
with no backend at all.

## Data flow

- Server components read through `lib/data/catalog.js` ("use cache",
  cacheLife minutes, tag "catalog"). Envelopes are unwrapped there, not in JSX.
  A failed fetch returns an empty value (storefront and `next build` survive a
  backend restart).
- Client components use axios `lib/api/client.js` + `lib/api/*Api.js`
  (Bearer token from localStorage `aamkahon.token`; backend ignores cookies).
- Static mode: `lib/demo/emulator.js` answers both paths from
  `data/demo/*.json`. Writes return 403 "demo". Demo admin login:
  demo@aamkahon.com / demo1234 (DEMO_ADMIN in lib/config.js).
- Fixtures are GENERATED: `cd ../amkahon-back && npm run fixtures`. Never hand
  edit data/demo. They share deterministic ids with `npm run seed`.

## Rules carried from Footpath (do not "simplify")

- Money is decided server side. Cards/bag show display prices; checkout shows
  POST /api/checkout/calculate. `lib/store/cartLine.js lineUnitPrice` mirrors
  the wholesale tier for DISPLAY only.
- Variant identity = options array (`lib/store/variants.js`, keep in sync
  with backend services/lineItemPricing.js findVariantByOptions).
- Dual-mode cart (`context/CartContext.js`): guest localStorage
  `aamkahon.cart.v1` vs server cart; merge on login. Static build is always guest.
  Pre-booking and in-season items cannot share a bag (backend refuses mixed carts).
- Guest order token (`lib/store/orderAccess.js`): store before gateway redirect.
- URL query string is the source of truth for catalogue filters.
- Only server HTML rendered: A+ content, through DOMPurify.

## Cache Components gotchas

- No `new Date()` / `Math.random()` in server components outside "use cache"
  (breaks prerender). Footer year is a constant in lib/site.js.
- Reading searchParams/cookies makes a subtree dynamic: wrap it in <Suspense>.
- Do not setState synchronously in effects (react-hooks lint); defer a tick.

## Design system (storefront)

Tokens in `app/globals.css` @theme, from the logo: ink (logo black), paper
(cream), mango / mango-deep, leaf / leaf-deep, gur (winter range). Use the
-deep variants for small text on paper (contrast). Fonts self-hosted from
npm: Google Sans Variable (Latin + Bengali) for everything, Tiro Bangla only
for Bangla accents (`font-bangla`, always with lang="bn").
House style: no dashes in UI copy, no glassmorphism, no gradient text, no
count-up stats, no tape/sticker decoration. Real photos and the client's own
vertical videos, ledger-style tables and rules. `.wrap` = page gutter.
Horizontal scrollers scroll inside their own box (`-mx-4 px-4 scroll-px-4`),
the page never scrolls sideways (checked at 390 px and 1440 px).

## Media

`public/images` (client photos, renamed), `logo-lockup.png` (horizontal,
transparent) and `logo-mark.png` (stacked). `public/videos` are web encodes;
originals + encode commands live in `media-originals/` (gitignored).
