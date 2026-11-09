import Link from "next/link";

import Stars from "@/components/ui/Stars";

const isBangla = (t) => /[ঀ-৿]/.test(t);

/** Homepage quotes from GET /api/reviews/featured (approved, 4+ stars). */
export default function Testimonials({ reviews = [] }) {
    if (reviews.length < 2) return null;
    const [lead, ...rest] = reviews;

    return (
        <section className="py-16 md:py-24" aria-labelledby="quotes-title">
            <div className="wrap grid gap-12 lg:grid-cols-12">
                <div className="lg:col-span-5">
                    <p className="label text-mango-deep">From our buyers</p>
                    <h2 id="quotes-title" className="sr-only">
                        Customer reviews
                    </h2>
                    <figure className="mt-6">
                        <Stars value={lead.rating} size={18} />
                        <blockquote lang={isBangla(lead.comment) ? "bn" : undefined} className={`mt-5 leading-snug tracking-tight ${isBangla(lead.comment) ? "font-bangla text-[28px]" : "text-[clamp(1.6rem,1.2rem+1.4vw,2.3rem)] font-medium"}`}>
                            {lead.comment}
                        </blockquote>
                        <figcaption className="mt-6 text-[15px]">
                            <span className="font-medium">{lead.user?.name}</span>
                            {lead.product && (
                                <>
                                    <span className="text-muted"> on </span>
                                    <Link href={`/product/${lead.product.slug}`} className="link-u text-muted">
                                        {lead.product.name}
                                    </Link>
                                </>
                            )}
                        </figcaption>
                    </figure>
                </div>
                <ul className="grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:col-span-7">
                    {rest.slice(0, 4).map((r) => (
                        <li key={r._id} className="flex flex-col bg-paper p-6">
                            <Stars value={r.rating} />
                            <p lang={isBangla(r.comment) ? "bn" : undefined} className={`mt-4 flex-1 leading-relaxed text-ink/85 ${isBangla(r.comment) ? "font-bangla text-[17px]" : "text-[15px]"}`}>
                                {r.comment}
                            </p>
                            <p className="mt-5 text-[14px]">
                                <span className="font-medium">{r.user?.name}</span>
                                {r.product && <span className="block text-[13px] text-muted">{r.product.name}</span>}
                            </p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
