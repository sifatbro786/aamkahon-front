import Link from "next/link";

import { getShippingRates } from "@/lib/data/catalog";
import { taka } from "@/lib/format";

export const metadata = { title: "Delivery and shipping", description: "Weight based delivery to all 64 districts of Bangladesh.", alternates: { canonical: "/delivery" } };

const ZONES = {
    "dhaka_inside|Home Delivery": ["Inside Dhaka", "1 to 2 days"],
    "dhaka_sub|Home Delivery": ["Dhaka suburbs", "1 to 3 days"],
    "outside_dhaka|Home Delivery": ["Outside Dhaka, home delivery", "3 to 5 days"],
    "outside_dhaka|Courier": ["Outside Dhaka, courier pickup", "2 to 4 days"],
};

const charge = (r, kg) => r.baseCharge + Math.ceil(Math.max(0, kg - r.baseWeightKg)) * r.perKgCharge;

export default async function DeliveryPage() {
    const rates = (await getShippingRates()).filter((r) => ZONES[`${r.locationType}|${r.deliveryType}`]);
    const example = rates.find((r) => r.locationType === "outside_dhaka" && r.deliveryType === "Courier") || rates[0];

    return (
        <div className="wrap max-w-5xl py-14 md:py-20">
            <p className="label text-leaf-deep">Delivery</p>
            <h1 className="mt-3 text-h2 font-medium">Charged by weight, delivered everywhere</h1>
            <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-muted">
                We ship to all 64 districts. A base charge covers the first few kilos and each extra kilo adds a little. Checkout shows the
                exact charge for your address before you pay.
            </p>

            <div className="mt-10 overflow-x-auto rounded-card border border-line">
                <table className="w-full min-w-[560px] border-collapse text-left text-[15px]">
                    <thead className="bg-paper-2 text-[13px] text-muted">
                        <tr>
                            <th scope="col" className="px-5 py-3 font-normal">Zone</th>
                            <th scope="col" className="px-5 py-3 text-right font-normal">Base charge</th>
                            <th scope="col" className="px-5 py-3 text-right font-normal">Each extra kg</th>
                            <th scope="col" className="px-5 py-3 text-right font-normal">Usually takes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                        {rates.map((r) => {
                            const [name, eta] = ZONES[`${r.locationType}|${r.deliveryType}`];
                            return (
                                <tr key={name}>
                                    <td className="px-5 py-4 font-medium">{name}</td>
                                    <td className="num px-5 py-4 text-right">
                                        {taka(r.baseCharge)} <span className="text-muted">up to {r.baseWeightKg} kg</span>
                                    </td>
                                    <td className="num px-5 py-4 text-right">{r.perKgCharge ? taka(r.perKgCharge) : "None"}</td>
                                    <td className="px-5 py-4 text-right text-muted">{eta}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {example && example.perKgCharge > 0 && (
                <p className="mt-6 rounded-lg bg-paper-2 p-5 text-[15px] leading-relaxed">
                    Example: one 10 kg box of mangoes weighs about 10.8 kg packed. By courier outside Dhaka that is {taka(example.baseCharge)} for the
                    first {example.baseWeightKg} kg plus {Math.ceil(10.8 - example.baseWeightKg)} kg × {taka(example.perKgCharge)}, so{" "}
                    <span className="num font-medium">{taka(charge(example, 10.8))}</span>.
                </p>
            )}

            <div className="mt-14 grid gap-10 md:grid-cols-2">
                <section>
                    <h2 className="text-xl font-medium">Cash on delivery</h2>
                    <p className="mt-3 text-[15px] leading-relaxed text-muted">
                        Pay the delivery charge and a small COD fee online when you order, and the product price to the courier. This keeps fake
                        orders off the road and the price down for everyone.
                    </p>
                </section>
                <section>
                    <h2 className="text-xl font-medium">Pre-booked mangoes</h2>
                    <p className="mt-3 text-[15px] leading-relaxed text-muted">
                        Boxes ship the week each variety is harvested. We call the day before dispatch. The balance and delivery charge are paid
                        on arrival.
                    </p>
                </section>
                <section>
                    <h2 className="text-xl font-medium">If something arrives damaged</h2>
                    <p className="mt-3 text-[15px] leading-relaxed text-muted">
                        Tell us within 24 hours with photos and we replace or refund the affected quantity. See the{" "}
                        <Link href="/terms#returns" className="text-ink underline underline-offset-4">
                            terms
                        </Link>
                        .
                    </p>
                </section>
                <section>
                    <h2 className="text-xl font-medium">Track it</h2>
                    <p className="mt-3 text-[15px] leading-relaxed text-muted">
                        Use your order number and phone on the{" "}
                        <Link href="/track-order" className="text-ink underline underline-offset-4">
                            tracking page
                        </Link>
                        .
                    </p>
                </section>
            </div>
        </div>
    );
}
