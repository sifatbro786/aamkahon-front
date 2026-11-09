import Image from "next/image";
import Link from "next/link";

import Badge from "@/components/ui/Badge";
import { dayMonth, plural, taka } from "@/lib/format";
import { firstImage } from "@/lib/media";
import {
    availabilityBadge,
    cheapestVariant,
    displayPrice,
    harvestDate,
    isPriceHidden,
    priceBasisLabel,
    unitOf,
    wholesaleTier,
} from "@/lib/store/productView";

export default function ProductCard({ product, sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 90vw", priority = false }) {
    const img = firstImage(product);
    const badge = availabilityBadge(product);
    const variant = cheapestVariant(product);
    const price = displayPrice(product);
    const tier = wholesaleTier(product, variant);
    const harvest = harvestDate(product);
    const unit = unitOf(product);
    const basis = priceBasisLabel(product, variant);

    return (
        <Link href={`/product/${product.slug}`} className="group block min-w-0">
            <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-paper-2">
                <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes={sizes}
                    priority={priority}
                    className="object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.035]"
                />
                <Badge tone={badge.tone} className="absolute left-3 top-3">
                    {badge.label}
                </Badge>
            </div>

            <div className="mt-4">
                <h3 className="text-[17px] font-medium leading-snug tracking-tight">{product.name}</h3>
                {product.nameBn && (
                    <p lang="bn" className="font-bangla mt-0.5 text-[15px] text-mango-deep">
                        {product.nameBn}
                    </p>
                )}

                {isPriceHidden(product) ? (
                    <p className="mt-3 text-[15px] text-muted">
                        {product.priceVisibility === "tba" ? "Price announced before harvest" : "Ask us for a quote"}
                    </p>
                ) : (
                    <p className="mt-3 flex flex-wrap items-baseline gap-x-1.5">
                        {variant && <span className="text-[13px] text-muted">from</span>}
                        <span className="num text-[19px] font-semibold">{taka(price)}</span>
                        <span className="text-[13px] text-muted">/ {basis}</span>
                    </p>
                )}

                {tier && (
                    <p className="mt-1 text-[13px] text-leaf-deep">
                        <span className="num font-medium">{taka(tier.price)}</span> each from {tier.minQty} {plural(tier.minQty, unit)}
                    </p>
                )}
                {harvest && <p className="mt-1 text-[13px] text-muted">Ships from {dayMonth(harvest)}</p>}
            </div>
        </Link>
    );
}
