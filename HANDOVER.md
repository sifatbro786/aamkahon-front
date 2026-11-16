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

- Hero update: desktop is now a background SLIDER (copy/buttons static, only background changes): one desktop
  HeroContent record per slide, ordered by `order`, new `label` field (model + controller + /api/hero items) shown
  on the slider indicators (lg+). Crossfade + slow zoom, 6 s, pauses on indicator hover / hidden tab / reduced
  motion; a video slide plays to its end then advances. Phone keeps the reel video. Seed: mango, gur, ghee slides.
  Admin Homepage Hero: Desktop slides (add, label, photo/video, upload, reorder, remove) + Phone card.
  Apply with `npm run seed -- --reset`.

### Open items / next steps
- Real SSLCommerz sandbox run end to end (needs credentials) and a live seed on Atlas.
- Client to confirm real prices, harvest dates, refund terms, whether ghee stays.
- Footpath base: apply BASE_CANDIDATES.md items 1 to 3 (security) as soon as possible.
- Admin uses the ported grey style; per-page polish only if the client asks.

---

## Client change requests (2026-11-11) — phases 6 to 8

Source: client's handwritten list (invoice + stock, order mgmt, customer database, old customer
import, promo info, customer location, online payment) + Sifat's 12 points. Promo SMS/ads and
"location tracking" as marketing analytics belong to the digital marketing team; the site gives
them the data (customer list export by tag/district).

Decisions:
- Wholesale is taken by phone, only in season. Low priority: keep backend fields, hide the
  wholesale UI from the product form/storefront in Phase 7 (feature flag), do not delete code.
- Mango ships by AJR (no COD, item + delivery prepaid). Sundarban and Steadfast are also used.
- Delivery options are data driven: a type shows when its rate is active; Courier also needs
  the district to have branches. Dhaka can now have courier pickup.

### Phase 6 — operations core
- [x] 6.1 Dhaka delivery fix: backend services/deliveryOptions.js (rates + branches decide),
      courierBranch validated against the admin list, isHomeDeliveryOnly removed, Order
      addressLine1 not required for courier pickup. Admin rate slots now include Dhaka Inside /
      Dhaka Sub Courier. Checkout asks only when there is more than one option.
      ACTION: in Admin > Shipping > Rates create "Dhaka Inside · Courier" (and Dhaka Sub if
      needed), and keep Dhaka branches in Courier Branches.
- [x] 6.2 Customer list (Admin > Customers > Customer List): models/Customer.js (phone =
      normalized 01XXXXXXXXX, unique), /api/admin/customers list/create/patch/delete,
      POST /import (browser parses CSV, column mapping + preview, chunks of 1000, skip|update),
      GET /export (CSV, opted-out excluded, formula-injection safe). Orders and inquiries
      add themselves (services/customerSync.js). Backfill: `npm run sync:customers`.
- [x] 6.3 Online only products: Product.codAllowed (admin: "Full payment online only").
      priceLines -> codAvailable; calculate/createOrder force SSLCommerz; checkout hides COD.
- [x] 6.4 Phone orders + invoice (2026-11-12): Admin > Orders > "New phone order"
      (/admin/orders/new). Customer lookup from the customer list, district/upazila/delivery
      from the same checkout endpoints, product search (GET /api/admin/stock), per line price
      override (negotiated / wholesale by phone, flagged priceOverridden), discount, delivery
      charge override, payment received (cash/bKash/Nagad/bank, amount, ref). Server prices it
      (POST /api/admin/orders/manual/preview, then /manual). Order: paymentMethod "Manual",
      orderSource "phone", paymentStatus Pending|Partial|Paid, manualPayment {method, reference,
      paidAmount}. Save as Confirmed (takes stock), Pending or Pre-booked.
      Invoice: /admin/orders/:id/invoice for ANY order, A4 or 80 mm, Print / Save as PDF
      (browser print, portal + print CSS). "Invoice" button on order detail. Invoice no. = order no.
- [x] 6.5 Stock (2026-11-12): models/StockMovement.js ledger (purchase, return, damage,
      correction, order, order_cancel, other) with before/after from the atomic update.
      updateProductStock(items, action, session, meta) writes ledger rows for every order
      stock change; product form edits and opening stock are logged as corrections.
      Admin > Catalog > Stock: levels per product/pack, low/out filters, Stock in / out /
      Set to count, History tab (links to orders).
      Known gap: the product form still writes stock as an absolute number, so an order
      landing while the form is open can be overwritten (logged, but not prevented). Tell
      the client to change stock from the Stock page; consider making the form field
      read-only in Phase 7.

### Commit messages (phase 6.4 + 6.5)
- amkahon-back:  `feat: phone orders with server-side totals, stock ledger and admin stock API`
- amkahon-front: `feat(admin): phone order form, printable invoice (A4/80mm), stock page with history`

### Fixes after 6.5 review (2026-11-12)
- Product form stock is view only when editing (opening stock only on create). Backend
  updateProduct ignores stock from the body and carries each variant's stock over by its
  options, so a form save can no longer undo an order. Changes go through Admin > Stock.
- Orders page filter bar re-laid out (flex wrap, nothing squeezed).
- Orders vs Pre-bookings are now different screens: GET /api/admin/orders?view=orders|prebookings
  (backend viewScope). Pre-bookings = pre-orders still Pending/Pre-booked, sorted by harvest
  date, with advance/balance columns and their own stats; once Confirmed they move to Orders.
  Stats take the same ?view and add preOrderAdvance / preOrderBalance. sortBy is whitelisted.
- Storefront header marks the active link (lib/activeLink.js: path + query match, most
  specific wins; useSearchParams under Suspense). Admin sidebar already had it.

### Base sync + fixes (2026-11-14)
- Footpath base now has every generic fix and feature from Aamkahon (list in
  amkahon-back/BASE_CANDIDATES.md). Footpath also got header active link by query.
- Wholesale: automatic tier switched OFF on both sides (NEXT_PUBLIC_WHOLESALE_TIER /
  WHOLESALE_TIER). Product form hides the tier and variant wholesale price, tab is
  "Selling & Season"; shop filter, product ladders, cart tier hints hidden;
  /wholesale and the homepage band now say "call or WhatsApp for a quote".
  Wholesale orders = Admin > Orders > New phone order with the agreed price.
- Both backends: PII-free logging (utils/logger.js), campaign cron lock (services/jobLock.js).
- Commits: amkahon-back `chore: wholesale tier flag, redacted logging, cron lock`;
  amkahon-front `feat: hide wholesale tier behind a flag, phone wholesale copy`;
  footpath-backend `feat: port Aamkahon fixes (pricing, delivery, stock, phone orders, customers)`;
  footpath-frontend `feat(admin): customers, stock, phone orders, invoice; checkout delivery fix`.

### Phase 7 — content and catalogue for food products
- [x] 7.1 Season CMS + FAQ (2026-11-12). Backend: models/StorefrontSettings.js (singleton:
      activeSeason mango|winter|all, per season announcement + hero copy + homepage block
      switches, owner story), models/Faq.js, services/storefront.js (season filters),
      GET /api/storefront, GET /api/storefront/faqs, admin /api/admin/storefront (GET/PUT),
      /api/admin/faqs (CRUD + reorder). HeroContent.season and DynamicSection.seasons tag media
      and sections; /api/hero and homepage-sections filter by the active season (hero falls
      back per device if a season has no media). Seed: STOREFRONT (winter active), FAQS,
      season tags; `npm run seed` adds them (settings only if missing, --reset overwrites).
      Front: header announcement, Hero copy per season, homepage blocks on/off, FaqBlock
      (homepage, up to 6) + /faq page with FAQPage JSON-LD, footer + sitemap links.
      Admin: Storefront Content > Homepage & Season (switch + per season copy/blocks),
      FAQ, season select on Homepage hero media, season ticks on Product sections.
- [x] 7.2 Owner spotlight (2026-11-12): components/story/OwnerSpotlight.js on /story (portrait,
      name, role, quote, note, facts) and the homepage StoryBlock leads with the owner.
      Admin > Our Story (photo upload). ACTION: client gives owner name + best portrait.
- [x] 7.3 Hero video poster (2026-11-14). HeroContent.posterUrl (video records only, cleared
      for photos), returned in /api/hero items. Admin hero-content POST/PUT now have
      express-validator rules (URLs must be /path, #anchor or http(s)). Admin Homepage hero:
      "Poster image" field + upload under every video card, shown in the preview.
      Storefront HeroMedia: desktop video slide sits on its poster (next/image, priority on
      slide 1) and fades in on `playing`; first paint shows the poster; reduced motion shows
      the poster instead of the video; video error or refused autoplay -> poster, and the
      slide is timed like a photo (slider can no longer get stuck waiting for `ended`).
      Phone poster = record posterUrl, else /videos/hero-poster.jpg. Seed: phone record has
      posterUrl. Fixtures regenerated.
      NOT browser tested here (no browser in Claude's shell, next build needs Windows swc):
      Sifat runs `npm run build` and checks desktop with a real landscape video + poster.
- [x] 7.4 Product presets (2026-11-14). Product.food {shelfLifeDays, seasonMonths[1-12]}
      (origin/storage stay Attributes rows, only displayed). Admin product form: "Start from
      a preset" bar (Mango, Khejurer gur, Ghee, Achar) from admin/src/config/productPresets.js
      (CLIENT DATA; empty array hides the bar). New product: preset sets unit, payment rule,
      availability, packs with weight, shelf life, season months, Origin/Storage attributes;
      prices stay empty. Editing: only blank shelf life / season months + missing attributes,
      never packs or stock. Selling & Season tab: "Food details" (shelf life days, month
      toggles). Product page facts add "In season" (e.g. Dec to Feb) and "Shelf life" unless an
      attribute with that name exists. Seed has estimated food values (client to confirm).
- [x] 7.5 Food dashboard (2026-11-14). GET /api/admin/analytics/food?days=&warnDays=.
      Dashboard: Season calendar (12 months per product, current month, pre-booking ship
      dot, active season), Best-before watch (stock-in lots whose best-before is within 30
      days or up to 7 days past, product/pack still in stock; sales are NOT allocated to
      lots, UI says check the shelf), Top districts (live statuses incl. Pre-booked, 30/90/365
      days, orders, customers, revenue, share; courier pickup without district counted apart).
      Stock page: Stock in takes Batch + Best before (blank on a purchase = today + shelf
      life); history shows them. StockMovement.batch/bestBefore.
      Fix found on the way: product list quick +/- (PATCH /api/admin/products/:id/stock) did a
      raw $inc with no ledger row and moved the parent stock of variant products. It now goes
      through stockLedger.adjustStock and refuses variant products.
      Static demo: /admin/analytics/food answered by lib/demo/adminDemo.js (fictional lots).
      NOT run against a DB or in a browser here (no DB/browser from Claude's shell; next build
      needs Windows swc). Logic checks pass (lot defaults, schema month range, presets, month
      ranges, demo handler). ACTION: `npm run seed -- --reset` to put food values on the
      seeded products, then `npm run build` and look at /admin and a product page.
- [ ] Later (asked, not built): automatic season switch by date and "in season first" shop sort.
- [x] Unused generic fields hidden (2026-11-15). admin/src/config/productFields.js (client
      data): Brand, Dimensions, Shipping class, Meta keywords, Featured hidden in the product
      form + view (schema/API unchanged, saved values kept). Nav + routes: Offer Popups and
      Page Meta hidden (storefront never read them). Product page metadata now uses the
      SEO tab's Meta title / description when set (they were ignored before).
      Commit (front): `chore(admin): hide fields this store does not use; product SEO meta wired`
- [x] Offer popup (2026-11-15). Admin > Offer Popups back on (nav + route), with a "Show in"
      season select. Backend: OfferPopup.season (all|mango|winter), /api/offers/active filters
      by the active season, buttonLink/thumbnailImage checked by utils/safeUrl.js. Storefront:
      components/layout/OfferPopup.js in the (store) layout: highest priority due offer,
      after 6 s and after the intro loader, never on checkout/cart/order/account/auth pages;
      frequency once/daily (localStorage) / always (once per session); key includes updatedAt
      so an edited offer shows again; Esc/backdrop/Maybe later close; text only, no HTML.
      Seed: OFFERS (winter only, pre-book 2027 mangoes, daily). Fixture offers.json + emulator.
      ACTION: `npm run seed` (adds the popup), then `npm run fixtures` is already done.
- [x] Header icons (2026-11-15). Admin > Navbar > Header icons now drive the storefront header
      (search, account, bag; getHeaderIcons in lib/data/catalog.js, cached 1 min). Wishlist
      toggle and Logo panel hidden in admin (no wishlist on this storefront; header uses the
      designed logo-lockup.png).
      Commits: back `feat: season-aware offer popups with safe links, seeded pre-booking popup`;
      front `feat: storefront offer popup, header icons from admin navbar settings`
- [x] No customer accounts + admin/staff roles (2026-11-15). Client decision: guest checkout
      only; "the info given at checkout is enough".
      Backend: roles admin (owner, all) | staff (limited); "executive" gone, "user" kept in the
      enum only for old records. `admin` middleware is now OWNER ONLY (fail closed); staff
      routes opt in with `team`: admin orders (not edit items / delete), phone orders (no price,
      discount or delivery overrides: manualOrderController), inquiries (not delete), customers
      (not import/export/delete), stock. Analytics, settings, products, users, coupons, shipping,
      reviews, uploads: admin only. protect() refuses non-active accounts. Login: team only.
      Unmounted: /api/cart, /api/wishlist, /api/admin/cart-campaigns, auth register/verify/
      addresses, GET /api/orders (my orders), customer review writes. createOrder is guest only
      (no auth: a signed-in admin browsing the shop no longer hits the server-cart path); email
      optional (phone is the contact). Tracking compares normalised BD phone numbers.
      Reviews: admin enters them (POST/PUT /api/admin/reviews: reviewerName, district, source
      facebook|phone|whatsapp|website|other, reviewedAt); Review.user optional, unique index now
      partial. Seed demo reviews use reviewerName (no reviewer accounts).
      ACTION on every existing DB: `npm run migrate:roles` (executive -> admin, old customer
      accounts inactive, rebuilds the review index). Then `npm run seed -- --reset` if you want
      the demo reviews re-created without accounts.
      Frontend: removed /account, /register, /verify-email; header has no account icon; /login is
      "Team sign in" (not linked, noindex) and always goes to /admin; cart is guest only; checkout
      email optional + "Remember these details on this device" (lib/store/checkoutMemory.js).
      Admin: staff see Orders, Pre-bookings, Inquiries, Customer List, Stock only (navGroupsFor,
      STAFF_ROUTES in admin/routes.js; dashboard redirects staff to Orders); delete/import/export
      and phone order price fields hidden for staff; Users page is "Team" (Admin/Staff);
      Reviews: "Add review" + edit. Navbar admin: User account toggle hidden.
      Commits: back `feat: team-only auth (admin/staff), guest-only orders, admin-entered reviews`;
      front `feat: remove customer accounts, staff-limited admin, admin review entry, remembered checkout`
- [x] Coupon/offer dates fixed (2026-11-15). Date pickers sent "YYYY-MM-DD" = UTC midnight =
      06:00 in Bangladesh, so a coupon starting today was "not yet active" until 6 AM and died
      at 6 AM on its last day. amkahon-back/utils/bdDate.js: day-only values become 00:00 and
      23:59:59.999 Asia/Dhaka (coupons create/update, offer popups create/update). Admin forms
      read dates back in Asia/Dhaka; one-day coupons allowed. Base candidate (Footpath has it too).
      Existing coupons/offers: open Edit and press Update once to re-save the dates.

### Client round 2026-11-15 (9 points)
1. Storefront paper is white (#fff); paper-2/3 and line are neutral greys. Other colours unchanged.
2. Seed reviews use the admin-entry format (reviewerName, reviewerDistrict, source, reviewedAt, no user).
   A plain `npm run seed` rewrites old-format seeded reviews.
3. Policy pages CMS: Admin > Storefront Content > Policy Pages edits /privacy, /terms and the new
   /refund-policy (footer link + sitemap + checkout note). Plain text (blank line = paragraph, "- " =
   bullet). Unsaved pages show data/demo/pages.json (generated from seed POLICY_PAGES). Refund copy is a
   starting draft: client must confirm.
4. /order/success redesigned: confirmation #, "Thank you, {name}!", Google Maps embed of the address
   (no API key, non-interactive, "Open map" link), state card (polls ~1 min while payment is Pending),
   order details (contact, payment, address/pickup, courier + method), summary panel (desktop) /
   collapsible bar (phone). /order/fail and /order/cancel unchanged.
5. Checkout error was config, not code: SSLCOMMERZ_STORE_ID in .env is a placeholder ("sadsad"), so
   both COD (advance) and full online fail at gateway init. Needs real sandbox credentials. Customers now
   see a safe message (502 GATEWAY_INIT_FAILED); the order is kept as Cancelled with the reason in admin
   notes. The first 400 on calculate came from calling it before the delivery choice was complete; the
   checkout now waits until delivery type + branch are chosen.
6. Next warnings: product page awaits params inside <Suspense> (skeleton), hero/story images use
   loading="eager" (priority is deprecated in Next 16), <html data-scroll-behavior="smooth">.
   "Rendering with server caches disabled" lines are dev-only info.
7. Product page shows stock of the selected pack (small line under the quantity).
8. Customer list columns: Order no, Name, Phone, Address, Courier (+ courier filter). Customer.orderNo
   and courier follow the latest order; CSV import/export carry them. Demo customers seeded in that
   format (tag "demo", `npm run seed -- --purge-demo-customers` removes them).
9. Couriers: Admin > Catalog > Couriers (AJR no COD + not default; Sundarban, Steadfast COD + default).
   Product form "Delivery by" ticks couriers per product. Checkout offers only couriers every product
   allows (mixed AJR mango + gur = "order separately" message), AJR => full payment online incl.
   delivery. Product page shows the courier/payment terms. Order detail has a Courier card (staff can
   change it), invoice prints it, phone order form has an optional courier. Seed split per variety is
   a PLACEHOLDER (Gopalbhog, Khirsapat, Langra, Export Khirsapat = AJR; others Sundarban/Steadfast):
   the client sets the real split in the product form.
   Mango preset no longer sets "Full payment online only" (the courier decides now). Products saved
   earlier with that box ticked stay online only: untick it on them.
ACTION: put real SSLCommerz sandbox credentials in amkahon-back/.env, then `npm run seed` (adds
couriers, product courier split, policy pages, demo customers, rewrites demo reviews), then
`npm run build` in amkahon-front.
Commits: back `feat: couriers per product, policy pages API, order-book customers, safe gateway errors`;
front `feat: courier choice + terms, policy pages CMS, refund page, new order success page, white theme`

### NEXT (next session, asked on 2026-11-16): phone confirmation + manual payments, then go live
Client: an order is confirmed only after the team phones the customer. No SSLCommerz: manual bKash
and Nagad (client has merchant accounts for both) and bank transfer (bank details shown with a
picture). A bKash contact of the client will talk to the developer for the bKash API later.
Live: client gave full Hostinger access (domain + VPS), Cloudflare in front. Phase 8 courier APIs
after launch, one by one.
Proposed flow (A, "call first, then payment link"): checkout only records how the customer will
pay, no money on that page -> call queue (Confirmed / no answer xN / wrong number / fake /
cancelled) -> "Awaiting payment" + pay link /order/:no/pay (merchant numbers, QR, bank picture,
TrxID or slip; unique TrxID) -> staff verifies -> Processing. AJR = items + delivery, COD =
delivery advance or nothing, pre-booking = advance. Stock held from Confirmed, auto cancel if
unpaid in time. Later the pay page gets "Pay with bKash" (Tokenized Checkout) and bKash IPN can
auto-verify payments to the merchant number; manual stays as fallback.
OPEN DECISIONS (ask Sifat before coding):
1. Use flow A?
2. COD: delivery charge advance, or full COD with no advance?
3. Hours allowed for the call, and for payment, before auto cancel?
4. Pay link via an admin "send on WhatsApp" button (free) or an SMS gateway (cost)?
Client must send: bKash + Nagad merchant numbers and account type, QR images, bank details + picture.
bKash docs (developer.bka.sh): Tokenized Checkout recommended; Auth & Capture exists (hold, then
capture/void; paymentId valid 24 h); refund within 60 days; TLS 1.2+; IPN covers merchant/QR/USSD
payments too.

### Commit messages (fixes + 7.1 + 7.2)
- amkahon-back:  `feat: season-driven storefront settings, FAQ API, order views and stock-safe product edits`
- amkahon-front: `feat: season CMS, FAQ, owner spotlight, active nav link; split orders/pre-bookings`

### Commit messages (7.3)
- amkahon-back:  `feat: hero video poster field with validated admin hero routes`
- amkahon-front: `feat: hero video poster, fade-in and stall-safe desktop slider`

### Commit messages (7.4 + 7.5)
- amkahon-back:  `feat: food fields, stock lots with best-before, food dashboard API, ledgered quick stock`
- amkahon-front: `feat: product presets, food details, lot entry on stock in, season/best-before/district dashboard`

### Phase 8 — courier integrations (after the client gives courier details)
- [ ] 8.1 Courier fields on Order (provider, consignment id, tracking link, status) + manual
      entry for AJR / Sundarban, tracking link on the customer's order page.
- [ ] 8.2 Steadfast API (merchant API key + secret from Steadfast support): create
      consignment from an order, status sync, webhook. Keys only in .env.
- [ ] 8.3 Sundarban API if their merchant desk gives credentials; Pathao optional.

### Commit messages so far
- amkahon-back:  `feat: data-driven delivery options, customer list with CSV import, online-only products`
- amkahon-front: `feat(admin): customer list + CSV import, Dhaka courier rates, online-only payment`

---

## LIVE (2026-11-16)

Site: https://aamkahon.com (www redirects to apex) · API: https://api.aamkahon.com (health: /health)
Admin: https://aamkahon.com/login. Live owner password was changed on the server and is NOT the seed
value (and is not written in this public repo). Never run `seed.js --reset-owner-password` on live: it
puts the seed password back.

### Server (Hostinger VPS, client account)
- KVM 1 (1 vCPU, 4 GB RAM, 50 GB), Mumbai, Ubuntu 26.04, IP 200.234.47.126, timezone Asia/Dhaka.
- 2 GB swap (/swapfile, swappiness 10): needed for `next build` on 1 CPU.
- ufw: only OpenSSH, 80, 443. fail2ban on. Ports 3000/5030 are NOT public (nginx only).
- Node 24 LTS (NodeSource), nginx, certbot (Let's Encrypt, auto renew, dry run passed), pm2.
- Apps run as user `deploy` (not root). pm2 home /home/deploy/.pm2, systemd unit `pm2-deploy`
  (starts both apps on reboot, tested). From root use `sudo -iu deploy pm2 ls` etc.
  Do NOT run pm2 as root: it starts a second copy of the apps.
- pm2-logrotate: 10 MB, keep 7.
- No uploads backup (Sifat's decision). Only Hostinger weekly snapshot. uploads/ is not in git or DB.

### Paths and processes
| What | Path | pm2 name | Port |
|---|---|---|---|
| Backend | /var/www/aamkahon-back (.env, chmod 600) | amkahon-back (fork, 1 instance) | 5030 |
| Frontend | /var/www/aamkahon-front (.env.production) | amkahon-front (fork, 1 instance) | 3000 |
| nginx | /etc/nginx/sites-available/aamkahon (www redirect, apex -> 3000, api -> 5030, api body 64m) | | |

Frontend .env.production: DATA_MODE=api, NEXT_PUBLIC_API_URL=https://api.aamkahon.com/api,
API_INTERNAL_URL=http://127.0.0.1:5030/api, NEXT_PUBLIC_SITE_URL=https://aamkahon.com.
NEXT_PUBLIC_* are baked in at build: rebuild after changing them.

Backend .env (production): NODE_ENV=production, BASE_URL=https://api.aamkahon.com,
CLIENT_URL/SITE_URL=https://aamkahon.com, FRONTEND_URL=apex + www, JWT_EXPIRE=7d, fresh JWT_SECRET,
WHOLESALE_TIER=off. NO SSLCommerz keys (not used; startup prints a warning, ignore).
SMTP_PASS is a dummy: emails fail ("SMTP Verification Failed" in logs) until Sifat sets a real Gmail
app password with `nano .env` then `pm2 restart amkahon-back`.

### Database
- Live uses the COMPANY Atlas M0 cluster (cluster0.rt9yqps), database `amkahon`, which still holds
  demo/test data on purpose (client learns the dashboard on it). VPS IP is in Atlas Network Access.
- Local dev must NOT point at `amkahon` any more: local .env uses `amkahon_dev`.
- Later (before real orders / public announcement): run a one-command clean script (to be written,
  dry run first; confirm with Sifat what stays: catalogue/settings or only the admin user), then switch
  MONGODB_URI to the CLIENT's own Atlas cluster (M0, AWS Mumbai) and seed. If real orders already exist
  by then, migrate with mongodump/mongorestore, not JSON export.
- M0 has no automated backups.

### Deploy updates
`aamkahon-deploy back | front | all` (root, /usr/local/bin/aamkahon-deploy): git pull --ff-only,
npm ci, build (front builds before restart, so a failed build keeps the old site up), pm2 restart.

### Known state at launch
- Storefront checkout does NOT work yet: it still needs SSLCommerz (COD advance + pre-booking advance).
  Orders are taken by phone/WhatsApp and entered in Admin > Orders > New phone order. Next work:
  flow A (phone confirmation + manual bKash/Nagad/bank pay link), see "NEXT" above.
- Seed hang at the end of seed.js = Product model declares two text indexes (Mongo allows one);
  mongoose autoIndex stalls on disconnect. Harmless, fix in the model (and Footpath base).
- npm audit: backend 1 high, frontend 7 moderate. Do not run `audit fix --force`; review after launch.

### Post-launch TODO
1. Flow A (order confirmation + manual payments), then bKash API.
2. Real SMTP app password.
3. Demo clean script + switch to client Atlas.
4. SSH key login, then PasswordAuthentication no / PermitRootLogin prohibit-password.
5. Cloudflare (client wants it): DNS moves to Cloudflare, backend `trust proxy` 1 -> 2 (two proxies),
   nginx real_ip from Cloudflare ranges.
6. Fix duplicate text index; npm audit review.
7. Repo is public and contains seed credentials/emails: consider making both repos private
   (then the VPS needs a GitHub deploy token for git pull).
