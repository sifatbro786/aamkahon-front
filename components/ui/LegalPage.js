import { fullDate } from "@/lib/format";

/**
 * Policy page layout. Content comes from Admin > Policy Pages
 * (GET /api/pages/:slug) as plain text: a blank line starts a new paragraph,
 * lines starting "- " form a bullet list. Rendered as text nodes only.
 */
export function parseBody(text = "") {
    const blocks = [];
    for (const chunk of String(text).replace(/\r\n/g, "\n").split(/\n\s*\n/)) {
        const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
        if (!lines.length) continue;
        // A chunk can mix a lead-in line and bullets; keep their order.
        let para = [];
        let list = [];
        const flushPara = () => para.length && (blocks.push({ type: "p", text: para.join(" ") }), (para = []));
        const flushList = () => list.length && (blocks.push({ type: "ul", items: list }), (list = []));
        for (const l of lines) {
            if (/^[-•*]\s+/.test(l)) {
                flushPara();
                list.push(l.replace(/^[-•*]\s+/, ""));
            } else {
                flushList();
                para.push(l);
            }
        }
        flushPara();
        flushList();
    }
    return blocks;
}

const anchor = (title, i) => `${i + 1}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

export default function LegalPage({ eyebrow = "Policy", page }) {
    const sections = (page?.sections || []).map((s, i) => ({ ...s, id: anchor(s.title, i) }));
    return (
        <article className="wrap py-14 md:py-20">
            <header className="max-w-3xl border-b border-line pb-10">
                <p className="label text-mango-deep">{eyebrow}</p>
                <h1 className="mt-3 text-h2 font-medium">{page?.title}</h1>
                {page?.updatedAt && <p className="mt-4 text-sm text-muted">Last updated {fullDate(page.updatedAt)}</p>}
                {page?.intro && <p className="mt-6 whitespace-pre-line text-[17px] leading-relaxed text-ink/80">{page.intro}</p>}
            </header>

            <div className="mt-10 grid gap-10 lg:grid-cols-12">
                <nav className="hidden lg:col-span-3 lg:block" aria-label="On this page">
                    <ol className="sticky top-28 space-y-2.5 text-[14px] text-muted">
                        {sections.map((s, i) => (
                            <li key={s.id}>
                                <a href={`#${s.id}`} className="hover:text-ink">
                                    <span className="num mr-2 text-mango-deep">{String(i + 1).padStart(2, "0")}</span>
                                    {s.title}
                                </a>
                            </li>
                        ))}
                    </ol>
                </nav>
                <div className="min-w-0 max-w-3xl space-y-12 lg:col-span-9">
                    {sections.map((s, i) => (
                        <section key={s.id} id={s.id} className="scroll-mt-28">
                            <h2 className="flex items-baseline gap-3 text-xl font-medium tracking-tight">
                                <span className="num text-[14px] text-mango-deep">{String(i + 1).padStart(2, "0")}</span>
                                {s.title}
                            </h2>
                            <div className="mt-4 space-y-4 break-words text-[16px] leading-relaxed text-ink/80">
                                {parseBody(s.body).map((b, j) =>
                                    b.type === "ul" ? (
                                        <ul key={j} className="list-disc space-y-2 pl-5 marker:text-mango">
                                            {b.items.map((li, k) => (
                                                <li key={k}>{li}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p key={j}>{b.text}</p>
                                    ),
                                )}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </article>
    );
}

/** Shared page + metadata factory for /privacy, /terms, /refund-policy. */
export const policyMetadata = (page, path) => ({
    title: page?.title || "Policy",
    description: page?.metaDescription || undefined,
    alternates: { canonical: path },
});
