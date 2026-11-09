// lib/store/productView.js
//
// Read-only view helpers over the product shape the API returns. They decide
// what to SHOW (labels, which price to print, whether to offer cart or
// inquiry). They never decide what anyone pays: checkout prints the numbers
// from POST /api/checkout/calculate, priced by services/lineItemPricing.js.

export const isPriceHidden = (p) => p?.priceVisibility === "inquiry" || p?.priceVisibility === "tba";
export const isPreOrder = (p) => p?.availability === "pre_order";
export const isOutOfSeason = (p) => p?.availability === "out_of_season";

/** Can this product go in the cart at all (ignoring stock)? */
export const isPurchasable = (p) => !isPriceHidden(p) && !isOutOfSeason(p);

export const unitOf = (p) => p?.unit || "kg";

/** The cheapest sellable variant, or null for single-price products. */
export function cheapestVariant(p) {
    if (!p?.hasVariants || !p.variants?.length) return null;
    return p.variants.reduce((best, v) => ((v.price ?? Infinity) < (best.price ?? Infinity) ? v : best));
}

/** "10 kg box" when a pack variant drives the price, else the unit. */
export function priceBasisLabel(p, variant = cheapestVariant(p)) {
    if (variant?.options?.length) return variant.options.map((o) => o.value).join(" / ");
    return unitOf(p);
}

/** Price shown on cards: lowest variant price, else product price. */
export function displayPrice(p) {
    if (isPriceHidden(p)) return null;
    const v = cheapestVariant(p);
    return v ? v.price : (p.finalPrice ?? p.price);
}

/**
 * Wholesale tier as configured on the product. For variant products the
 * wholesale price lives on each variant (no fallback to the product price,
 * pack sizes differ), so this reports the tier for a given variant.
 */
export function wholesaleTier(p, variant = cheapestVariant(p)) {
    const w = p?.wholesale;
    if (!w?.enabled || !w.minQty || isPriceHidden(p)) return null;
    const price = variant ? variant.wholesalePrice : w.price;
    if (!price) return null;
    const retail = variant ? variant.price : p.price;
    if (retail != null && price >= retail) return null;
    return { minQty: w.minQty, price, retail, savingPct: retail ? Math.round((1 - price / retail) * 100) : 0 };
}

/** Badge text and tone for the availability state. */
export function availabilityBadge(p) {
    if (p?.priceVisibility === "tba") return { label: "Price TBA", tone: "neutral" };
    if (p?.priceVisibility === "inquiry") return { label: "Price on request", tone: "neutral" };
    if (isPreOrder(p)) return { label: "Pre-booking", tone: "mango" };
    if (isOutOfSeason(p)) return { label: "Out of season", tone: "muted" };
    const stock = p?.hasVariants ? (p.variants || []).reduce((n, v) => n + (Number(v.stock) || 0), 0) : Number(p?.stock) || 0;
    if (stock <= 0) return { label: "Sold out", tone: "muted" };
    return { label: "In season", tone: "leaf" };
}

export const harvestDate = (p) => (isPreOrder(p) ? p.preOrder?.expectedDate || null : null);
export const advancePercent = (p) => (isPreOrder(p) ? p.preOrder?.advancePercent ?? 25 : 0);

export const attr = (p, key) => p?.attributes?.find((a) => a.key === key)?.value || null;
