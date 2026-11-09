import Image from "next/image";
import Link from "next/link";

/**
 * The two seasons this business runs on, stated plainly: what can be bought
 * today and what can be booked. Pre-booking terms come from the products
 * themselves so the copy never drifts from what checkout charges.
 */
export default function SeasonBoard({ advancePercent = 25, firstHarvest }) {
    const panels = [
        {
            key: "mango",
            eyebrow: "Mango · season 2027",
            title: "Book now, pay the rest when it ships",
            body: `Lock this year's price with a ${advancePercent}% advance through bKash, Nagad or card. We pick each variety after the district opens harvest${firstHarvest ? `, starting ${firstHarvest}` : ""}.`,
            cta: "See varieties",
            href: "/shop?availability=pre_order",
            image: "/images/ripe-mangoes-branch.jpg",
            alt: "Ripe mangoes hanging on a branch",
            tone: "bg-mango-soft",
        },
        {
            key: "gur",
            eyebrow: "Khejurer gur · winter 2026",
            title: "In stock and shipping this week",
            body: "Patali, jhola and nolen gur from this winter's tap. No sugar, no hydros. Cash on delivery available.",
            cta: "Shop gur",
            href: "/shop?category=khejurer-gur",
            image: "/images/gur-clay-pots.jpg",
            alt: "Clay pots of fresh date palm gur",
            tone: "bg-gur-soft",
        },
    ];

    return (
        <section className="wrap py-16 md:py-24" aria-labelledby="season-title">
            <h2 id="season-title" className="sr-only">
                What is in season
            </h2>
            <div className="grid gap-5 md:grid-cols-2">
                {panels.map((p) => (
                    <article key={p.key} className={`grid overflow-hidden rounded-card ${p.tone} sm:grid-cols-2`}>
                        <div className="relative aspect-[4/3] sm:aspect-auto sm:min-h-[340px]">
                            <Image src={p.image} alt={p.alt} fill sizes="(min-width: 768px) 25vw, 100vw" className="object-cover" />
                        </div>
                        <div className="flex flex-col p-6 md:p-7">
                            <p className="label text-ink/55">{p.eyebrow}</p>
                            <h3 className="mt-3 text-2xl font-medium leading-tight tracking-tight">{p.title}</h3>
                            <p className="mt-3 text-[15px] leading-relaxed text-ink/75">{p.body}</p>
                            <Link href={p.href} className="link-u mt-auto self-start pt-6 font-medium">
                                {p.cta}
                            </Link>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
