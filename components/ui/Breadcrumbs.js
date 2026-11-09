import Link from "next/link";

export default function Breadcrumbs({ items = [], className = "" }) {
    return (
        <nav aria-label="Breadcrumb" className={className}>
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted">
                <li>
                    <Link href="/" className="hover:text-ink">
                        Home
                    </Link>
                </li>
                {items.map((item, i) => (
                    <li key={item.href || item.label} className="flex min-w-0 items-center gap-2">
                        <span aria-hidden className="text-line">/</span>
                        {item.href && i < items.length - 1 ? (
                            <Link href={item.href} className="hover:text-ink">
                                {item.label}
                            </Link>
                        ) : (
                            <span aria-current="page" className="truncate text-ink">
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
