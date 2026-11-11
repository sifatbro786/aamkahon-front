import { ArrowRight } from "lucide-react";
import Link from "next/link";

import HeroMedia from "@/components/home/HeroMedia";
import { fullDate } from "@/lib/format";

/**
 * One full screen hero. The copy and buttons never move; on desktop only the
 * background changes, cycling through the product lines (mango, gur, ghee) so
 * the hero is not mango only. Phones get their own media record: the vertical
 * orchard reel. Everything comes from Admin > Homepage hero (HeroContent,
 * GET /api/hero `items`).
 */
export default function Hero({ hero, copy: season = {}, nextHarvest }) {
    // Copy priority: the active season's text (Admin > Homepage & season),
    // then the hero media record's text, then built in defaults.
    const record = hero.desktop || hero.mobile || {};
    const eyebrow = season.heroEyebrow || "Rajshahi · since 2021";
    const title = season.heroTitle || record.title || "Mangoes picked late, on purpose";
    const subtitle = season.heroSubtitle || record.subtitle || "Rajshahi orchards to your door. Wholesale and retail, with 2027 pre-booking open now.";
    const primary = {
        text: season.heroButtonText || record.buttonText || "Pre-book mangoes",
        href: season.heroButtonLink || record.buttonLink || "/shop?availability=pre_order",
    };
    const secondary = season.heroSecondaryText
        ? { text: season.heroSecondaryText, href: season.heroSecondaryLink || "/shop" }
        : season.heroTitle
          ? null
          : { text: "Buy winter gur", href: "/shop?category=khejurer-gur" };

    return (
        <section className="relative isolate flex min-h-[calc(100svh-64px)] overflow-hidden bg-ink text-paper md:min-h-[calc(100svh-108px)]">
            {/* No z-index on this layer on purpose: the sound button inside it
                (z-20) must stack above the copy (z-10) to stay clickable. */}
            <div className="absolute inset-0">
                <HeroMedia slides={hero.desktopSlides} mobile={hero.mobile} />
                {/* Legibility: strong at the bottom where the copy sits, light at the top. */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/10" />
                <div className="absolute inset-0 hidden bg-gradient-to-r from-ink/70 via-ink/20 to-transparent md:block" />
            </div>

            <div className="wrap relative z-10 flex flex-col justify-end pb-24 pt-28 md:pb-20">
                <p className="label text-leaf">{eyebrow}</p>
                <h1 className="mt-5 max-w-[13ch] text-display font-medium">{title}</h1>
                <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-paper/80 md:text-xl">{subtitle}</p>

                <div className="mt-8 flex flex-wrap gap-3">
                    <Link href={primary.href} className="btn btn-mango">
                        {primary.text} <ArrowRight size={17} aria-hidden />
                    </Link>
                    {secondary && (
                        <Link href={secondary.href} className="btn btn-ghost-light bg-ink/20">
                            {secondary.text}
                        </Link>
                    )}
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
