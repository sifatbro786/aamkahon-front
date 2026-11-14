import { MessageCircle } from "lucide-react";
import Link from "next/link";

import { plural, taka } from "@/lib/format";
import { cheapestVariant, priceBasisLabel, unitOf, wholesaleTier } from "@/lib/store/productView";
import { SITE, whatsappText } from "@/lib/site";

/**
 * Wholesale band. Aamkahon takes wholesale by phone (no automatic tier,
 * lib/config.js WHOLESALE_TIER), so it invites a call. When a store turns the
 * tier on, the table shows a real product's retail vs wholesale numbers.
 */
export default function WholesaleBand({ example }) {
    const variant = example ? cheapestVariant(example) : null;
    const tier = example ? wholesaleTier(example, variant) : null;
    const unit = example ? unitOf(example) : "box";

    return (
        <section className="bg-gur text-paper" aria-labelledby="wholesale-title">
            <div className="wrap grid gap-12 py-16 md:py-24 lg:grid-cols-12 lg:gap-10">
                <div className="lg:col-span-5">
                    <p className="label text-mango">Wholesale</p>
                    <h2 id="wholesale-title" className="mt-3 text-h2 font-medium">
                        Buying for a shop, an office or a wedding?
                    </h2>
                    <p className="mt-5 max-w-md text-[17px] leading-relaxed text-paper/75">
                        {tier
                            ? "Wholesale prices apply on their own once your order reaches the box count. For tonnes and export, we quote."
                            : "Call or WhatsApp us with the variety and quantity. We quote a price for your order, in season, and arrange the delivery."}
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link href="/wholesale" className="btn btn-mango">
                            How wholesale works
                        </Link>
                        <a href={whatsappText("Hi Aamkahon, I want a wholesale quote.")} target="_blank" rel="noopener noreferrer" className="btn btn-ghost-light">
                            <MessageCircle size={17} aria-hidden /> WhatsApp {SITE.phone}
                        </a>
                    </div>
                </div>

                {tier && (
                    <div className="lg:col-span-7">
                        <p className="text-[15px] text-paper/60">
                            Example: {example.name}, {priceBasisLabel(example, variant)}
                        </p>
                        <table className="mt-4 w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-paper/20 text-[13px] text-paper/50">
                                    <th scope="col" className="py-3 pr-4 font-normal">You order</th>
                                    <th scope="col" className="py-3 pr-4 font-normal">Price</th>
                                    <th scope="col" className="hidden py-3 font-normal sm:table-cell">How</th>
                                </tr>
                            </thead>
                            <tbody className="text-[16px]">
                                <tr className="border-b border-paper/15">
                                    <td className="num py-5 pr-4">1 to {tier.minQty - 1} {plural(2, unit)}</td>
                                    <td className="num py-5 pr-4">{taka(tier.retail)} each</td>
                                    <td className="hidden py-5 text-paper/60 sm:table-cell">Retail, add to bag</td>
                                </tr>
                                <tr className="border-b border-paper/15 bg-paper/5">
                                    <td className="num py-5 pr-4 font-medium text-mango">{tier.minQty}+ {plural(2, unit)}</td>
                                    <td className="num py-5 pr-4 font-medium text-mango">
                                        {taka(tier.price)} each <span className="ml-1 text-[13px] font-normal text-paper/60">save {tier.savingPct}%</span>
                                    </td>
                                    <td className="hidden py-5 text-paper/60 sm:table-cell">Applied at checkout</td>
                                </tr>
                                <tr className="border-b border-paper/15">
                                    <td className="py-5 pr-4">500 kg and over</td>
                                    <td className="py-5 pr-4">On quote</td>
                                    <td className="hidden py-5 text-paper/60 sm:table-cell">Export grade, we call you</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    );
}
