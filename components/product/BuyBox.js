"use client";
import { CalendarClock, Check, Truck } from "lucide-react";
import { useMemo, useState } from "react";

import QtyStepper from "@/components/ui/QtyStepper";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { useCart } from "@/context/CartContext";
import { fullDate, plural, taka } from "@/lib/format";
import { makeLine } from "@/lib/store/cartLine";
import { advancePercent, harvestDate, isOutOfSeason, isPreOrder, unitOf, wholesaleTier } from "@/lib/store/productView";
import { availableValuesFor, defaultSelection, findVariant, isSelectionComplete } from "@/lib/store/variants";
import { whatsappText } from "@/lib/site";

/**
 * Variant, quantity and add to bag. Prices printed here are display only:
 * the bag and checkout reprice through the server (wholesale tier included).
 */
export default function BuyBox({ product, couriers = [] }) {
    const { addItem } = useCart();
    const pre = isPreOrder(product);
    const unit = unitOf(product);
    const minQty = Math.max(1, product.minOrderQty || 1);

    const [selection, setSelection] = useState(() => (product.hasVariants ? defaultSelection(product.variants) : {}));
    const [qty, setQty] = useState(minQty);
    const [added, setAdded] = useState(false);

    const variant = product.hasVariants ? findVariant(product.variants, selection) : null;
    const complete = !product.hasVariants || (isSelectionComplete(product.variantOptions, selection) && variant);
    const tier = wholesaleTier(product, variant || undefined);
    const retail = variant ? variant.price : (product.finalPrice ?? product.price);
    const tierOn = tier && qty >= tier.minQty;
    const unitPrice = tierOn ? tier.price : retail;

    const stock = pre ? Infinity : Number(variant ? variant.stock : product.stock) || 0;
    const maxQty = pre ? product.preOrder?.maxQtyPerOrder || 999 : stock;
    const soldOut = !pre && stock <= 0;
    const basis = variant ? variant.options.map((o) => o.value).join(" / ") : unit;

    const setQtyClamped = (n) => setQty(Math.min(Math.max(n, minQty), Math.max(minQty, maxQty)));

    const waText = useMemo(
        () => whatsappText(`Hi Aamkahon, I want to order ${product.name}${basis !== unit ? ` (${basis})` : ""}, quantity ${qty}.`),
        [product.name, basis, unit, qty],
    );

    const onAdd = async () => {
        if (!complete || soldOut) return;
        const ok = await addItem(makeLine(product, variant, qty), qty);
        if (ok) {
            setAdded(true);
            setTimeout(() => setAdded(false), 2200);
        }
    };

    if (isOutOfSeason(product)) {
        return (
            <div className="rounded-card bg-paper-2 p-5">
                <p className="font-medium">Out of season</p>
                <p className="mt-1 text-[15px] text-muted">This comes back next season. Message us and we will tell you when it opens for pre-booking.</p>
                <a href={waText} target="_blank" rel="noopener noreferrer" className="btn btn-ink mt-4">
                    <WhatsAppIcon size={18} /> Notify me on WhatsApp
                </a>
            </div>
        );
    }

    return (
        <div>
            {/* Price */}
            <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="num text-[34px] font-semibold leading-none tracking-tight">{taka(unitPrice)}</span>
                <span className="text-muted">/ {basis}</span>
                {tierOn && <span className="rounded-full bg-leaf-soft px-2.5 py-1 text-[12px] font-medium text-leaf-deep">Wholesale price</span>}
            </div>
            {tierOn && retail > unitPrice && <p className="num mt-1 text-[14px] text-muted line-through">{taka(retail)}</p>}

            {/* Variant axes */}
            {product.hasVariants &&
                product.variantOptions.map((axis) => {
                    const reachable = availableValuesFor(product.variants, axis.name, selection);
                    return (
                        <fieldset key={axis.name} className="mt-7">
                            <legend className="label text-muted">{axis.name}</legend>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {axis.values.map((value) => {
                                    const active = selection[axis.name] === value;
                                    const disabled = !reachable.has(value);
                                    return (
                                        <button
                                            key={value}
                                            type="button"
                                            disabled={disabled}
                                            onClick={() => setSelection((s) => ({ ...s, [axis.name]: value }))}
                                            className={`rounded-full border px-4 py-2.5 text-[15px] transition-colors disabled:opacity-35 ${active ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"}`}
                                            aria-pressed={active}
                                        >
                                            {value}
                                        </button>
                                    );
                                })}
                            </div>
                        </fieldset>
                    );
                })}

            {/* Wholesale ladder */}
            {tier && (
                <div className="mt-7 overflow-hidden rounded-lg border border-line">
                    <div className={`flex items-center justify-between px-4 py-3 text-[15px] ${!tierOn ? "bg-paper-2" : ""}`}>
                        <span>
                            1 to {tier.minQty - 1} {plural(2, unit)}
                        </span>
                        <span className="num">{taka(tier.retail)} each</span>
                    </div>
                    <div className={`flex items-center justify-between border-t border-line px-4 py-3 text-[15px] ${tierOn ? "bg-leaf-soft text-leaf-deep" : ""}`}>
                        <span className="font-medium">
                            {tier.minQty}+ {plural(2, unit)} {tierOn && <Check size={15} className="ml-1 inline" aria-hidden />}
                        </span>
                        <span className="num font-medium">
                            {taka(tier.price)} each <span className="text-[13px] font-normal text-muted">save {tier.savingPct}%</span>
                        </span>
                    </div>
                </div>
            )}

            {/* Pre-booking terms */}
            {pre && (
                <div className="mt-7 flex gap-3 rounded-lg bg-mango-soft p-4 text-[15px]">
                    <CalendarClock size={20} className="mt-0.5 shrink-0 text-mango-deep" aria-hidden />
                    <p>
                        <span className="font-medium">Pre-booking.</span> Ships from {fullDate(harvestDate(product))}. Pay {advancePercent(product)}% of the item price
                        now, the rest and delivery on arrival.
                    </p>
                </div>
            )}

            {/* Quantity + add */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
                <QtyStepper value={qty} min={minQty} max={Math.max(minQty, maxQty)} onChange={setQtyClamped} />
                <button type="button" onClick={onAdd} disabled={!complete || soldOut} className="btn btn-mango h-12 min-w-0 flex-1 basis-48 disabled:cursor-not-allowed disabled:opacity-50">
                    {added ? (
                        <>
                            <Check size={18} aria-hidden /> Added to bag
                        </>
                    ) : soldOut ? (
                        "Sold out"
                    ) : pre ? (
                        "Pre-book now"
                    ) : (
                        "Add to bag"
                    )}
                </button>
            </div>
            {minQty > 1 && <p className="mt-2 text-[13px] text-muted">Minimum order {minQty} {plural(minQty, unit)}.</p>}
            {/* Stock of the selected pack (or the product). Shown small and
                always, so a buyer of 120 kg knows before the bag refuses it. */}
            {!pre && complete && (
                <p className={`mt-2 text-[13px] ${soldOut ? "text-danger" : stock <= 10 ? "text-mango-deep" : "text-muted"}`} aria-live="polite">
                    {soldOut ? (
                        <>{product.hasVariants ? `${basis} is out of stock` : "Out of stock"}</>
                    ) : (
                        <>
                            <span className="num font-medium">{stock}</span> {plural(stock, product.hasVariants ? "pack" : unit)} in stock
                            {product.hasVariants ? <> ({basis})</> : null}
                        </>
                    )}
                </p>
            )}
            {tier && !tierOn && (
                <p className="mt-2 text-[13px] text-leaf-deep">
                    Order {tier.minQty} or more for {taka(tier.price)} each.
                </p>
            )}

            <CourierTerms couriers={couriers} pre={pre} />

            <a href={waText} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 text-[15px] text-ink/80 hover:text-ink">
                <WhatsAppIcon size={18} className="text-leaf-deep" /> Prefer to order on WhatsApp?
            </a>
        </div>
    );
}

/**
 * Which couriers carry this product and what that means for payment. The
 * server applies the same rule at checkout (services/couriers.js); this is
 * the heads-up so an AJR mango buyer is not surprised by full prepayment.
 */
function CourierTerms({ couriers, pre }) {
    if (!couriers.length) return null;
    const prepaidOnly = couriers.every((c) => !c.codAllowed);
    return (
        <div className={`mt-7 rounded-lg border p-4 text-[14px] ${prepaidOnly ? "border-mango/40 bg-mango-soft/60" : "border-line"}`}>
            <p className="flex items-center gap-2 font-medium">
                <Truck size={17} className="text-mango-deep" aria-hidden />
                Delivery by {couriers.map((c) => c.name).join(" or ")}
            </p>
            <ul className="mt-2.5 space-y-1.5">
                {couriers.map((c) => (
                    <li key={c.key} className="flex flex-wrap justify-between gap-x-4 gap-y-0.5">
                        <span className="text-ink/80">{c.name}</span>
                        <span className={c.codAllowed ? "text-muted" : "font-medium text-mango-deep"}>
                            {c.codAllowed ? "Cash on delivery or online" : "Full payment online, delivery included"}
                        </span>
                    </li>
                ))}
            </ul>
            {prepaidOnly && !pre && (
                <p className="mt-2.5 text-[13px] text-ink/75">
                    {couriers[0].name} does not collect cash, so the product price and the delivery charge are paid in full at checkout.
                </p>
            )}
            {prepaidOnly && pre && <p className="mt-2.5 text-[13px] text-ink/75">Pay the advance now; the balance and delivery are paid online before dispatch.</p>}
        </div>
    );
}
