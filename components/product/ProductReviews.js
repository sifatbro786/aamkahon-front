import Stars from "@/components/ui/Stars";
import { fullDate } from "@/lib/format";

const isBangla = (t) => /[ঀ-৿]/.test(t);

/**
 * Approved reviews from GET /api/reviews/product/:id. Writing a review needs an
 * account and a delivered order (backend rule), so the form lives in the
 * account area, not here.
 */
export default function ProductReviews({ data }) {
    const { reviews, averageRating, totalReviews, ratingStats } = data;
    if (!totalReviews) return null;
    const max = Math.max(1, ...ratingStats.map((s) => s.count));

    return (
        <section className="wrap border-t border-line py-14 md:py-20" aria-labelledby="reviews-title">
            <div className="grid gap-10 lg:grid-cols-12">
                <div className="lg:col-span-4">
                    <h2 id="reviews-title" className="text-2xl font-medium tracking-tight md:text-3xl">
                        What buyers say
                    </h2>
                    <div className="mt-6 flex items-end gap-3">
                        <span className="num text-5xl font-medium leading-none">{averageRating.toFixed(1)}</span>
                        <div className="pb-1">
                            <Stars value={averageRating} size={16} />
                            <p className="mt-1 text-[14px] text-muted">
                                {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                            </p>
                        </div>
                    </div>
                    <ul className="mt-6 space-y-1.5">
                        {[5, 4, 3, 2, 1].map((n) => {
                            const c = ratingStats.find((s) => s._id === n)?.count || 0;
                            return (
                                <li key={n} className="flex items-center gap-3 text-[13px] text-muted">
                                    <span className="num w-3">{n}</span>
                                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper-3">
                                        <span className="block h-full rounded-full bg-mango" style={{ width: `${(c / max) * 100}%` }} />
                                    </span>
                                    <span className="num w-4 text-right">{c}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <ul className="divide-y divide-line border-y border-line lg:col-span-8">
                    {reviews.map((r) => (
                        <li key={r._id} className="py-6">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <Stars value={r.rating} />
                                <span className="text-[13px] text-muted">{fullDate(r.createdAt)}</span>
                            </div>
                            <p lang={isBangla(r.comment) ? "bn" : undefined} className={`mt-3 leading-relaxed text-ink/85 ${isBangla(r.comment) ? "font-bangla text-[18px]" : "text-[16px]"}`}>
                                {r.comment}
                            </p>
                            <p className="mt-3 text-[14px] font-medium">{r.user?.name || "Customer"}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
