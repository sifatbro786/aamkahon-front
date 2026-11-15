"use client";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronDown, ExternalLink, MapPin } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import OrderDetails from "@/components/order/OrderDetails";
import { checkoutApi } from "@/lib/api/checkoutApi";
import { fullDate, taka } from "@/lib/format";
import { resolveOrderToken } from "@/lib/store/orderAccess";
import { SITE, whatsappText } from "@/lib/site";

/**
 * Order confirmation (the gateway returns here; COD and full online alike).
 * Layout follows the familiar checkout "thank you" page: confirmation number,
 * the delivery spot on a map, the order state, contact/address/method, and
 * the order summary (collapsible on phones, a side panel on desktop).
 *
 * The order is read with the guest capability token (lib/store/orderAccess);
 * while the payment callback is still landing the order is Pending, so the
 * query polls for a short while instead of telling a paying customer
 * "waiting for payment" forever.
 */
export default function OrderSuccess() {
    const sp = useSearchParams();
    const orderNumber = sp.get("orderNumber") || "";
    const id = orderNumber || sp.get("orderId") || "";
    const token = resolveOrderToken({ urlToken: sp.get("token"), orderNumber });

    const { data: order, isLoading, isError } = useQuery({
        queryKey: ["order", id, token],
        queryFn: () => checkoutApi.getOrder(id, token).then((r) => r.data?.order),
        enabled: Boolean(id),
        retry: false,
        refetchInterval: (q) => {
            const o = q.state.data;
            // ~1 minute of polling, then stop (dataUpdateCount counts fetches).
            return o?.orderStatus === "Pending" && o?.paymentStatus === "Pending" && q.state.dataUpdateCount < 15 ? 4000 : false;
        },
    });

    if (!id) {
        return (
            <div className="wrap max-w-2xl py-24 text-center">
                <h1 className="text-h2 font-medium">Order not found</h1>
                <p className="mt-3 text-muted">This link has no order number. Track your order with its number and your phone.</p>
                <Link href="/track-order" className="btn btn-ink mt-8">
                    Track order
                </Link>
            </div>
        );
    }

    const a = order?.shippingAddress || {};
    const firstName = (a.name || "").trim().split(/\s+/)[0];
    const state = orderState(order);

    return (
        <div className="lg:grid lg:min-h-[70vh] lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
            {/* Phone: summary bar on top, opens the item list. */}
            {order && (
                <details className="group border-b border-line bg-paper-2 lg:hidden">
                    <summary className="wrap flex cursor-pointer list-none items-center justify-between py-4 [&::-webkit-details-marker]:hidden">
                        <span className="flex items-center gap-1.5 text-[15px]">
                            Order summary <ChevronDown size={16} className="transition-transform group-open:rotate-180" aria-hidden />
                        </span>
                        <span className="num text-[18px] font-semibold">{taka(order.totalPrice)}</span>
                    </summary>
                    <div className="wrap pb-6">
                        <OrderDetails order={order} />
                    </div>
                </details>
            )}

            <div className="wrap max-w-[640px] py-10 lg:ml-auto lg:mr-0 lg:py-14 lg:pr-12">
                {/* Heading */}
                <div className="flex items-center gap-4">
                    <span className="grid size-14 shrink-0 place-items-center rounded-full border-2 border-ink">
                        <Check size={26} strokeWidth={2.2} aria-hidden />
                    </span>
                    <div className="min-w-0">
                        <p className="text-[15px] text-muted">
                            {order?.orderType === "pre_order" ? "Pre-booking" : "Confirmation"} <span className="num">#{orderNumber || order?.orderNumber}</span>
                        </p>
                        <h1 className="text-[clamp(1.6rem,1.2rem+1.6vw,2.2rem)] font-medium leading-tight tracking-tight">
                            Thank you{firstName ? `, ${firstName}` : ""}!
                        </h1>
                    </div>
                </div>

                {isLoading && <div className="mt-8 h-72 animate-pulse rounded-card bg-paper-2" />}
                {isError && (
                    <p className="mt-8 rounded-card border border-line p-5 text-[15px] text-muted">
                        Your order is saved, but we could not load its details on this device. Track it any time with the order number and your phone number.
                    </p>
                )}

                {order && (
                    <>
                        {/* Map + state */}
                        <section className="mt-8 overflow-hidden rounded-card border border-line">
                            <DeliveryMap address={a} />
                            <div className="p-5">
                                <h2 className="text-[19px] font-medium">{state.title}</h2>
                                <p className="mt-1.5 text-[15px] leading-relaxed text-ink/75">{state.body}</p>
                            </div>
                        </section>

                        {/* Details */}
                        <section className="mt-5 rounded-card border border-line p-5">
                            <h2 className="text-[19px] font-medium">Order details</h2>
                            <dl className="mt-4 grid gap-x-8 gap-y-5 text-[15px] sm:grid-cols-2">
                                <div>
                                    <dt className="font-medium">Contact information</dt>
                                    <dd className="mt-1 break-words text-ink/75">
                                        <span className="num">{a.phone}</span>
                                        {(a.email || order.guestEmail) && <span className="block">{a.email || order.guestEmail}</span>}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="font-medium">Payment</dt>
                                    <dd className="mt-1 text-ink/75">
                                        <PaymentLines order={order} />
                                    </dd>
                                </div>
                                <div>
                                    <dt className="font-medium">{a.deliveryType === "Courier" ? "Pickup point" : "Shipping address"}</dt>
                                    <dd className="mt-1 break-words text-ink/75">
                                        {a.name}
                                        {a.deliveryType === "Courier" ? (
                                            <span className="block">{a.courierBranch} branch</span>
                                        ) : (
                                            <>
                                                {a.addressLine1 && <span className="block">{a.addressLine1}</span>}
                                                {a.addressLine2 && <span className="block">{a.addressLine2}</span>}
                                                {a.upazila && <span className="block">{a.upazila}</span>}
                                            </>
                                        )}
                                        <span className="block">{a.district}</span>
                                        <span className="block">Bangladesh</span>
                                        <span className="num block">{a.phone}</span>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="font-medium">Shipping method</dt>
                                    <dd className="mt-1 text-ink/75">
                                        {order.courier?.name ? `${order.courier.name} · ` : ""}
                                        {a.deliveryType === "Courier" ? "Courier pickup" : "Home delivery"}
                                        {order.totalWeightKg ? <span className="block text-[14px] text-muted">{order.totalWeightKg} kg packed</span> : null}
                                    </dd>
                                </div>
                            </dl>
                        </section>
                    </>
                )}

                <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-[14px] text-muted">
                        Need help?{" "}
                        <a href={whatsappText(`Hi Aamkahon, about order ${orderNumber}`)} target="_blank" rel="noopener noreferrer" className="text-ink underline underline-offset-2">
                            WhatsApp us
                        </a>{" "}
                        or call {SITE.phone}
                    </p>
                    <div className="flex gap-3">
                        <Link href="/track-order" className="btn btn-ghost">
                            Track order
                        </Link>
                        <Link href="/shop" className="btn btn-ink">
                            Continue shopping
                        </Link>
                    </div>
                </div>
            </div>

            {/* Desktop: summary panel */}
            <aside className="hidden border-l border-line bg-paper-2 lg:block">
                <div className="sticky top-24 max-w-[520px] px-12 py-14">
                    {order ? (
                        <>
                            <h2 className="mb-6 text-[19px] font-medium">Order summary</h2>
                            <OrderDetails order={order} />
                        </>
                    ) : (
                        <div className="h-64 animate-pulse rounded-card bg-paper-3/60" />
                    )}
                </div>
            </aside>
        </div>
    );
}

/** What the order means right now, in plain words. */
function orderState(order) {
    if (!order) return { title: "", body: "" };
    const contact = order.shippingAddress?.email || order.guestEmail ? "You will get a confirmation email shortly." : `We will call ${order.shippingAddress?.phone || "you"} before dispatch.`;
    if (order.orderStatus === "Cancelled") return { title: "This order was cancelled", body: `Call ${SITE.phone} if that is not what you expected.` };
    if (order.orderStatus === "Pre-booked")
        return {
            title: "Your pre-booking is confirmed",
            body: `Your mangoes are reserved${order.preOrder?.expectedDate ? ` and ship from ${fullDate(order.preOrder.expectedDate)}` : ""}. We will call before dispatch.`,
        };
    if (order.orderStatus === "Pending" && order.paymentStatus === "Pending")
        return { title: "Confirming your payment", body: "The payment page has sent you back. We are waiting for SSLCommerz to confirm; this page updates by itself." };
    if (order.orderStatus === "Delivered") return { title: "Delivered", body: "Your order has been delivered. Enjoy it." };
    if (order.orderStatus === "Shipped") return { title: "On the way", body: `Your order is with ${order.courier?.name || "the courier"}. ${contact}` };
    return { title: "Your order is confirmed", body: `We are packing it now. ${contact}` };
}

function PaymentLines({ order }) {
    const online = order.paymentMethod === "SSLCommerz" && order.orderType !== "pre_order";
    if (online) return <>Paid online · <span className="num">{taka(order.totalPrice)}</span></>;
    if (order.paymentMethod === "Manual") return <>Arranged by phone</>;
    return (
        <>
            <span className="block">
                {order.orderType === "pre_order" ? "Advance" : "Paid online"} · <span className="num">{taka(order.codOnlinePaymentAmount)}</span>
            </span>
            <span className="block">
                {order.orderType === "pre_order" ? "Balance due" : "Cash on delivery"} · <span className="num">{taka(order.remainingAmount)}</span>
            </span>
        </>
    );
}

/**
 * Google Maps embed of the delivery address (or the courier branch). The
 * no-key embed needs no API key or billing; it only receives the address the
 * customer typed. Non-interactive (a click opens Google Maps) so the page
 * never traps scroll on phones.
 */
function DeliveryMap({ address: a }) {
    const parts = a.deliveryType === "Courier" ? [a.courierBranch, a.district] : [a.addressLine1, a.upazila, a.district];
    const query = [...parts.filter(Boolean), "Bangladesh"].join(", ");
    const src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=14&output=embed`;
    const open = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    return (
        <div className="relative h-56 bg-paper-2 sm:h-64">
            <iframe title={`Map of ${query}`} src={src} loading="lazy" referrerPolicy="no-referrer" className="pointer-events-none absolute inset-0 size-full border-0 grayscale-[20%]" />
            <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-xl bg-paper px-5 py-2.5 text-center shadow-[0_6px_24px_rgba(22,18,13,0.14)]">
                <p className="text-[12px] text-muted">{a.deliveryType === "Courier" ? "Pickup branch" : "Shipping address"}</p>
                <p className="flex items-center justify-center gap-1 text-[15px] font-medium">
                    <MapPin size={14} className="text-mango-deep" aria-hidden />
                    {a.upazila && a.deliveryType !== "Courier" ? `${a.upazila}, ` : ""}
                    {a.district}
                </p>
            </div>
            <a href={open} target="_blank" rel="noopener noreferrer" className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-md bg-paper px-2.5 py-1.5 text-[12px] shadow hover:text-mango-deep">
                Open map <ExternalLink size={12} aria-hidden />
            </a>
        </div>
    );
}

