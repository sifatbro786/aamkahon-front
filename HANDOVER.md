# Aamkahon (আমকাহন) — Handover / Backup

Read this first in any new chat. Update it at the end of every phase.

## Client
- Aamkahon Agro, Rajshahi. "The story of mangoes". FB: facebook.com/AAMKAHON (Meta verified, since 2021)
- Phone / WhatsApp: 01301-377225. Producing, marketing, exporting agricultural products.
- Wholesale + retail e-commerce: mango (seasonal) and khejurer gur (date palm jaggery, winter).
- Logo: orange mango outline + lime leaves on black, Bangla wordmark. File: public/images/logo.jpg

## Repos (on Sifat's PC)
- Base (reference, do not edit): E:\Works\foothpath\footpath-backend, footpath-frontend (read both CLAUDE.md)
- amkahon-back  : Express 5 + MongoDB, copied from footpath-backend. PORT 5030.
- amkahon-front : Next.js 16.4.5 (App Router, cacheComponents, React Compiler, Tailwind v4).
                  Read node_modules/next/dist/docs before writing Next code (AGENTS.md says APIs differ).

## Decisions so far
- Backend + admin pattern = Footpath. Only storefront design is new. Admin may change colors only.
- Font: Google Sans (Latin). Bengali glyphs need a Bangla fallback font (Google Sans has none).
- Data modes: NEXT_PUBLIC_DATA_MODE=static (Vercel demo, reads bundled JSON fixtures, admin is
  read only with a demo login) | api (dev + Hostinger VPS, live backend, admin can edit).
  Fixtures are exported from the SAME seed data file so seed and demo never drift.
- Owner account: solaimanislamsifat@gmail.com / 11111111, seeded as role `admin`.
  Sifat: no super_admin role needed, admin = max power (admin and executive pass the same gates).
- Do not read SMTP_PASS. Deploy (VPS) is done by Sifat with Gemini.
- No AI-slop UI: no tape/sticker clichés, no dashes in UI copy, no glassmorphism, no count-up stats.
  Zero horizontal overflow on mobile and desktop.

## Env notes (amkahon-back/.env)
- Sifat named them MONGODB_URI and MAIL_FROM on purpose. Code reads these first, base names as fallback. Done in Phase 1.
- SSLCommerz values are placeholders.

## Assets
- public/images: 19 FB photos + logo.jpg. public/videos: hero-bg-video.mp4 (4.4 MB) + 3 more
  (95 MB, 45 MB, 4 MB). The two big ones must be compressed before git/Vercel (GitHub hard limit 100 MB).
- ffmpeg is available on the device shell.

## New business features (vs Footpath)
1. Retail vs wholesale price per product.
2. Pre-booking for not-yet-available stock (season starts later).
3. Price visibility per product: show | inquiry | TBA, with an inquiry flow.

## Phase plan
1. Backend copy + rebrand + base fixes (env reconcile, super_admin, category subtree, CORS gate, deps)
2. Backend wholesale features (pricing tiers, pre-booking, price visibility + inquiries, shipping) + seed + fixture export
3. Next.js foundation: design tokens, fonts, layout, data layer (static/api), cart/auth logic port, homepage
4. Storefront pages: shop, product, cart, checkout, payment result, tracking, auth, account, wholesale/inquiry, about, contact, SEO
5. Admin dashboard (new fields, inquiries, pre-bookings) + demo read-only mode + responsive QA + build + deploy notes

## Answers (2026-11-09)
1. Admin lives INSIDE amkahon-front at /admin (Next.js port of the Footpath admin, grey style, brand colour only).
2. Wholesale = quantity tier: qty >= product.wholesale.minQty -> wholesale unit price, automatically. Admin sets MOQ + price per product/variant.
3. Pre-booking = admin sets advance % per product (default 25), paid via SSLCommerz, rest on delivery.
4. Inquiry/TBA = form saved to DB + admin inbox + email to MAIL_TO + WhatsApp button (8801301377225).
5. Shipping = by weight: base charge covers baseWeightKg, then perKgCharge per extra kg (ceil). Admin sets all numbers per zone.
6. UI English, Bangla in product names/story (e.g. "হিমসাগর · Himsagar"). Bangla font fallback needed.
7. Compress the two big videos for web; originals stay out of git.

## Status
- [x] Phase 1  backend copy + rebrand + base fixes (2026-11-09)
- [x] Phase 2  wholesale, pre-booking, hidden price, inquiries, weight shipping, seed (2026-11-09)
- [x] Phase 3  Next.js foundation, data layer, logic port, homepage (2026-11-09)
- [x] Phase 3 fixes (FB icon, hero video autoplay + sound, story colour, STR credit, intro loader, 404/error/privacy/terms)
- [x] Phase 4  storefront pages (2026-11-09)
- [x] Phase 5  admin, static demo admin, deploy docs (2026-11-09)

### Phase 1 done
- amkahon-back = footpath-backend copy (no .git/.env/tests/audit). Stationery seeds removed (seedStorefront.js still
  has Elmate content: Phase 2 rewrites it).
- dotenv load order fix, env names, SMTP secure/TLS, brand colour in emails, category subtree filter
  (utils/categoryTree.js), unused deps removed, npm start = node, Product.currency BDT, PORT 5030,
  .env.example, CLAUDE.md (lists base candidates).
- Verified: node --check on every file; server boots on 5030. DB could not be reached from Claude's sandbox
  (SRV DNS blocked there), not a code issue. Sifat must confirm `npm run dev` connects on his PC.
- CORS origin-less gate intentionally NOT added (would break SSLCommerz IPN). Reason in server.js + CLAUDE.md.
- Deploy note: run ONE instance (pm2 fork mode). Campaign cron has no lock.

### Phase 2 done (details + API contracts in amkahon-back/CLAUDE.md, section "Aamkahon business features")
- services/lineItemPricing.js = the only line pricer (wholesale tier, visibility, availability, min qty, stock, weight).
  CRITICAL fix: base trusted guestItems[].price in createOrder and checkout preview. Now DB-only.
- Weight shipping: ShippingRate.baseWeightKg + perKgCharge (admin create/update accept them).
- Pre-booking: orderType pre_order, advance via SSLCommerz, status "Pre-booked" (no stock change until admin Confirms).
- maskHiddenPrices middleware on /api/products/* and wishlist.
- Inquiry model + POST /api/inquiries + /api/admin/inquiries (list/patch/delete) + email to MAIL_TO.
- Checkout calculate rewritten on top of computeOrderTotals (no duplicated maths); response adds lines[], advance, weight.
- Seed: seed/data.js (single content source), seed/ids.js (deterministic ids), scripts/seed.js (idempotent, --reset).
  12 products: 8 mango (all 2027 pre-booking, dates from Aamkahon's mango calendar; Gourmoti = TBA,
  Export Khirsapat = inquiry, min 500 kg), 3 gur (in stock, winter), 1 ghee. Categories Mango > Rajshahi/Chapai,
  Gur > Patali/Liquid, Pantry. 2 homepage sections, hero video + 2 slides, navbar, 4 weight-based shipping rates.
- public/images renamed to meaningful names (duplicate calendar removed). Only local photos used, no Unsplash needed.
- Verified: pricing unit assertions pass, all files pass node --check, server boots. DB untestable from Claude's sandbox.

### Phase 3 done (read amkahon-front/CLAUDE.md for the frontend rules)
- Fonts self-hosted via npm (@fontsource-variable/google-sans incl. Bengali, @fontsource/tiro-bangla for Bangla
  accents). next/font/google avoided on purpose: builds must not need Google Fonts network access.
- Tokens from the logo in app/globals.css @theme. Transparent logo assets: logo-lockup.png, logo-mark.png, icon-256.png.
- Data layer: lib/data/catalog.js (server, "use cache" 1 min) + lib/api/* (axios, Bearer token) + lib/demo/emulator.js
  (static mode for both, writes refused, demo admin demo@aamkahon.com / demo1234).
- amkahon-back: scripts/buildFixtures.js (`npm run fixtures`) -> amkahon-front/data/demo/*.json from seed/data.js.
  Backend additions: GET /api/products accepts availability= and wholesale=true; GET /api/hero adds `items` (full objects).
- Ported: AuthContext, CartContext (dual mode + wholesale display tier + no mixed pre-order bag), variants.js,
  orderAccess.js (key aamkahon.orderToken.), cartLine.js, productView.js.
- Homepage: Hero (vertical drone video in a tall frame), SeasonBoard, ProductShelf x2 (API sections), HarvestCalendar
  (from pre-order products), WholesaleBand (real tier numbers), OrchardReels (3 client videos), DeliveryBlock
  (live weight rates), StoryBlock (FB bio quote). Header (sticky, mobile menu) + footer.
- Videos: public/videos = hero-loop.mp4 (1 MB), harvest-pile (2 MB), langra-harvest (13 MB), gur-making (60 s, 10 MB)
  + posters. Originals in media-originals/ (gitignored). public/videos/hero-bg-video.mp4 is now unused (delete it).
- Verified: eslint 0 errors, `next build` OK (static), screenshots at 390 px and 1440 px, no horizontal overflow.
- Known gaps for Phase 4: bag button opens nothing yet (CartDrawer), linked pages (/shop, /product, /wholesale,
  /story, /delivery, /track-order, /login, /account) not built yet.

### Phase 3 fixes (after Sifat's review)
- Footer: Facebook + WhatsApp icons (components/ui/BrandIcons.js), privacy/terms links, "Developed by STR Solutions LTD" (strsltd.com).
- Hero video: React does not render `muted` into SSR HTML, so autoplay was blocked. components/home/HeroVideo.js mutes via
  ref + play(), adds a Sound on/off toggle, falls back to /videos/hero-loop.mp4 if the DB points at a missing file.
  hero-loop.mp4 re-encoded WITH audio (20 s). DB seeded in Phase 2 still has /videos/hero-bg-video.mp4: run
  `npm run seed -- --reset` in amkahon-back (or edit Hero in admin) to point it at /videos/hero-loop.mp4.
- Story section now bg-forest (new token) so it no longer merges with the ink footer.
- Intro loader (components/home/IntroLoader.js): homepage, once per browser session, 3.2 s min / 5 s max, waits for
  window load; inline script + html[data-intro-seen] CSS prevents a flash on repeat visits.
- Pages: app/not-found.js (root, with header/footer), (store)/not-found.js, (store)/error.js, app/global-error.js,
  /privacy, /terms (components/ui/LegalPage.js, content as data).

### Phase 4 done
Routes: /shop (URL filters: q, category incl. children, availability, wholesale=1, sort, page; Suspense + PPR),
/product/[slug] (gallery, variant axes, wholesale ladder, pre-book terms, MOQ, WhatsApp, inquiry form for inquiry/TBA,
A+ via DOMPurify client-only, related, JSON-LD; generateStaticParams with placeholder fallback), CartDrawer + /cart,
/checkout (port of Footpath flow; pre-order bag = advance only; summary from /checkout/calculate; guest token saved
before redirect; static mode disables ordering), /order/success|fail|cancel, /track-order, /login /register
/verify-email /forgot-password /reset-password, /account (orders + pre-bookings), /wholesale (live wholesale price list
+ quote form), /story, /delivery (live rates + worked example), /contact, sitemap.xml, robots.txt (static demo = noindex).
Backend: trackOrder response adds orderType, preOrder, codOnlinePaymentAmount, totalWeightKg.
QA: eslint 0, next build OK, 21 pages x 390/1440 px no horizontal overflow, no console errors; bag/pre-book flow
clicked through (mixed bag notice works). Real payment untested: needs Sifat's SSLCommerz sandbox credentials + DB.

### Phase 5 done
- Intro loader now always plays to the end (min 3.9 s, max 5.5 s) with a short "done" beat before lifting.
- Admin at /admin: Footpath admin ported file for file into admin/src (see CLAUDE.md "Admin"). Router shim
  admin/router.js; route table admin/routes.js; catch-all app/admin/[[...slug]]/page.js.
- New admin screens: Pre-bookings, Inquiries (status tabs with counts, call/WhatsApp, quote, notes, delete).
  Product form "Wholesale & Season" tab (Bangla name, unit, min order, price display show/inquiry/TBA, wholesale
  tier, availability, pre-order date/advance/cap/note) + variant wholesale price and packed weight.
  Shipping rate modal: base kg + per kg. "Pre-booked" status in lists, badges, detail (with advance + harvest box).
  Currency labels BDT. Active nav uses brand ink + mango.
- Static demo admin: lib/demo/adminDemo.js (10 fictional orders incl. 3 pre-bookings, 5 inquiries, users,
  dashboard analytics). All 20 admin pages render with no console errors at 1440 px; no overflow at 390 px.
- Backend: `app.set("trust proxy", 1)` in production (rate limiters behind nginx).
- Docs: amkahon-front/DEPLOY.md (Vercel static + VPS: env, pm2, nginx, certbot, checks), ecosystem.config.cjs in
  both repos (pm2 fork, 1 instance), amkahon-back/BASE_CANDIDATES.md (what to port back to Footpath, critical first).
- New deps: react-hot-toast, recharts (run npm install in amkahon-front).

### Post Phase 5 changes (2026-11-10)
- Hero: ONE full screen block, no slider. Media per device from Admin > Homepage hero (HeroContent):
  desktop = landscape video or photo (placeholder now: /images/mango-cut-halves.jpg), phone = vertical reel
  (/videos/hero-loop.mp4). components/home/HeroMedia.js mounts only the current breakpoint's media, sound toggle
  for video, falls back to bundled media on error. Waiting for Sifat's landscape video -> put it in
  public/videos (or upload in admin) and set it as the desktop media.
- Admin: "Homepage Hero" editor (shared text/button + desktop/phone media with upload). New backend route
  POST /api/admin/upload/hero-video (mp4/webm, 60 MB, uploads/hero). Hidden from nav AND routes: A+ Content,
  Campaigns, Cart Campaigns, Hero Slides (pages kept in admin/src for future clients).
- Reviews: 12 DEMO placeholder reviews in seed/data.js (seed reviewers @seed.aamkahon.local). seed.js adds them
  only outside production (or with --with-demo-reviews); `npm run seed -- --purge-demo-reviews` removes them and
  recomputes ratings. MUST be replaced with real reviews (Facebook page has 13) or purged before launch.
  Storefront: product page "What buyers say" (+ stars under title, AggregateRating JSON-LD), homepage testimonials
  (GET /api/reviews/featured). Fixtures include reviews.json.
- Security: public product reviews populated reviewer email; now name only (BASE_CANDIDATES item 4).
- To apply on Sifat's DB: `cd amkahon-back && npm run seed -- --reset` (updates hero records + adds demo reviews).

### Open items / next steps
- Real SSLCommerz sandbox run end to end (needs credentials) and a live seed on Atlas.
- Client to confirm real prices, harvest dates, refund terms, whether ghee stays.
- Footpath base: apply BASE_CANDIDATES.md items 1 to 3 (security) as soon as possible.
- Admin uses the ported grey style; per-page polish only if the client asks.
