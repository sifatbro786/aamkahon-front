// Unmatched URLs land here, outside the (store) layout, so the header and
// footer are rendered explicitly.
import { Suspense } from "react";

import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import NotFoundContent from "@/components/ui/NotFoundContent";
import { getNavbar } from "@/lib/data/catalog";

export const metadata = { title: "Page not found" };

async function Header() {
    return <SiteHeader nav={await getNavbar()} />;
}

export default function NotFound() {
    return (
        <>
            <Suspense fallback={<SiteHeader nav={[]} />}>
                <Header />
            </Suspense>
            <main className="flex-1">
                <NotFoundContent />
            </main>
            <SiteFooter />
        </>
    );
}
