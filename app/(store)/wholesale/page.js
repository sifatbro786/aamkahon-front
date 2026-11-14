import Link from "next/link";

import InquiryForm from "@/components/product/InquiryForm";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { getProducts } from "@/lib/data/catalog";
import { plural, taka } from "@/lib/format";
import { WHOLESALE_TIER } from "@/lib/config";
import { unitOf } from "@/lib/store/productView";
import { SITE, whatsappText } from "@/lib/site";

export const metadata = {
    title: "Wholesale and export",
    description: "Wholesale mango and khejurer gur from Aamkahon, Rajshahi. Call or WhatsApp for a seasonal quote; export grade on request.",
    alternates: { canonical: "/wholesale" },
};

// Aamkahon sells wholesale by phone, in season, at prices agreed on the call
// (the order is then entered in Admin > New phone order). With the automatic
// tier switched on (lib/config.js) the first step describes that instead.
const STEPS = WHOLESALE_TIER
    ? [
          { t: "Add the boxes", d: "Order online as usual. Once a line reaches its wholesale count, the lower price is applied automatically at checkout." },
          { t: "Pay how you like", d: "Cash on delivery, bKash, Nagad or card. Pre-bookings take a small advance and the rest on delivery." },
          { t: "We pack and ship", d: "Ventilated cartons, weight based courier charges, to all 64 districts." },
      ]
    : [
          { t: "Call or send a request", d: "Tell us the variety, quantity and where it is going. Call, WhatsApp, or use the form below." },
          { t: "We quote for your order", d: "Wholesale prices move with the season and the harvest, so we quote each order and confirm the dispatch date." },
          { t: "We pack and ship", d: "Ventilated cartons, sent by courier or truck to all 64 districts. You get an invoice for every order." },
      ];

export default async function WholesalePage() {
    const { products } = WHOLESALE_TIER
        ? await getProducts({ wholesale: "true", limit: 50, sortBy: "displayOrder", sortOrder: "asc" })
        : { products: [] };
    // One row per pack size that has a wholesale price.
    const rows = products.flatMap((p) =>
        p.hasVariants
            ? (p.variants || []).filter((v) => v.wholesalePrice && v.price).map((v) => ({ p, pack: v.options.map((o) => o.value).join(" / "), retail: v.price, wholesale: v.wholesalePrice }))
            : p.wholesale?.price ? [{ p, pack: unitOf(p), retail: p.price, wholesale: p.wholesale.price }] : [],
    );

    return (
        <>
            <section className="bg-gur text-paper">
                <div className="wrap grid gap-10 py-16 md:py-24 lg:grid-cols-12">
                    <div className="lg:col-span-7">
                        <p className="label text-mango">Wholesale and export</p>
                        <h1 className="mt-4 text-display font-medium">{WHOLESALE_TIER ? "Bulk prices, without the paperwork" : "Wholesale, one phone call away"}</h1>
                        <p className="mt-6 max-w-xl text-lg leading-relaxed text-paper/75">
                            Shops, offices, sweet makers, wedding caterers and corporate gifting. Wholesale is taken in season, by phone, at a
                            price we agree for your order. For tonnes and export, we quote the same way.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <a href="#quote" className="btn btn-mango">
                                Ask for a quote
                            </a>
                            <a href={whatsappText("Hi Aamkahon, I want to buy wholesale.")} target="_blank" rel="noopener noreferrer" className="btn btn-ghost-light">
                                <WhatsAppIcon size={18} /> {SITE.phone}
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <section className="wrap py-16 md:py-20">
                <ol className="grid gap-px overflow-hidden rounded-card border border-line bg-line md:grid-cols-3">
                    {STEPS.map((s, i) => (
                        <li key={s.t} className="bg-paper p-6 md:p-8">
                            <span className="num text-[14px] text-mango-deep">{String(i + 1).padStart(2, "0")}</span>
                            <h2 className="mt-3 text-xl font-medium">{s.t}</h2>
                            <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.d}</p>
                        </li>
                    ))}
                </ol>
            </section>

            {rows.length > 0 && (
                <section className="wrap pb-16 md:pb-20" aria-labelledby="price-list">
                    <h2 id="price-list" className="text-h2 font-medium">
                        Wholesale price list
                    </h2>
                    <p className="mt-3 text-muted">Live prices from the shop. Pre-booking items lock this price with an advance.</p>
                    {/* Phones: one row per pack as a compact list; tablets up: the table. */}
                    <ul className="mt-8 divide-y divide-line border-y border-line sm:hidden">
                        {rows.map((r) => (
                            <li key={r.p._id + r.pack} className="flex items-start justify-between gap-4 py-4">
                                <div className="min-w-0">
                                    <Link href={`/product/${r.p.slug}`} className="font-medium">
                                        {r.p.name}
                                    </Link>
                                    <p className="text-[13px] text-muted">
                                        {r.pack} · from {r.p.wholesale.minQty} {plural(r.p.wholesale.minQty, unitOf(r.p))}
                                    </p>
                                </div>
                                <p className="num shrink-0 text-right">
                                    <span className="block font-semibold text-leaf-deep">{taka(r.wholesale)}</span>
                                    <span className="text-[13px] text-muted line-through">{taka(r.retail)}</span>
                                </p>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-8 hidden overflow-x-auto rounded-card border border-line sm:block">
                        <table className="w-full min-w-[640px] border-collapse text-left text-[15px]">
                            <thead className="bg-paper-2 text-[13px] text-muted">
                                <tr>
                                    <th scope="col" className="px-5 py-3 font-normal">Product</th>
                                    <th scope="col" className="px-5 py-3 font-normal">Pack</th>
                                    <th scope="col" className="px-5 py-3 text-right font-normal">Retail</th>
                                    <th scope="col" className="px-5 py-3 text-right font-normal">Wholesale</th>
                                    <th scope="col" className="px-5 py-3 text-right font-normal">From</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                                {rows.map((r) => (
                                    <tr key={r.p._id + r.pack}>
                                        <td className="px-5 py-4">
                                            <Link href={`/product/${r.p.slug}`} className="font-medium hover:text-mango-deep">
                                                {r.p.name}
                                            </Link>
                                            {r.p.availability === "pre_order" && <span className="ml-2 text-[12px] text-mango-deep">pre-booking</span>}
                                        </td>
                                        <td className="px-5 py-4 text-muted">{r.pack}</td>
                                        <td className="num px-5 py-4 text-right text-muted">{taka(r.retail)}</td>
                                        <td className="num px-5 py-4 text-right font-semibold text-leaf-deep">{taka(r.wholesale)}</td>
                                        <td className="num px-5 py-4 text-right">
                                            {r.p.wholesale.minQty} {plural(r.p.wholesale.minQty, unitOf(r.p))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            <section id="quote" className="scroll-mt-28 border-t border-line bg-paper-2/60">
                <div className="wrap grid gap-10 py-16 md:py-20 lg:grid-cols-12">
                    <div className="lg:col-span-5">
                        <h2 className="text-h2 font-medium">Export and large orders</h2>
                        <p className="mt-4 text-[16px] leading-relaxed text-muted">
                            Hand graded, hot water treated on request, packed to importer specification. Tell us the variety, volume and
                            destination, and we will call with a quote and the harvest window.
                        </p>
                    </div>
                    <div className="lg:col-span-7">
                        <InquiryForm type="wholesale" title="Request a quote" unit="kg" />
                    </div>
                </div>
            </section>
        </>
    );
}
