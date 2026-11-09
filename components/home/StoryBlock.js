import Image from "next/image";
import Link from "next/link";

import { SITE } from "@/lib/site";

export default function StoryBlock() {
    return (
        <section className="bg-forest text-paper" aria-labelledby="story-title">
            <div className="wrap grid items-center gap-12 py-16 md:py-24 lg:grid-cols-12">
                <div className="lg:col-span-6">
                    <div className="grid grid-cols-5 gap-4">
                        <div className="relative col-span-3 aspect-[3/4] overflow-hidden rounded-card">
                            <Image src="/images/founder-orchard.jpg" alt="Aamkahon founder checking mangoes in the orchard" fill sizes="(min-width: 1024px) 28vw, 60vw" className="object-cover" />
                        </div>
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
                    <blockquote lang="bn" className="font-bangla mt-8 border-l-2 border-mango pl-5 text-[22px] leading-[1.6] text-paper/90">
                        {SITE.bio}
                    </blockquote>
                    <p className="mt-3 pl-5 text-sm text-paper/50">
                        A mango is not just a fruit. Our dreams and our livelihood grow with it, so keeping it pure is our promise.
                    </p>
                    <Link href="/story" className="btn btn-ghost-light mt-10">
                        Read the Aamkahon story
                    </Link>
                </div>
            </div>
        </section>
    );
}
