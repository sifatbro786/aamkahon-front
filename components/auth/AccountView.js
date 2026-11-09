"use client";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import OrderDetails, { statusLabel } from "@/components/order/OrderDetails";
import { useAuth } from "@/context/AuthContext";
import { myOrders } from "@/lib/api/checkoutApi";
import { IS_STATIC } from "@/lib/config";
import { fullDate, taka } from "@/lib/format";

export default function AccountView() {
    const { user, loading, isAdmin, logout } = useAuth();
    const router = useRouter();
    const [open, setOpen] = useState(null);

    useEffect(() => {
        if (!loading && !user) router.replace("/login?next=/account");
    }, [loading, user, router]);

    const { data: orders = [], isLoading } = useQuery({
        queryKey: ["my-orders", user?._id],
        queryFn: () => myOrders().then((r) => r.data?.orders ?? []),
        enabled: Boolean(user) && !IS_STATIC,
    });

    if (loading || !user) return <div className="wrap py-24" aria-busy="true" />;

    return (
        <div className="wrap max-w-4xl py-14 md:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="label text-mango-deep">Your account</p>
                    <h1 className="mt-3 text-h2 font-medium">Hello, {user.name?.split(" ")[0]}</h1>
                    <p className="mt-2 text-muted">{user.email}</p>
                </div>
                <div className="flex gap-3">
                    {isAdmin && (
                        <Link href="/admin" className="btn btn-ink">
                            Admin dashboard
                        </Link>
                    )}
                    <button
                        type="button"
                        onClick={async () => {
                            await logout();
                            router.replace("/");
                        }}
                        className="btn btn-ghost"
                    >
                        <LogOut size={16} aria-hidden /> Sign out
                    </button>
                </div>
            </div>

            <section className="mt-14">
                <h2 className="text-xl font-medium">Orders and pre-bookings</h2>
                {isLoading ? (
                    <div className="mt-6 h-32 animate-pulse rounded-card bg-paper-2" />
                ) : orders.length === 0 ? (
                    <div className="mt-6 rounded-card border border-line px-6 py-12 text-center">
                        <p className="font-medium">No orders yet</p>
                        <Link href="/shop" className="btn btn-ink mt-5">
                            Browse the shop
                        </Link>
                    </div>
                ) : (
                    <ul className="mt-6 divide-y divide-line border-y border-line">
                        {orders.map((o) => (
                            <li key={o._id}>
                                <button type="button" onClick={() => setOpen(open === o._id ? null : o._id)} className="flex w-full flex-wrap items-center gap-x-6 gap-y-1 py-5 text-left" aria-expanded={open === o._id}>
                                    <span className="num font-medium">{o.orderNumber}</span>
                                    <span className="text-[14px] text-muted">{fullDate(o.createdAt)}</span>
                                    <span className="text-[14px]">{statusLabel(o.orderStatus)}</span>
                                    <span className="num ml-auto font-medium">{taka(o.totalPrice)}</span>
                                    <ChevronDown size={18} className={`transition-transform ${open === o._id ? "rotate-180" : ""}`} aria-hidden />
                                </button>
                                {open === o._id && (
                                    <div className="pb-8">
                                        <OrderDetails order={o} />
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
