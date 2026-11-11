import { ArrowUpRight, Plus } from "lucide-react";
import Link from "next/link";

import { SITE, whatsappText } from "@/lib/site";

/**
 * Questions from Admin > FAQ, filtered to the active season by the API.
 * Native <details>: works without JS, keyboard and screen readers for free.
 * Answers are plain text (never HTML); line breaks are kept.
 * `full` = the /faq page (no "see all" link, emits FAQPage JSON-LD).
 */
export default function FaqBlock({ faqs = [], full = false, title = "Questions people ask" }) {
    if (!faqs.length) return null;

    const ld = full
        ? {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
          }
        : null;

    return (
        <section className={full ? "" : "border-t border-line py-16 md:py-24"} aria-labelledby="faq-title">
            <div className="wrap grid gap-10 lg:grid-cols-12">
                <div className="lg:col-span-4">
                    <p className="label text-mango-deep">FAQ</p>
                    {full ? (
                        <h1 id="faq-title" className="mt-3 text-display font-medium">{title}</h1>
                    ) : (
                        <h2 id="faq-title" className="mt-3 text-h2 font-medium">{title}</h2>
                    )}
                    <p className="mt-4 max-w-sm text-[16px] leading-relaxed text-ink/70">
                        Not here? Call or WhatsApp us on <a href={SITE.phoneHref} className="num underline decoration-mango underline-offset-4">{SITE.phone}</a>.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <a href={whatsappText("Hi Aamkahon, I have a question:")} target="_blank" rel="noreferrer" className="btn btn-ghost">
                            Ask on WhatsApp <ArrowUpRight size={16} aria-hidden />
                        </a>
                        {!full && (
                            <Link href="/faq" className="btn btn-ghost">
                                All questions
                            </Link>
                        )}
                    </div>
                </div>

                <div className="border-t border-ink lg:col-span-8">
                    {faqs.map((f) => (
                        <details key={f._id} className="group border-b border-line">
                            <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-[17px] font-medium md:text-lg [&::-webkit-details-marker]:hidden">
                                <span>{f.question}</span>
                                <Plus size={20} aria-hidden className="mt-1 shrink-0 text-mango-deep transition-transform duration-200 group-open:rotate-45" />
                            </summary>
                            <p className="whitespace-pre-line pb-6 pr-10 text-[16px] leading-relaxed text-ink/75">{f.answer}</p>
                        </details>
                    ))}
                </div>
            </div>
            {ld && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />}
        </section>
    );
}
