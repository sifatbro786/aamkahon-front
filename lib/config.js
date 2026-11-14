// Runtime configuration. NEXT_PUBLIC_* values are inlined at build time.
//
// DATA_MODE
//   "api"    dev + VPS: every read and write goes to the Express backend.
//   "static" Vercel demo: reads come from data/demo/*.json (built from the
//            same seed as the database), every write is refused, and the
//            admin is viewable through a demo login. See lib/demo/emulator.js.
export const DATA_MODE = process.env.NEXT_PUBLIC_DATA_MODE === "static" ? "static" : "api";
export const IS_STATIC = DATA_MODE === "static";

// Public API base the browser calls.
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5030/api").replace(/\/$/, "");

// Server-side reads may use a private address on the VPS (skips DNS + TLS):
// API_INTERNAL_URL=http://127.0.0.1:5030/api
export const SERVER_API_URL = (process.env.API_INTERNAL_URL || API_URL).replace(/\/$/, "");

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

// Guest cart storage key. Per client store, never shared with another build.
export const CART_STORAGE_KEY = "aamkahon.cart.v1";

// Automatic wholesale tier (lower price once a line reaches a box count).
// OFF for Aamkahon: the client takes wholesale orders by phone, in season,
// at prices agreed on the call (Admin > Orders > New phone order). The code
// stays so another client can switch it on: NEXT_PUBLIC_WHOLESALE_TIER=on here
// and WHOLESALE_TIER=on in the backend .env (both must agree).
export const WHOLESALE_TIER = process.env.NEXT_PUBLIC_WHOLESALE_TIER === "on";

// Demo admin for the static build only. These credentials unlock nothing:
// the static build has no backend, and every write is refused.
export const DEMO_ADMIN = {
    email: "demo@aamkahon.com",
    password: "demo1234",
};
