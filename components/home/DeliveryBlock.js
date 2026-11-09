import Image from "next/image";
import Link from "next/link";

import { taka } from "@/lib/format";

const ZONES = {
    "dhaka_inside|Home Delivery": "Inside Dhaka",
    "dhaka_sub|Home Delivery": "Dhaka suburbs",
    "outside_dhaka|Home Delivery": "Outside Dhaka, to your door",
    "outside_dhaka|Courier": "Outside Dhaka, courier pickup",
};

/**
 * Delivery charges read live from GET /api/checkout/shipping-rates (admin
 * editable), shown as the rule the backend applies: a base charge covers the
 * first few kilos, then a per kilo rate. This is a guide only; checkout prints
 * the exact charge for the shopper's address and weight.
 */
export default function DeliveryBlock({ rates = [] }) {
    const rows = rates.filter((r) => ZONES[`${r.locationType}|${r.deliveryType}`]);

    return (
        <section className="border-t border-line bg-paper-2/60" aria-labelledby="delivery-title">
            <div className="wrap grid items-center gap-12 py-16 md:py-24 lg:grid-cols-12">
                <div className="relative order-2 mx-auto w-full max-w-md lg:order-1 lg:col-span-5">
                    <Image
                        src="/images/bangladesh-64-districts-map.jpg"
                        alt="Map of Bangladesh with all 64 districts Aamkahon has delivered to"
                        width={1638}
                        height={2048}
                        sizes="(min-width: 1024px) 30vw, 90vw"
                        className="h-auto w-full rounded-card"
                    />
                </div>
                <div className="order-1 lg:order-2 lg:col-span-7">
                    <p className="label text-leaf-deep">Delivery</p>
                    <h2 id="delivery-title" className="mt-3 text-h2 font-medium">
                        All 64 districts, charged by weight
                    </h2>
                    <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-muted">
                        A 20 kg box of mangoes and a jar of gur should not cost the same to send, so they do not. The base
                        charge covers the first few kilos and each extra kilo adds a little.
                    </p>

                    {rows.length > 0 && (
                        <dl className="mt-8 divide-y divide-line border-y border-line">
                            {rows.map((r) => (
                                <div key={`${r.locationType}-${r.deliveryType}`} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4">
                                    <dt className="text-[16px]">{ZONES[`${r.locationType}|${r.deliveryType}`]}</dt>
                                    <dd className="num text-[15px] text-muted">
                                        <span className="font-medium text-ink">{taka(r.baseCharge)}</span>
                                        {r.perKgCharge > 0 ? ` up to ${r.baseWeightKg} kg, then ${taka(r.perKgCharge)} per kg` : " flat"}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    )}
                    <Link href="/delivery" className="link-u mt-6 inline-block font-medium">
                        Delivery details
                    </Link>
                </div>
            </div>
        </section>
    );
}
