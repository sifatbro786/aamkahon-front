import { ArrowRight } from "lucide-react";
import Link from "next/link";

import HeroMedia from "@/components/home/HeroMedia";
import { fullDate } from "@/lib/format";

/**
 * One full screen hero (no slider: a carousel hides every message but the
 * first and costs load time). Copy and media come from Admin > Homepage hero
 * (HeroContent, via GET /api/hero `items`); phones get their own media record,
 * so the vertical orchard reel fills a phone and a landscape video or photo
 * fills a desktop.
 */
export default function Hero({ hero, nextHarvest }) {
    const copy = hero.desktop || hero.mobile || {};
    const title = copy.title || "Mangoes picked late, on purpose";
    const subtitle = copy.subtitle || "Rajshahi orchards to your door. Wholesale and retail, with 2027 pre-booking open now.";

    return (
        <section className="relative isolate flex min-h-[calc(100svh-64px)] overflow-hidden bg-ink text-paper md:min-h-[calc(100svh-108px)]">
            <div className="absolute inset-0 -z-10">
                <HeroMedia desktop={hero.desktop} mobile={hero.mobile} />
                {/* Legibility: strong at the bottom where the copy sits, light at the top. */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/10" />
                <div className="absolute inset-0 hidden bg-gradient-to-r from-ink/70 via-ink/20 to-transparent md:block" />
            </div>

            <div className="wrap flex flex-col justify-end pb-24 pt-28 md:pb-20">
                <p className="label text-leaf">Rajshahi · since 2021</p>
                <h1 className="mt-5 max-w-[13ch] text-display font-medium">{title}</h1>
                <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-paper/80 md:text-xl">{subtitle}</p>

                <div className="mt-8 flex flex-wrap gap-3">
                    <Link href={copy.buttonLink || "/shop?availability=pre_order"} className="btn btn-mango">
                        {copy.buttonText || "Pre-book mangoes"} <ArrowRight size={17} aria-hidden />
                    </Link>
                    <Link href="/shop?category=khejurer-gur" className="btn btn-ghost-light bg-ink/20">
                        Buy winter gur
                    </Link>
                </div>

                {nextHarvest && (
                    <Link href={`/product/${nextHarvest.slug}`} className="group mt-10 flex max-w-md items-center gap-4 border-t border-paper/20 pt-5">
                        <span className="label shrink-0 text-paper/55">First harvest</span>
                        <span className="min-w-0 truncate text-paper/90 group-hover:text-paper">
                            {nextHarvest.name.replace(/ Mango$/, "")}, {fullDate(nextHarvest.preOrder?.expectedDate)}
                        </span>
                    </Link>
                )}
            </div>
        </section>
    );
}
