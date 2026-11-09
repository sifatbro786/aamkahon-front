import Link from "next/link";

import ProductCard from "@/components/product/ProductCard";

/**
 * One homepage section from GET /api/products/homepage-sections (admin
 * managed, attribute based). Phones get a swipeable row that scrolls inside
 * its own box, so the page itself never scrolls sideways.
 */
export default function ProductShelf({ section, href }) {
    const products = section.products || [];
    if (!products.length) return null;

    return (
        <section className="py-14 md:py-20" aria-labelledby={`shelf-${section._id}`}>
            <div className="wrap flex flex-wrap items-end justify-between gap-4">
                <div className="max-w-2xl">
                    <h2 id={`shelf-${section._id}`} className="text-h2 font-medium">
                        {section.title}
                    </h2>
                    {section.description && <p className="mt-3 text-[16px] text-muted">{section.description}</p>}
                </div>
                {href && (
                    <Link href={href} className="link-u font-medium">
                        View all
                    </Link>
                )}
            </div>

            <div className="wrap mt-10">
                <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 sm:overflow-visible sm:px-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
                    {products.map((p) => (
                        <li key={p._id} className="w-[72%] shrink-0 snap-start sm:w-auto">
                            <ProductCard product={p} />
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
