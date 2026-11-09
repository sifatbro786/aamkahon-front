// lib/data/catalog.js
//
// Server-side reads for server components. Same envelopes as the API
// (amkahon-back/CLAUDE.md "Response envelopes"); unwrapping happens here so it
// never leaks into JSX.
//
// api mode    fetch the Express API, cached with "use cache" for a minute so
//             admin edits show up quickly without hammering the backend.
// static mode answer from the demo emulator (bundled fixtures).
//
// A failed fetch returns an empty, well formed value instead of throwing: a
// backend restart must not take the storefront down, and `next build` on the
// VPS should not die because the API was briefly unreachable.
import "server-only";
import { cacheLife, cacheTag } from "next/cache";

import { IS_STATIC, SERVER_API_URL } from "@/lib/config";
import { handle } from "@/lib/demo/emulator";

async function apiGet(path, params) {
    "use cache";
    cacheLife("minutes");
    cacheTag("catalog");

    if (IS_STATIC) {
        const res = handle("GET", path, params || {});
        return res.status === 200 ? res.data : null;
    }

    const qs = params ? `?${new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""))}` : "";
    try {
        const res = await fetch(`${SERVER_API_URL}${path}${qs}`, { headers: { Accept: "application/json" } });
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error(`[catalog] GET ${path} failed: ${error.message}`);
        return null;
    }
}

export async function getNavbar() {
    const data = await apiGet("/navbar/config");
    return (data?.data?.items || []).filter((i) => i.isActive !== false).sort((a, b) => a.order - b.order);
}

/** /api/hero is a bare object (no envelope). `items` is the Aamkahon addition. */
export async function getHero() {
    const data = await apiGet("/hero");
    return {
        desktop: (data?.items || []).find((i) => i.deviceType === "desktop") || null,
        mobile: (data?.items || []).find((i) => i.deviceType === "mobile") || null,
        desktopVideos: data?.desktopVideos || [],
        mobileVideos: data?.mobileVideos || [],
    };
}

export async function getHeroSlides() {
    const data = await apiGet("/hero-items");
    return data?.data || [];
}

export async function getHomepageSections() {
    const data = await apiGet("/products/homepage-sections");
    return (data?.sections || []).filter((s) => s.isActive !== false && s.products?.length);
}

export async function getCategories() {
    // /api/categories paginates at 10 by default.
    const data = await apiGet("/categories", { limit: 200 });
    return (data?.data || []).filter((c) => c.isActive !== false);
}

export async function getProducts(params = {}) {
    const data = await apiGet("/products", params);
    return {
        products: data?.products || [],
        total: data?.total || 0,
        totalPages: data?.totalPages || 0,
        currentPage: data?.currentPage || 1,
    };
}

export async function getProductBySlug(slug) {
    const data = await apiGet(`/products/slug/${encodeURIComponent(slug)}`, { includeAplus: "true" });
    return data?.product || null;
}

export async function getRelated(product, limit = 4) {
    const data = await apiGet("/products/related", {
        productId: product._id,
        categoryId: product.category?._id,
        limit,
    });
    return data?.products || [];
}

/** GET /api/checkout/shipping-rates -> { success, rates, lowestFreeShippingThreshold } */
export async function getShippingRates() {
    const data = await apiGet("/checkout/shipping-rates");
    return data?.rates || [];
}
