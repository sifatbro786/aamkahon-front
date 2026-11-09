"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { SITE, whatsappText } from "@/lib/site";

/** /order/fail and /order/cancel. The gateway sends orderNumber and reason. */
export default function OrderProblem({ kind }) {
    const sp = useSearchParams();
    const orderNumber = sp.get("orderNumber");
    const cancelled = kind === "cancel";
    return (
        <div className="wrap max-w-2xl py-20 text-center md:py-28">
            <p className="label text-mango-deep">{cancelled ? "Payment cancelled" : "Payment not completed"}</p>
            <h1 className="mt-4 text-h2 font-medium">{cancelled ? "You left the payment page" : "The payment did not go through"}</h1>
            <p className="mx-auto mt-4 max-w-md text-[16px] leading-relaxed text-muted">
                {cancelled
                    ? "No money was taken and the order was not placed. Your bag is waiting if you want to try again."
                    : "No money was taken. This usually happens when the bank or wallet declines, or the page times out."}
                {orderNumber && (
                    <>
                        {" "}
                        Reference <span className="num text-ink">{orderNumber}</span>.
                    </>
                )}
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Link href="/shop" className="btn btn-ink">
                    Back to the shop
                </Link>
                <a href={whatsappText(`Hi Aamkahon, my payment did not complete${orderNumber ? ` for order ${orderNumber}` : ""}.`)} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                    Order on WhatsApp
                </a>
            </div>
            <p className="mt-8 text-[14px] text-muted">Or call {SITE.phone}.</p>
        </div>
    );
}
