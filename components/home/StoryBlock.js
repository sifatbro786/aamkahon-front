import Image from "next/image";
import Link from "next/link";

import { ownerDefaults } from "@/components/story/OwnerSpotlight";

export default function StoryBlock({ story }) {
    const o = ownerDefaults(story);
    return (
        <section className="bg-forest text-paper" aria-labelledby="story-title">
            <div className="wrap grid items-center gap-12 py-16 md:py-24 lg:grid-cols-12">
                <div className="lg:col-span-6">
                    <div className="grid grid-cols-5 gap-4">
                        {/* The owner leads the block (Admin > Our story). */}
                        <figure className="col-span-3">
                            <div className="relative aspect-[3/4] overflow-hidden rounded-card">
                                <Image src={o.photo} alt={o.alt} fill sizes="(min-width: 1024px) 28vw, 60vw" className="object-cover" />
                            </div>
                            <figcaption className="mt-3 border-t border-paper/25 pt-2 text-[14px]">
                                <span className="text-paper">{o.name || o.role}</span>
                                {o.name && <span className="block text-paper/55">{o.role}</span>}
                            </figcaption>
                        </figure>
                        <div className="col-span-2 flex flex-col gap-4 pt-10">
                            <div className="relative aspect-square overflow-hidden rounded-card">
                                <Image src="/images/packing-house-boxes.jpg" alt="Cartons stacked in the packing house" fill sizes="(min-width: 1024px) 18vw, 40vw" className="object-cover" />
                            </div>
                            <div className="relative aspect-[4/5] overflow-hidden rounded-card">
                                <Image src="/images/gawa-ghee-jars.jpg" alt="Jars sealed with paper and thread" fill sizes="(min-width: 1024px) 18vw, 40vw" className="object-cover" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-6 lg:pl-8">
                    <p className="label text-leaf">Our story</p>
                    <h2 id="story-title" className="mt-3 text-h2 font-medium">
                        We would rather be late than early
                    </h2>
                    <blockquote lang={o.quoteLang} className={`mt-8 border-l-2 border-mango pl-5 text-[22px] leading-[1.6] text-paper/90 ${o.quoteLang === "bn" ? "font-bangla" : ""}`}>
                        {o.quote}
                    </blockquote>
                    {o.note && <p className="mt-3 pl-5 text-sm text-paper/50">{o.note}</p>}
                    <Link href="/story" className="btn btn-ghost-light mt-10">
                        Read the Aamkahon story
                    </Link>
                </div>
            </div>
        </section>
    );
}
