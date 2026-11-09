"use client";
import { Menu, Phone, Search, ShoppingBag, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { navHref } from "@/lib/nav";
import { SITE } from "@/lib/site";

export default function SiteHeader({ nav = [] }) {
    const pathname = usePathname();
    const { itemCount, openCart } = useCart();
    const { isAuthenticated, isAdmin } = useAuth();
    // The menu remembers which page it was opened on, so navigating closes it
    // without an effect: a new pathname simply no longer matches.
    const [menuPath, setMenuPath] = useState(null);
    const open = menuPath === pathname;
    const setOpen = (v) => setMenuPath(v ? pathname : null);

    // Lock page scroll while the menu is open.
    useEffect(() => {
        document.documentElement.style.overflow = open ? "hidden" : "";
        return () => {
            document.documentElement.style.overflow = "";
        };
    }, [open]);

    const links = [{ name: "Shop all", href: "/shop" }, ...nav.map((i) => ({ name: i.name, href: navHref(i) }))];
    const accountHref = isAuthenticated ? (isAdmin ? "/admin" : "/account") : "/login";

    return (
        <header className="sticky top-0 z-40 bg-ink text-paper">
            <div className="hidden border-b border-line-dark md:block">
                <div className="wrap flex h-9 items-center justify-between text-[13px] text-paper/70">
                    <p>
                        <span className="text-mango">2027 mango pre-booking is open.</span> Khejurer gur is in stock now.
                    </p>
                    <a href={SITE.phoneHref} className="inline-flex items-center gap-1.5 hover:text-paper">
                        <Phone size={13} aria-hidden /> Call or WhatsApp <span className="num">{SITE.phone}</span>
                    </a>
                </div>
            </div>

            <div className="wrap flex h-16 items-center gap-4 md:h-[72px]">
                <button
                    type="button"
                    className="-ml-2 grid size-10 place-items-center rounded-full hover:bg-ink-soft lg:hidden"
                    onClick={() => setOpen(true)}
                    aria-label="Open menu"
                >
                    <Menu size={22} />
                </button>

                <Link href="/" className="shrink-0" aria-label="Aamkahon home">
                    <Image src="/images/logo-lockup.png" alt="Aamkahon, the story of mangoes" width={747} height={160} priority className="h-8 w-auto md:h-10" />
                </Link>

                <nav className="ml-6 hidden flex-1 items-center gap-7 lg:flex" aria-label="Main">
                    {links.map((l) => (
                        <Link key={l.href + l.name} href={l.href} className="text-[15px] text-paper/80 transition-colors hover:text-paper">
                            {l.name}
                        </Link>
                    ))}
                </nav>

                <div className="ml-auto flex items-center gap-1">
                    <Link href="/shop" className="grid size-10 place-items-center rounded-full hover:bg-ink-soft" aria-label="Search the shop">
                        <Search size={20} />
                    </Link>
                    <Link href={accountHref} className="grid size-10 place-items-center rounded-full hover:bg-ink-soft" aria-label={isAuthenticated ? "Your account" : "Sign in"}>
                        <User size={20} />
                    </Link>
                    <button type="button" onClick={openCart} className="relative grid size-10 place-items-center rounded-full hover:bg-ink-soft" aria-label={`Bag, ${itemCount} items`}>
                        <ShoppingBag size={20} />
                        {itemCount > 0 && (
                            <span className="num absolute right-0.5 top-0.5 grid min-w-[18px] place-items-center rounded-full bg-mango px-1 text-[11px] font-semibold leading-[18px] text-ink">
                                {itemCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {open && (
                <div className="fixed inset-0 z-50 flex flex-col bg-ink lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
                    <div className="wrap flex h-16 items-center justify-between">
                        <Image src="/images/logo-lockup.png" alt="" width={747} height={160} className="h-8 w-auto" />
                        <button type="button" onClick={() => setOpen(false)} className="-mr-2 grid size-10 place-items-center rounded-full hover:bg-ink-soft" aria-label="Close menu">
                            <X size={22} />
                        </button>
                    </div>
                    <nav className="wrap mt-6 flex flex-col" aria-label="Mobile">
                        {links.map((l) => (
                            <Link key={l.href + l.name} href={l.href} className="border-b border-line-dark py-4 text-2xl font-medium tracking-tight">
                                {l.name}
                            </Link>
                        ))}
                    </nav>
                    <div className="wrap mt-auto pb-8 text-paper/70">
                        <p className="label text-paper/50">Order by phone</p>
                        <a href={SITE.phoneHref} className="num mt-2 block text-2xl text-mango">
                            {SITE.phone}
                        </a>
                    </div>
                </div>
            )}
        </header>
    );
}
