"use client";
import { ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import CartLines from "@/components/cart/CartLines";
import { useCart } from "@/context/CartContext";
import { taka } from "@/lib/format";

export default function CartDrawer() {
    const { isOpen, closeCart, items, subtotal, notice, dismissNotice, isPreOrderBag } = useCart();
    const pathname = usePathname();
    const panel = useRef(null);
    const lastPath = useRef(pathname);

    // Close when the route changes (link inside the drawer, back button).
    useEffect(() => {
        if (lastPath.current !== pathname) {
            lastPath.current = pathname;
            if (isOpen) closeCart();
        }
    }, [pathname, isOpen, closeCart]);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => e.key === "Escape" && closeCart();
        document.addEventListener("keydown", onKey);
        document.documentElement.style.overflow = "hidden";
        panel.current?.focus();
        return () => {
            document.removeEventListener("keydown", onKey);
            document.documentElement.style.overflow = "";
        };
    }, [isOpen, closeCart]);

    return (
        <div className={`fixed inset-0 z-50 transition-[visibility] duration-500 ${isOpen ? "visible" : "pointer-events-none invisible"}`} aria-hidden={!isOpen}>
            <div className={`absolute inset-0 bg-ink/50 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`} onClick={closeCart} />
            <aside
                ref={panel}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-label="Your bag"
                className={`absolute right-0 top-0 flex h-full w-full max-w-[440px] flex-col bg-paper outline-none transition-transform duration-500 ease-[var(--ease-out-soft)] ${isOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                <header className="flex items-center justify-between border-b border-line px-5 py-4">
                    <h2 className="text-lg font-medium">
                        Your bag {items.length > 0 && <span className="num text-muted">({items.length})</span>}
                    </h2>
                    <button type="button" onClick={closeCart} className="grid size-10 place-items-center rounded-full hover:bg-paper-2" aria-label="Close bag">
                        <X size={20} />
                    </button>
                </header>

                {notice && (
                    <div role="status" className="flex items-start justify-between gap-3 border-b border-line bg-mango-soft px-5 py-3 text-[14px]">
                        <p>{notice}</p>
                        <button type="button" onClick={dismissNotice} className="shrink-0 text-[13px] underline underline-offset-4">
                            OK
                        </button>
                    </div>
                )}

                {items.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                        <ShoppingBag size={36} className="text-line" aria-hidden />
                        <p className="mt-4 text-lg font-medium">Your bag is empty</p>
                        <p className="mt-2 text-[15px] text-muted">Pre-book next season&apos;s mangoes or pick up some winter gur.</p>
                        <Link href="/shop" className="btn btn-ink mt-6">
                            Browse the shop
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto px-5">
                            <CartLines compact />
                        </div>
                        <footer className="border-t border-line px-5 pb-6 pt-4">
                            <div className="flex items-baseline justify-between">
                                <span className="text-muted">Subtotal</span>
                                <span className="num text-xl font-semibold">{taka(subtotal)}</span>
                            </div>
                            <p className="mt-1 text-[13px] text-muted">
                                {isPreOrderBag
                                    ? "Pre-booking: you pay an advance now, the rest on delivery. Exact figures at checkout."
                                    : "Delivery is charged by weight and calculated at checkout."}
                            </p>
                            <Link href="/checkout" className="btn btn-mango mt-4 w-full">
                                {isPreOrderBag ? "Continue to pre-booking" : "Checkout"}
                            </Link>
                            <Link href="/cart" className="mt-2 block py-2 text-center text-[14px] text-muted hover:text-ink">
                                View full bag
                            </Link>
                        </footer>
                    </>
                )}
            </aside>
        </div>
    );
}
