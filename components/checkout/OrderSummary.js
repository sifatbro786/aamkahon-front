"use client";
import Image from "next/image";

import { dayMonth, taka } from "@/lib/format";
import { lineUnitPrice } from "@/lib/store/cartLine";

const Row = ({ label, value, strong, muted, accent }) => (
    <div className={`flex items-baseline justify-between gap-4 ${strong ? "text-[17px] font-semibold" : "text-[15px]"} ${muted ? "text-muted" : ""} ${accent ? "text-leaf-deep" : ""}`}>
        <span>{label}</span>
        <span className="num text-right">{value}</span>
    </div>
);

/**
 * Every money figure comes from POST /api/checkout/calculate (`totals`).
 * Before an address exists only the bag lines are shown, with display prices.
 */
export default function OrderSummary({ items, totals, isCalculating, needsAddress }) {
    const lines = totals?.lines;
    const lineFor = (item) => lines?.find((l) => String(l.product) === String(item.productId) && (l.variant?.options || []).map((o) => o.value).join(" / ") === (item.variantLabel || ""));
    const sb = totals?.shippingBreakdown;

    return (
        <div className={`rounded-card bg-paper-2 p-5 md:p-6 transition-opacity ${isCalculating ? "opacity-70" : ""}`}>
            <h2 className="text-lg font-medium">Order summary</h2>
            <ul className="mt-4 divide-y divide-line border-y border-line">
                {items.map((item) => {
                    const l = lineFor(item);
                    const unit = l ? l.unitPrice : lineUnitPrice(item);
                    return (
                        <li key={item.key} className="flex gap-3 py-3">
                            <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-paper-3">
                                <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />
                            </div>
                            <div className="min-w-0 flex-1 text-[14px]">
                                <p className="truncate font-medium">{item.name}</p>
                                <p className="text-muted">
                                    {item.quantity} × {item.variantLabel || item.unit}
                                    {(l?.wholesaleApplied ?? unit < item.price) && <span className="text-leaf-deep"> · wholesale</span>}
                                </p>
                                {item.isPreOrder && item.expectedDate && <p className="text-mango-deep">Ships from {dayMonth(item.expectedDate)}</p>}
                            </div>
                            <span className="num text-[14px] font-medium">{taka(l ? l.lineTotal : unit * item.quantity)}</span>
                        </li>
                    );
                })}
            </ul>

            {!totals || needsAddress ? (
                <p className="mt-4 text-[14px] text-muted">Choose your district and area to see delivery and the total.</p>
            ) : (
                <div className="mt-4 space-y-2.5">
                    <Row label="Items" value={taka(totals.itemsSubtotal)} />
                    {totals.discountAmount > 0 && <Row label="Discount" value={`− ${taka(totals.discountAmount)}`} accent />}
                    <Row
                        label={
                            <>
                                Delivery
                                {sb?.totalWeightKg > 0 && <span className="text-[13px] text-muted"> · {sb.totalWeightKg} kg</span>}
                            </>
                        }
                        value={totals.shippingPrice === 0 ? "Free" : taka(totals.shippingPrice)}
                    />
                    {totals.codCharge > 0 && <Row label="Cash on delivery fee" value={taka(totals.codCharge)} />}
                    {totals.taxPrice > 0 && <Row label="VAT" value={taka(totals.taxPrice)} />}
                    <div className="border-t border-line pt-3">
                        <Row label="Total" value={taka(totals.finalTotal)} strong />
                    </div>
                    {(totals.isPreOrder || totals.isCOD) && (
                        <div className="mt-3 space-y-2 rounded-lg bg-paper p-4">
                            <Row label={totals.isPreOrder ? "Advance, pay now" : "Pay now (delivery + COD fee)"} value={taka(totals.codOnlinePaymentAmount)} strong />
                            <Row label="Pay on delivery" value={taka(totals.remainingAmount)} muted />
                        </div>
                    )}
                    {totals.couponMessage && totals.couponMessage !== "Coupon applied successfully" && <p className="text-[13px] text-danger">{totals.couponMessage}</p>}
                </div>
            )}
        </div>
    );
}
