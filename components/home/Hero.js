import { ArrowRight } from "lucide-react";
import Link from "next/link";

import HeroVideo from "@/components/home/HeroVideo";
import { fullDate } from "@/lib/format";

/**
 * Copy comes from the admin-editable hero (GET /api/hero `items`), media from
 * the same record. The client's clip is a vertical phone video, so instead of
 * stretching it across a wide screen (it is 360 px wide) it sits in a tall
 * frame beside the headline, the way it was shot.
 */
export default function Hero({ hero, nextHarvest }) {
    const title = hero?.title || "Mangoes picked late, on purpose";
    const subtitle =
        hero?.subtitle || "From Rajshahi orchards to your door. Wholesale and retail, with 2027 pre-booking open now.";
    const video = hero?.mediaType === "video" ? hero.mediaUrl : "/videos/hero-loop.mp4";

    return (
        <section className="relative overflow-hidden bg-ink text-paper">
            <div className="wrap grid items-center gap-10 pb-14 pt-10 md:pb-20 md:pt-14 lg:grid-cols-12 lg:gap-8 lg:pb-24">
                <div className="lg:col-span-7">
                    <p className="label text-leaf">Rajshahi · since 2021</p>
                    <h1 className="mt-5 max-w-[14ch] text-display font-medium">{title}</h1>
                    <p className="mt-6 max-w-xl text-lg leading-relaxed text-paper/75 md:text-xl">{subtitle}</p>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link href={hero?.buttonLink || "/shop?availability=pre_order"} className="btn btn-mango">
                            {hero?.buttonText || "Pre-book mangoes"} <ArrowRight size={17} aria-hidden />
                        </Link>
                        <Link href="/shop?category=khejurer-gur" className="btn btn-ghost-light">
                            Buy winter gur
                        </Link>
                    </div>

                    {nextHarvest && (
                        <Link
                            href={`/product/${nextHarvest.slug}`}
                            className="group mt-12 flex max-w-md items-center gap-4 border-t border-line-dark pt-5"
                        >
                            <span className="label shrink-0 text-paper/45">First harvest</span>
                            <span className="min-w-0 truncate text-paper/90 group-hover:text-paper">
                                {nextHarvest.name.replace(/ Mango$/, "")}, {fullDate(nextHarvest.preOrder?.expectedDate)}
                            </span>
                        </Link>
                    )}
                </div>

                <figure className="lg:col-span-5 lg:justify-self-end">
                    <div className="relative mx-auto aspect-[4/5] w-full max-w-[460px] overflow-hidden rounded-[22px] bg-ink-2 sm:aspect-[3/4] lg:aspect-[9/14] lg:w-[400px]">
                        <HeroVideo src={video} poster="/videos/hero-poster.jpg" label="Aerial view of a mango orchard in bloom" />
                    </div>
                    <figcaption className="mx-auto mt-3 max-w-[460px] text-sm text-paper/50 lg:w-[400px]">
                        An Aamkahon orchard in bloom, filmed from above.
                    </figcaption>
                </figure>
            </div>
        </section>
    );
}
