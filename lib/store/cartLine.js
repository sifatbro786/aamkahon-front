// lib/store/cartLine.js
//
// Builds the flat cart line both storage modes share, and the DISPLAY unit
// price for it. The display price mirrors the backend wholesale rule
// (services/lineItemPricing.js unitPriceFor) so the bag reads correctly as
// quantities change, but it is only ever printed: checkout shows the numbers
// from POST /api/checkout/calculate, and createOrder reprices from the DB.
import { mediaUrl } from "@/lib/media";
import { variantCartKey } from "@/lib/store/variants";

export function makeLine(product, variant, quantity = 1) {
    const options = variant?.options?.map(({ name, value }) => ({ name, value })) || [];
    const groups = product.imageGroups || [];
    const vGroup = variant?.imageGroupName && groups.find((g) => g.name === variant.imageGroupName);
    const main = vGroup || groups.find((g) => g.name === "Main") || groups[0];
    const isPre = product.availability === "pre_order";

    return {
        key: variantCartKey(product._id, options),
        productId: product._id,
        name: product.name,
        nameBn: product.nameBn || "",
        slug: product.slug,
        image: mediaUrl(main?.images?.[0]?.url),
        unit: product.unit || "kg",
        price: Number(variant ? variant.price : product.finalPrice ?? product.price) || 0,
        wholesale:
            product.wholesale?.enabled && product.wholesale.minQty
                ? {
                      minQty: product.wholesale.minQty,
                      price: Number(variant ? variant.wholesalePrice : product.wholesale.price) || null,
                  }
                : null,
        variant: options.length ? { options, displayName: options.map((o) => o.value).join(" / ") } : undefined,
        variantLabel: options.map((o) => o.value).join(" / "),
        quantity,
        minQty: product.minOrderQty || 1,
        isPreOrder: isPre,
        // false = item and delivery must be paid online (no COD courier).
        codAllowed: product.codAllowed !== false,
        expectedDate: isPre ? product.preOrder?.expectedDate || null : null,
        // Pre-bookings are not limited by stock (it does not exist yet), only by
        // the per-order cap. In-season lines are capped by live stock.
        stock: isPre
            ? product.preOrder?.maxQtyPerOrder || Infinity
            : Number(variant ? variant.stock : product.stock) || 0,
    };
}

/** Display-only unit price after the wholesale tier. */
export function lineUnitPrice(line) {
    const w = line.wholesale;
    if (w?.price && line.quantity >= w.minQty && w.price < line.price) return w.price;
    return line.price;
}

export const lineIsWholesale = (line) => lineUnitPrice(line) < line.price;
