"use client";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import OrderDetails, { statusLabel } from "@/components/order/OrderDetails";
import { checkoutApi } from "@/lib/api/checkoutApi";
import { resolveOrderToken } from "@/lib/store/orderAccess";
import { SITE } from "@/lib/site";

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
    });

    return (
        <div className="wrap max-w-3xl py-14 md:py-20">
            <CheckCircle2 size={40} className="text-leaf-deep" aria-hidden />
            <h1 className="mt-5 text-h2 font-medium">{order?.orderType === "pre_order" ? "Pre-booking confirmed" : "Thank you, your order is in"}</h1>
            {orderNumber && (
                <p className="mt-3 text-[17px] text-muted">
                    Order <span className="num font-medium text-ink">{orderNumber}</span>
                    {order && <> · {statusLabel(order.orderStatus)}</>}
                </p>
            )}
            <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-ink/80">
                We have emailed your receipt. Keep the order number handy; you can track it any time with your phone number.
            </p>

            <div className="mt-10">
                {isLoading && <div className="h-40 animate-pulse rounded-card bg-paper-2" />}
                {order && <OrderDetails order={order} />}
                {isError && <p className="text-muted">We could not load the order details here, but your order is saved. Track it below.</p>}
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/track-order" className="btn btn-ink">
                    Track order
                </Link>
                <Link href="/shop" className="btn btn-ghost">
                    Keep shopping
                </Link>
            </div>
            <p className="mt-8 text-[14px] text-muted">Questions about this order? Call or WhatsApp {SITE.phone}.</p>
        </div>
    );
}
