import Link from "next/link";

import { dayMonth, taka } from "@/lib/format";
import { displayPrice, isPriceHidden, priceBasisLabel } from "@/lib/store/productView";

const MONTHS = ["May", "June", "July", "August"];

/**
 * Aamkahon publishes a mango calendar every year: which variety they pick on
 * which day (the district date plus a deliberate delay for full ripeness).
 * This renders the same thing from the pre-booking products, so updating a
 * product's expected date in the admin updates the calendar.
 */
export default function HarvestCalendar({ products = [] }) {
    const rows = products
        .filter((p) => p.availability === "pre_order" && p.preOrder?.expectedDate && p.category?.slug === "mango" && p.minOrderQty <= 1)
        .sort((a, b) => new Date(a.preOrder.expectedDate) - new Date(b.preOrder.expectedDate));
    if (!rows.length) return null;

    const year = new Date(rows[0].preOrder.expectedDate).getUTCFullYear();
    const start = Date.UTC(year, 4, 1); // 1 May
    const end = Date.UTC(year, 8, 1); // 1 September
    const at = (d) => Math.min(100, Math.max(0, ((new Date(d).getTime() - start) / (end - start)) * 100));

    return (
        <section className="border-y border-line bg-paper-2/60" aria-labelledby="calendar-title">
            <div className="wrap py-16 md:py-24">
                <div className="grid gap-6 md:grid-cols-12 md:items-end">
                    <div className="md:col-span-7">
                        <p className="label text-mango-deep">Harvest calendar {year}</p>
                        <h2 id="calendar-title" className="mt-3 text-h2 font-medium">
                            Every variety, the day we pick it
                        </h2>
                    </div>
                    <p className="text-[15px] leading-relaxed text-muted md:col-span-5">
                        The district administration sets a first harvest date for each variety. We wait five to twenty five days
                        longer so the fruit finishes ripening on the tree. Book a variety and it ships the week it is picked.
                    </p>
                </div>

                <div className="mt-12">
                    {/* Month ruler, desktop only */}
                    <div className="hidden grid-cols-12 gap-6 pb-3 md:grid">
                        <div className="col-span-3" />
                        <div className="relative col-span-6 grid grid-cols-4 text-[12px] text-muted">
                            {MONTHS.map((m) => (
                                <span key={m} className="border-l border-line pl-2">
                                    {m}
                                </span>
                            ))}
                        </div>
                    </div>

                    <ol className="border-t border-line">
                        {rows.map((p) => {
                            const pos = at(p.preOrder.expectedDate);
                            const hidden = isPriceHidden(p);
                            return (
                                <li key={p._id} className="border-b border-line">
                                    <Link href={`/product/${p.slug}`} className="group grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 py-4 md:grid-cols-12 md:gap-6 md:py-5">
                                        <div className="min-w-0 md:col-span-3">
                                            <p className="truncate text-lg font-medium tracking-tight group-hover:text-mango-deep">
                                                {p.name.replace(/ Mango$/, "")}
                                            </p>
                                            <p lang="bn" className="font-bangla text-[15px] text-muted">
                                                {p.nameBn}
                                            </p>
                                        </div>

                                        <div className="relative hidden h-8 md:col-span-6 md:block" aria-hidden>
                                            <div className="absolute inset-x-0 top-1/2 h-px bg-line" />
                                            <div className="absolute top-1/2 h-px bg-mango" style={{ left: 0, width: `${pos}%` }} />
                                            <span
                                                className="absolute top-1/2 grid size-3.5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-mango ring-4 ring-paper"
                                                style={{ left: `${pos}%` }}
                                            />
                                        </div>

                                        <p className="num text-right text-[15px] md:hidden">{dayMonth(p.preOrder.expectedDate)}</p>

                                        <div className="col-span-2 flex items-baseline justify-between gap-3 md:col-span-3 md:justify-end">
                                            <span className="num hidden text-[15px] md:inline">{dayMonth(p.preOrder.expectedDate)}</span>
                                            <span className="text-[14px] text-muted md:min-w-[150px] md:text-right">
                                                {hidden ? (
                                                    "Price before harvest"
                                                ) : (
                                                    <>
                                                        <span className="num font-medium text-ink">{taka(displayPrice(p))}</span> / {priceBasisLabel(p)}
                                                    </>
                                                )}
                                            </span>
                                        </div>
                                    </Link>
                                </li>
                            );
                        })}
                    </ol>
                    <p className="mt-4 text-[13px] text-muted">
                        Dates follow the Aamkahon mango calendar and can move a few days with the weather.
                    </p>
                </div>
            </div>
        </section>
    );
}
