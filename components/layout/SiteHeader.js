"use client";
import { Menu, Phone, Search, ShoppingBag, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { activeHref } from "@/lib/activeLink";
import { navHref } from "@/lib/nav";
import { SITE } from "@/lib/site";

/**
 * Nav links with the current one marked. Reading the query string needs
 * useSearchParams, which must sit under <Suspense> with Cache Components;
 * the fallback renders the same links unmarked (path-only match), so the
 * header never jumps.
 */
function NavLinks({ links, variant }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    return <LinkList links={links} variant={variant} active={activeHref(links, pathname, searchParams)} />;
}

function LinkList({ links, variant, active }) {
    return links.map((l) => {
        const on = l.href === active;
        return variant === "mobile" ? (
            <Link
                key={l.href + l.name}
                href={l.href}
                aria-current={on ? "page" : undefined}
                className={`flex items-center justify-between border-b border-line-dark py-4 text-2xl font-medium tracking-tight ${on ? "text-mango" : ""}`}
            >
                {l.name}
                {on && <span className="size-2 rounded-full bg-mango" aria-hidden />}
            </Link>
        ) : (
            <Link
                key={l.href + l.name}
                href={l.href}
                aria-current={on ? "page" : undefined}
                // Active: full white text and a short mango rule under the word,
                // drawn with a pseudo element so the row height never changes.
                className={`relative py-1 text-[15px] transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:rounded-full after:bg-mango after:transition-all ${on ? "text-paper after:w-full" : "text-paper/75 after:w-0 hover:text-paper"}`}
            >
                {l.name}
            </Link>
        );
    });
}

function Links({ links, variant }) {
    const pathname = usePathname();
    // Fallback while search params resolve: match on path only.
    const pathOnly = activeHref(links.filter((l) => !l.href.includes("?")), pathname, null);
    return (
        <Suspense fallback={<LinkList links={links} variant={variant} active={pathOnly} />}>
            <NavLinks links={links} variant={variant} />
        </Suspense>
    );
}

export default function SiteHeader({ nav = [], announcement }) {
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
                    {/* Admin > Homepage & season (per season). Empty = the default line. */}
                    <p className="min-w-0 truncate text-mango">{announcement || "Rajshahi mangoes, khejurer gur and gawa ghee."}</p>
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
                    <Links links={links} variant="desktop" />
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
                        <Links links={links} variant="mobile" />
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
