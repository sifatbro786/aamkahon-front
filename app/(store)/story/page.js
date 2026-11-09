import Image from "next/image";
import Link from "next/link";

import { SITE } from "@/lib/site";

export const metadata = {
    title: "Our story",
    description: "Aamkahon started in Rajshahi in 2021 with one rule: pick the mango late, when it is truly ripe. No formalin, no carbide.",
    alternates: { canonical: "/story" },
};

const CHAPTERS = [
    {
        img: "/images/founder-orchard.jpg",
        alt: "Checking mangoes on the tree",
        title: "We wait on purpose",
        body: "Every year the district administration announces the first day each variety may be harvested. Most traders pick that morning. We wait five to twenty five more days, so the fruit finishes ripening on the tree and not in a carton. It costs us some yield. It is the whole point.",
    },
    {
        img: "/images/sorting-green-mangoes.jpg",
        alt: "Sorting freshly picked mangoes",
        title: "Nothing added",
        body: "No formalin, no carbide, no ripening spray. Mangoes are sorted by hand on the packing floor, bruised fruit goes to juice, and the rest goes into ventilated cartons the same day.",
    },
    {
        img: "/images/gur-clay-pots.jpg",
        alt: "Date palm gur in clay pots",
        title: "Winter belongs to gur",
        body: "When the mango trees rest, the date palms are tapped. Sap is boiled down over a wood fire into patali, jhola and nolen gur, with no sugar and no hydros. It is a little darker than market gur. That is what it looks like.",
    },
    {
        img: "/images/bangladesh-64-districts-map.jpg",
        alt: "Map of the 64 districts Aamkahon has delivered to",
        title: "Sixty four districts",
        body: "What began as boxes for friends now ships to every district in the country, to families, sweet shops, offices and exporters. The orchard is still the same size of promise.",
    },
];

export default function StoryPage() {
    return (
        <>
            <section className="relative overflow-hidden bg-forest text-paper">
                <div className="wrap grid gap-10 py-16 md:py-24 lg:grid-cols-12 lg:items-end">
                    <div className="lg:col-span-7">
                        <p className="label text-leaf">Since {SITE.since}, Rajshahi</p>
                        <h1 className="mt-4 text-display font-medium">The story of mangoes</h1>
                    </div>
                    <blockquote lang="bn" className="font-bangla border-l-2 border-mango pl-5 text-[22px] leading-[1.6] text-paper/90 lg:col-span-5">
                        {SITE.bio}
                    </blockquote>
                </div>
                <div className="relative mx-auto aspect-[21/9] w-full max-w-[1320px] md:px-8">
                    <Image src="/images/team-orchard-banner.jpg" alt="The Aamkahon team in the orchard" fill priority sizes="100vw" className="object-cover md:rounded-t-card" />
                </div>
            </section>

            <div className="wrap py-16 md:py-24">
                {CHAPTERS.map((c, i) => (
                    <section key={c.title} className={`grid items-center gap-8 py-10 md:grid-cols-2 md:gap-16 md:py-14 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
                        <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-paper-2">
                            <Image src={c.img} alt={c.alt} fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
                        </div>
                        <div>
                            <span className="num text-[14px] text-mango-deep">{String(i + 1).padStart(2, "0")}</span>
                            <h2 className="mt-3 text-h2 font-medium">{c.title}</h2>
                            <p className="mt-4 max-w-lg text-[17px] leading-relaxed text-ink/75">{c.body}</p>
                        </div>
                    </section>
                ))}
            </div>

            <section className="border-t border-line bg-paper-2/60">
                <div className="wrap flex flex-col items-start justify-between gap-6 py-14 md:flex-row md:items-center">
                    <h2 className="text-2xl font-medium tracking-tight md:text-3xl">Taste the difference a week makes.</h2>
                    <div className="flex flex-wrap gap-3">
                        <Link href="/shop?availability=pre_order" className="btn btn-mango">
                            Pre-book mangoes
                        </Link>
                        <Link href="/shop?category=khejurer-gur" className="btn btn-ghost">
                            Shop gur
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
