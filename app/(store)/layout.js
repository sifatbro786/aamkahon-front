import { Suspense } from "react";

import CartDrawer from "@/components/cart/CartDrawer";
import SiteFooter from "@/components/layout/SiteFooter";
import OfferPopup from "@/components/layout/OfferPopup";
import SiteHeader from "@/components/layout/SiteHeader";
import { getHeaderIcons, getNavbar, getStorefront } from "@/lib/data/catalog";

async function Header() {
    const [nav, storefront, icons] = await Promise.all([getNavbar(), getStorefront(), getHeaderIcons()]);
    return <SiteHeader nav={nav} announcement={storefront.content.announcement} icons={icons} />;
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
            <OfferPopup />
        </>
    );
}
