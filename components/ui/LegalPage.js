/**
 * Shared layout for policy pages. Sections are plain data so the client's
 * lawyer (or the owner) can edit wording without touching markup.
 */
export default function LegalPage({ eyebrow, title, updated, intro, sections }) {
    return (
        <article className="wrap py-14 md:py-20">
            <header className="max-w-3xl border-b border-line pb-10">
                <p className="label text-mango-deep">{eyebrow}</p>
                <h1 className="mt-3 text-h2 font-medium">{title}</h1>
                <p className="mt-4 text-sm text-muted">Last updated {updated}</p>
                {intro && <p className="mt-6 text-[17px] leading-relaxed text-ink/80">{intro}</p>}
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
                <div className="max-w-3xl space-y-12 lg:col-span-9">
                    {sections.map((s, i) => (
                        <section key={s.id} id={s.id} className="scroll-mt-28">
                            <h2 className="flex items-baseline gap-3 text-xl font-medium tracking-tight">
                                <span className="num text-[14px] text-mango-deep">{String(i + 1).padStart(2, "0")}</span>
                                {s.title}
                            </h2>
                            <div className="mt-4 space-y-4 text-[16px] leading-relaxed text-ink/80">
                                {s.body.map((para, j) =>
                                    Array.isArray(para) ? (
                                        <ul key={j} className="list-disc space-y-2 pl-5 marker:text-mango">
                                            {para.map((li) => (
                                                <li key={li}>{li}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p key={j}>{para}</p>
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
