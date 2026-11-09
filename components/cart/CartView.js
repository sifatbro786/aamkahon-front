"use client";
import Link from "next/link";

import CartLines from "@/components/cart/CartLines";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { useCart } from "@/context/CartContext";
import { taka } from "@/lib/format";

export default function CartView() {
    const { items, subtotal, isPreOrderBag, notice, dismissNotice } = useCart();

    return (
        <div className="wrap pb-20 pt-8 md:pt-10">
            <Breadcrumbs items={[{ label: "Your bag" }]} />
            <h1 className="mt-6 text-h2 font-medium">Your bag</h1>

            {notice && (
                <div role="status" className="mt-6 flex items-start justify-between gap-3 rounded-lg bg-mango-soft px-4 py-3 text-[15px]">
                    <p>{notice}</p>
                    <button type="button" onClick={dismissNotice} className="shrink-0 underline underline-offset-4">
                        OK
                    </button>
                </div>
            )}

            {items.length === 0 ? (
                <div className="mt-10 rounded-card border border-line px-6 py-16 text-center">
                    <p className="text-lg font-medium">Your bag is empty</p>
                    <Link href="/shop" className="btn btn-ink mt-6">
                        Browse the shop
                    </Link>
                </div>
            ) : (
                <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14">
                    <div className="border-t border-line">
                        <CartLines />
                    </div>
                    <aside className="h-fit rounded-card bg-paper-2 p-6 lg:sticky lg:top-32">
                        <div className="flex items-baseline justify-between">
                            <span className="text-muted">Subtotal</span>
                            <span className="num text-2xl font-semibold">{taka(subtotal)}</span>
                        </div>
                        <p className="mt-2 text-[14px] leading-relaxed text-muted">
                            {isPreOrderBag
                                ? "This is a pre-booking. Checkout shows the advance you pay now and the balance due on delivery."
                                : "Delivery is charged by weight and zone. Checkout shows the exact total before you pay."}
                        </p>
                        <Link href="/checkout" className="btn btn-mango mt-6 w-full">
                            {isPreOrderBag ? "Continue to pre-booking" : "Checkout"}
                        </Link>
                        <Link href="/shop" className="mt-3 block text-center text-[14px] text-muted hover:text-ink">
                            Keep shopping
                        </Link>
                    </aside>
                </div>
            )}
        </div>
    );
}
