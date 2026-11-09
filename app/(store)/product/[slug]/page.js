import { notFound } from "next/navigation";

import AplusContent from "@/components/product/AplusContent";
import BuyBox from "@/components/product/BuyBox";
import InquiryForm from "@/components/product/InquiryForm";
import ProductCard from "@/components/product/ProductCard";
import ProductGallery from "@/components/product/ProductGallery";
import Badge from "@/components/ui/Badge";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { SITE_URL } from "@/lib/config";
import { getProductBySlug, getProducts, getRelated } from "@/lib/data/catalog";
import { fullDate } from "@/lib/format";
import { allImages, mediaUrl } from "@/lib/media";
import { availabilityBadge, displayPrice, harvestDate, isPriceHidden, unitOf } from "@/lib/store/productView";

const PLACEHOLDER = "__placeholder__";

// Cache Components needs at least one param at build. If the API is down
// during a VPS build there are none, so a placeholder keeps the build green;
// real slugs render on first request and are cached.
export async function generateStaticParams() {
    const { products } = await getProducts({ limit: 200 });
    return products.length ? products.map((p) => ({ slug: p.slug })) : [{ slug: PLACEHOLDER }];
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const product = slug === PLACEHOLDER ? null : await getProductBySlug(slug);
    if (!product) return { title: "Product not found" };
    const img = allImages(product)[0];
    const description = (product.description || "").slice(0, 155);
    return {
        title: product.nameBn ? `${product.name} (${product.nameBn})` : product.name,
        description,
        alternates: { canonical: `/product/${product.slug}` },
        openGraph: { title: product.name, description, images: img ? [{ url: img.src }] : undefined },
    };
}

export default async function ProductPage({ params }) {
    const { slug } = await params;
    if (slug === PLACEHOLDER) notFound();
    const product = await getProductBySlug(slug);
    if (!product || product.isActive === false) notFound();

    const related = await getRelated(product, 4);
    const images = allImages(product);
    const badge = availabilityBadge(product);
    const hidden = isPriceHidden(product);
    const harvest = harvestDate(product);
    const cat = product.subCategory || product.category;
    const facts = (product.attributes || []).filter((a) => a.key !== "Season");

    const price = displayPrice(product);
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        alternateName: product.nameBn,
        description: product.description,
        sku: product.sku,
        brand: { "@type": "Brand", name: "Aamkahon" },
        image: images.map((i) => (i.src.startsWith("http") ? i.src : `${SITE_URL}${i.src}`)),
        ...(hidden || price == null
            ? {}
            : {
                  offers: {
                      "@type": "Offer",
                      priceCurrency: "BDT",
                      price,
                      url: `${SITE_URL}/product/${product.slug}`,
                      availability:
                          product.availability === "pre_order" ? "https://schema.org/PreOrder" : badge.label === "Sold out" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
                  },
              }),
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
            <div className="wrap pb-16 pt-8 md:pt-10">
                <Breadcrumbs
                    items={[
                        { label: "Shop", href: "/shop" },
                        ...(product.category ? [{ label: product.category.name, href: `/shop?category=${product.category.slug}` }] : []),
                        { label: product.name },
                    ]}
                />

                <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
                    <ProductGallery images={images.length ? images : [{ src: mediaUrl(null), alt: product.name }]} name={product.name} />

                    <div className="min-w-0 lg:pt-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge tone={badge.tone}>{badge.label}</Badge>
                            {cat && <span className="text-[14px] text-muted">{cat.name}</span>}
                        </div>
                        <h1 className="mt-4 text-[clamp(2rem,1.4rem+2.4vw,3.2rem)] font-medium leading-[1.05] tracking-tight">{product.name}</h1>
                        {product.nameBn && (
                            <p lang="bn" className="font-bangla mt-2 text-2xl text-mango-deep">
                                {product.nameBn}
                            </p>
                        )}
                        {product.description && <p className="mt-6 text-[17px] leading-relaxed text-ink/80">{product.description}</p>}

                        <div className="mt-8 border-t border-line pt-8">
                            {hidden ? (
                                <>
                                    <p className="text-2xl font-medium">{product.priceVisibility === "tba" ? "Price to be announced" : "Price on request"}</p>
                                    <p className="mt-2 text-[15px] text-muted">
                                        {product.priceVisibility === "tba"
                                            ? `We confirm this price once the crop is set${harvest ? `, before the ${fullDate(harvest)} harvest` : ""}. Leave your number and we will call you first.`
                                            : `Priced to order by volume and destination${product.minOrderQty > 1 ? `, minimum ${product.minOrderQty} ${unitOf(product)}` : ""}. Send your requirement and we will quote.`}
                                    </p>
                                    <div className="mt-6">
                                        <InquiryForm
                                            type={product.priceVisibility === "tba" ? "pre_booking" : "price"}
                                            product={product}
                                            unit={unitOf(product)}
                                            defaultQty={product.minOrderQty > 1 ? product.minOrderQty : ""}
                                            title={product.priceVisibility === "tba" ? "Reserve a call back" : "Ask for a quote"}
                                        />
                                    </div>
                                </>
                            ) : (
                                <BuyBox product={product} />
                            )}
                        </div>

                        {(product.bulletPoints?.length > 0 || facts.length > 0) && (
                            <div className="mt-10 grid gap-8 border-t border-line pt-8 sm:grid-cols-2">
                                {product.bulletPoints?.length > 0 && (
                                    <ul className="space-y-3 text-[15px]">
                                        {product.bulletPoints.map((b) => (
                                            <li key={b} className="flex gap-3">
                                                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-mango" aria-hidden />
                                                {b}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {facts.length > 0 && (
                                    <dl className="divide-y divide-line border-y border-line text-[15px]">
                                        {facts.map((f) => (
                                            <div key={f.key} className="flex justify-between gap-4 py-2.5">
                                                <dt className="text-muted">{f.key}</dt>
                                                <dd className="text-right">{f.value}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {product.aplusContent && (
                    <div className="mx-auto mt-16 max-w-3xl border-t border-line pt-12">
                        <AplusContent content={product.aplusContent} />
                    </div>
                )}
            </div>

            {related.length > 0 && (
                <section className="border-t border-line bg-paper-2/50 py-14 md:py-20" aria-labelledby="related-title">
                    <div className="wrap">
                        <h2 id="related-title" className="text-2xl font-medium tracking-tight md:text-3xl">
                            From the same {product.category?.slug === "mango" ? "orchards" : "kitchen"}
                        </h2>
                        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
                            {related.map((p) => (
                                <li key={p._id}>
                                    <ProductCard product={p} />
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            )}
        </>
    );
}
