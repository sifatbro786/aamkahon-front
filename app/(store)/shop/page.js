import Link from "next/link";
import { Suspense } from "react";

import ProductCard from "@/components/product/ProductCard";
import ShopToolbar, { ShopFilters } from "@/components/shop/ShopControls";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { shopHref, toApiParams } from "@/lib/catalogParams";
import { getCategories, getProducts } from "@/lib/data/catalog";

export const metadata = {
    title: "Shop mangoes and khejurer gur",
    description: "Rajshahi mangoes for 2027 pre-booking, winter khejurer gur and farm pantry staples. Retail and wholesale prices.",
    alternates: { canonical: "/shop" },
};

const pick = (sp, k) => (Array.isArray(sp[k]) ? sp[k][0] : sp[k]) || "";

async function Catalogue({ searchParams }) {
    const sp = await searchParams;
    const current = {
        q: pick(sp, "q"),
        category: pick(sp, "category"),
        availability: pick(sp, "availability"),
        wholesale: pick(sp, "wholesale"),
        sort: pick(sp, "sort"),
        page: pick(sp, "page"),
    };
    const [{ products, total, totalPages, currentPage }, categories] = await Promise.all([getProducts(toApiParams(sp)), getCategories()]);
    const activeCat = categories.find((c) => c.slug === current.category);
    const title = current.q
        ? `Results for “${current.q}”`
        : activeCat?.name || (current.availability === "pre_order" ? "Pre-book the 2027 season" : current.availability === "in_stock" ? "In season now" : "The shop");

    return (
        <div className="wrap pb-20 pt-8 md:pt-10">
            <Breadcrumbs items={[{ label: "Shop", href: "/shop" }, ...(activeCat ? [{ label: activeCat.name }] : [])]} />
            <header className="mt-6 max-w-3xl">
                <h1 className="text-h2 font-medium">{title}</h1>
                {activeCat?.description && <p className="mt-3 text-[16px] leading-relaxed text-muted">{activeCat.description}</p>}
            </header>

            <div className="mt-10 grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12">
                <aside className="hidden lg:block">
                    <div className="sticky top-32">
                        <ShopFilters current={current} categories={categories} />
                    </div>
                </aside>

                <div className="min-w-0">
                    <ShopToolbar key={current.q} current={current} categories={categories} total={total} />

                    {products.length === 0 ? (
                        <div className="mt-10 rounded-card border border-dashed border-line px-6 py-16 text-center">
                            <p className="text-lg font-medium">Nothing matches those filters</p>
                            <p className="mt-2 text-muted">Try fewer filters, or ask us. We may have it off the list.</p>
                            <Link href="/shop" className="btn btn-ink mt-6">
                                Clear filters
                            </Link>
                        </div>
                    ) : (
                        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 xl:grid-cols-3">
                            {products.map((p, i) => (
                                <li key={p._id}>
                                    <ProductCard product={p} priority={i < 3} sizes="(min-width: 1280px) 28vw, (min-width: 1024px) 38vw, 48vw" />
                                </li>
                            ))}
                        </ul>
                    )}

                    {totalPages > 1 && (
                        <nav className="mt-14 flex items-center justify-center gap-2" aria-label="Pagination">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                                <Link
                                    key={n}
                                    href={shopHref(current, { page: String(n) })}
                                    aria-current={n === currentPage ? "page" : undefined}
                                    className={`num grid size-11 place-items-center rounded-full border ${n === currentPage ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"}`}
                                >
                                    {n}
                                </Link>
                            ))}
                        </nav>
                    )}
                </div>
            </div>
        </div>
    );
}

function CatalogueSkeleton() {
    return (
        <div className="wrap pb-20 pt-10" aria-busy="true">
            <div className="h-4 w-32 rounded bg-paper-3" />
            <div className="mt-8 h-12 w-72 rounded bg-paper-3" />
            <div className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="aspect-[4/5] animate-pulse rounded-card bg-paper-2" />
                ))}
            </div>
        </div>
    );
}

// searchParams is request data: the catalogue streams in behind a static shell.
export default function ShopPage({ searchParams }) {
    return (
        <Suspense fallback={<CatalogueSkeleton />}>
            <Catalogue searchParams={searchParams} />
        </Suspense>
    );
}
