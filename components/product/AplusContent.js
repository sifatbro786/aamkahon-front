"use client";
import DOMPurify from "dompurify";
import { useMemo, useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * Admin authored A+ HTML. The ONLY server supplied HTML rendered on the
 * storefront, and it always goes through DOMPurify (rule carried from the base).
 * Client only: DOMPurify needs a DOM.
 */
export default function AplusContent({ content }) {
    // true only after hydration, so server and first client render agree (both empty)
    const isClient = useSyncExternalStore(noop, () => true, () => false);
    const sections = useMemo(
        () =>
            (content?.sections || [])
                .filter((s) => s?.content)
                .map((s, i) => ({ key: s._id || i, title: s.title, html: isClient ? DOMPurify.sanitize(s.content) : "" })),
        [content, isClient],
    );
    if (!isClient || !sections.length) return null;
    return (
        <div className="space-y-10">
            {sections.map((s) => (
                <section key={s.key} className="prose-aplus">
                    {s.title && <h3 className="text-xl font-medium">{s.title}</h3>}
                    <div className="mt-3 text-[16px] leading-relaxed text-ink/80 [&_img]:rounded-card [&_p]:mt-3" dangerouslySetInnerHTML={{ __html: s.html }} />
                </section>
            ))}
        </div>
    );
}
