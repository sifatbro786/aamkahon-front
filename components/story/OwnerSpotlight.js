import Image from "next/image";

import { SITE } from "@/lib/site";

/** Defaults when Admin > Our story is empty, so the page never looks unfinished. */
export const ownerDefaults = (story = {}) => ({
    name: story.ownerName || "",
    role: story.ownerRole || `Founder, ${SITE.name}`,
    photo: story.ownerPhoto || "/images/founder-jar-display.jpg",
    alt: story.ownerPhotoAlt || `The founder of ${SITE.name}`,
    quote: story.quote || SITE.bio,
    quoteLang: story.quote ? story.quoteLang || "bn" : "bn",
    note: story.note || "",
    facts: story.facts?.length ? story.facts : [],
});

/**
 * The person behind the brand, on /story. Large portrait, the owner's own
 * words, and a short ledger of facts. Content from Admin > Our story.
 */
export default function OwnerSpotlight({ story }) {
    const o = ownerDefaults(story);
    return (
        <section className="border-b border-line bg-paper" aria-labelledby="owner-title">
            <div className="wrap grid gap-10 py-16 md:py-24 lg:grid-cols-12 lg:gap-16">
                <figure className="lg:col-span-5">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-paper-2">
                        <Image src={o.photo} alt={o.alt} fill sizes="(min-width: 1024px) 38vw, 100vw" className="object-cover" />
                    </div>
                    <figcaption className="mt-3 flex items-baseline justify-between gap-4 border-b border-ink pb-3 text-[14px]">
                        <span className="font-medium">{o.name || o.role}</span>
                        <span className="text-ink/55">{SITE.location}</span>
                    </figcaption>
                </figure>

                <div className="flex flex-col justify-center lg:col-span-7">
                    <p className="label text-mango-deep">The person behind the boxes</p>
                    <h2 id="owner-title" className="mt-4 text-display font-medium leading-[1.02]">
                        {o.name || "Meet the founder"}
                    </h2>
                    {o.name && <p className="mt-3 text-lg text-ink/60">{o.role}</p>}

                    <blockquote
                        lang={o.quoteLang}
                        className={`mt-10 border-l-2 border-mango pl-6 text-[24px] leading-[1.55] text-ink md:text-[28px] ${o.quoteLang === "bn" ? "font-bangla" : "font-medium tracking-tight"}`}
                    >
                        {o.quote}
                    </blockquote>
                    {o.note && <p className="mt-6 max-w-xl whitespace-pre-line pl-6 text-[17px] leading-relaxed text-ink/70">{o.note}</p>}

                    {o.facts.length > 0 && (
                        <dl className="mt-12 grid grid-cols-2 border-t border-ink sm:grid-cols-3">
                            {o.facts.map((f) => (
                                <div key={`${f.label}-${f.value}`} className="border-b border-line py-4 pr-4">
                                    <dt className="label text-ink/50">{f.label}</dt>
                                    <dd className="mt-1 text-xl font-medium">{f.value}</dd>
                                </div>
                            ))}
                        </dl>
                    )}
                </div>
            </div>
        </section>
    );
}
