import { Suspense } from "react";

import CartDrawer from "@/components/cart/CartDrawer";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import { getNavbar } from "@/lib/data/catalog";

async function Header() {
    const nav = await getNavbar();
    return <SiteHeader nav={nav} />;
}

export default function StoreLayout({ children }) {
    return (
        <>
            <Suspense fallback={<SiteHeader nav={[]} />}>
                <Header />
            </Suspense>
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <CartDrawer />
        </>
    );
}
