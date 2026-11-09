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
- [ ] Phase 3  [ ] Phase 4  [ ] Phase 5

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

### Phase 3 plan (next)
- scripts/buildFixtures.js in amkahon-back: seed/data.js -> API-shaped JSON in amkahon-front/src/data/demo
  (shapes verified against the controllers; same deterministic ids).
- Next.js 16 foundation: read node_modules/next/dist/docs first. Tailwind v4 @theme tokens from the logo,
  Google Sans + Bangla fallback, layout (header, footer, mobile nav), data layer (NEXT_PUBLIC_DATA_MODE static|api),
  port logic layer from footpath-frontend (api, cart context dual-mode, variants, orderAccess, auth),
  homepage with hero video. Compress the two big videos.
