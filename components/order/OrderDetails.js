import { dayMonth, fullDate, taka } from "@/lib/format";
import { mediaUrl } from "@/lib/media";

const STATUS_COPY = {
    Pending: "Waiting for payment",
    "Pre-booked": "Pre-booked, waiting for harvest",
    Confirmed: "Confirmed",
    Processing: "Being packed",
    Shipped: "On the way",
    Delivered: "Delivered",
    Cancelled: "Cancelled",
    Refunded: "Refunded",
};

export const statusLabel = (s) => STATUS_COPY[s] || s;

/** Order body shared by success, account and tracking views. */
export default function OrderDetails({ order }) {
    const partial = order.paymentMethod === "COD" || order.orderType === "pre_order";
    return (
        <div className="space-y-8">
            <ul className="divide-y divide-line border-y border-line">
                {(order.orderItems || []).map((it, i) => (
                    <li key={it._id || i} className="flex items-center gap-4 py-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={mediaUrl(it.image)} alt="" className="size-14 shrink-0 rounded-md bg-paper-2 object-cover" />
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{it.name}</p>
                            <p className="text-[14px] text-muted">
                                {it.quantity} × {taka(it.price)}
                                {it.wholesaleApplied && <span className="text-leaf-deep"> · wholesale</span>}
                            </p>
                        </div>
                        <span className="num font-medium">{taka(it.price * it.quantity)}</span>
                    </li>
                ))}
            </ul>
            <dl className="space-y-2 text-[15px]">
                {order.discountAmount > 0 && (
                    <div className="flex justify-between">
                        <dt className="text-muted">Discount</dt>
                        <dd className="num">− {taka(order.discountAmount)}</dd>
                    </div>
                )}
                <div className="flex justify-between">
                    <dt className="text-muted">Delivery{order.totalWeightKg ? ` (${order.totalWeightKg} kg)` : ""}</dt>
                    <dd className="num">{taka(order.shippingPrice)}</dd>
                </div>
                {order.codCharge > 0 && (
                    <div className="flex justify-between">
                        <dt className="text-muted">COD fee</dt>
                        <dd className="num">{taka(order.codCharge)}</dd>
                    </div>
                )}
                <div className="flex justify-between border-t border-line pt-3 text-[17px] font-semibold">
                    <dt>Total</dt>
                    <dd className="num">{taka(order.totalPrice)}</dd>
                </div>
                {partial && (
                    <>
                        <div className="flex justify-between">
                            <dt className="text-muted">{order.orderType === "pre_order" ? "Advance" : "Paid online"}</dt>
                            <dd className="num">{taka(order.codOnlinePaymentAmount)}</dd>
                        </div>
                        <div className="flex justify-between font-medium">
                            <dt>Due on delivery</dt>
                            <dd className="num">{taka(order.remainingAmount)}</dd>
                        </div>
                    </>
                )}
            </dl>
            {order.orderType === "pre_order" && order.preOrder?.expectedDate && (
                <p className="rounded-lg bg-mango-soft p-4 text-[15px]">
                    Your mangoes are reserved. They ship from {fullDate(order.preOrder.expectedDate)} and we will call before dispatch.
                </p>
            )}
            {order.statusHistory?.length > 0 && (
                <ol className="relative space-y-4 border-l border-line pl-6">
                    {order.statusHistory.map((h, i) => (
                        <li key={i} className="relative">
                            <span className="absolute -left-[29px] top-1.5 size-2.5 rounded-full bg-mango" aria-hidden />
                            <p className="font-medium">{statusLabel(h.status)}</p>
                            <p className="text-[13px] text-muted">
                                {dayMonth(h.updatedAt)}
                                {h.note ? ` · ${h.note}` : ""}
                            </p>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
}
