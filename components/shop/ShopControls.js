"use client";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { AVAILABILITY, SORTS, shopHref } from "@/lib/catalogParams";

/**
 * Search, sort and filters. Every change is a URL change (router.push), so
 * the server component re-renders with the new results and the state is
 * shareable and survives refresh.
 */
function useShopNav(current) {
    const router = useRouter();
    const [pending, start] = useTransition();
    const go = (changes) => start(() => router.push(shopHref(current, changes), { scroll: false }));
    return { go, pending };
}

export function ShopFilters({ current, categories }) {
    const { go } = useShopNav(current);
    const parents = categories.filter((c) => !c.parentCategory);
    const childrenOf = (id) => categories.filter((c) => c.parentCategory?._id === id);
    const filters = (
        <div className="space-y-8">
            <fieldset>
                <legend className="label text-muted">Category</legend>
                <ul className="mt-3 space-y-1">
                    <li>
                        <button type="button" onClick={() => go({ category: "" })} className={`py-1.5 text-left ${!current.category ? "font-medium text-ink" : "text-muted hover:text-ink"}`}>
                            All products
                        </button>
                    </li>
                    {parents.map((p) => (
                        <li key={p._id}>
                            <button type="button" onClick={() => go({ category: p.slug })} className={`py-1.5 text-left ${current.category === p.slug ? "font-medium text-ink" : "text-muted hover:text-ink"}`}>
                                {p.name}
                            </button>
                            {childrenOf(p._id).length > 0 && (
                                <ul className="ml-3 border-l border-line pl-3">
                                    {childrenOf(p._id).map((c) => (
                                        <li key={c._id}>
                                            <button type="button" onClick={() => go({ category: c.slug })} className={`py-1 text-left text-[14px] ${current.category === c.slug ? "font-medium text-ink" : "text-muted hover:text-ink"}`}>
                                                {c.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            </fieldset>

            <fieldset>
                <legend className="label text-muted">Availability</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                    {AVAILABILITY.map((a) => {
                        const active = (current.availability || "") === a.value;
                        return (
                            <button
                                key={a.value}
                                type="button"
                                onClick={() => go({ availability: a.value })}
                                className={`rounded-full border px-3.5 py-1.5 text-[14px] transition-colors ${active ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"}`}
                                aria-pressed={active}
                            >
                                {a.label}
                            </button>
                        );
                    })}
                </div>
            </fieldset>

            <label className="flex cursor-pointer items-center justify-between gap-4">
                <span>
                    <span className="block font-medium">Wholesale price available</span>
                    <span className="text-[13px] text-muted">Products with a bulk tier</span>
                </span>
                <input
                    type="checkbox"
                    checked={current.wholesale === "1"}
                    onChange={(e) => go({ wholesale: e.target.checked ? "1" : "" })}
                    className="size-5 accent-[var(--color-mango-deep)]"
                />
            </label>
        </div>
    );

    return filters;
}

export default function ShopToolbar({ current, categories, total }) {
    const { go, pending } = useShopNav(current);
    const [q, setQ] = useState(current.q || "");
    const [open, setOpen] = useState(false);
    return (
        <>
            <div className="flex flex-wrap items-center gap-3">
                <form
                    className="relative min-w-0 flex-1 basis-60"
                    onSubmit={(e) => {
                        e.preventDefault();
                        go({ q: q.trim() });
                    }}
                    role="search"
                >
                    <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
                    <input
                        type="search"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search mango, gur, Langra"
                        className="h-12 w-full rounded-full border border-line bg-paper pl-11 pr-4 text-[15px] outline-none focus:border-ink"
                        aria-label="Search products"
                    />
                </form>
                <select
                    value={current.sort || "displayOrder"}
                    onChange={(e) => go({ sort: e.target.value })}
                    className="h-12 rounded-full border border-line bg-paper px-4 text-[15px] outline-none focus:border-ink"
                    aria-label="Sort products"
                >
                    {SORTS.map((s) => (
                        <option key={s.value} value={s.value}>
                            {s.label}
                        </option>
                    ))}
                </select>
                <button type="button" onClick={() => setOpen(true)} className="btn btn-ghost h-12 lg:hidden">
                    <SlidersHorizontal size={17} aria-hidden /> Filters
                </button>
            </div>
            <p className={`mt-4 text-[14px] text-muted transition-opacity ${pending ? "opacity-50" : ""}`} aria-live="polite">
                {pending ? "Updating" : `${total} ${total === 1 ? "product" : "products"}`}
            </p>

            {open && (
                <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
                    <div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} />
                    <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-[20px] bg-paper px-5 pb-8 pt-4">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-lg font-medium">Filters</h2>
                            <button type="button" onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-full hover:bg-paper-2" aria-label="Close filters">
                                <X size={20} />
                            </button>
                        </div>
                        <ShopFilters current={current} categories={categories} />
                        <button type="button" onClick={() => setOpen(false)} className="btn btn-ink mt-8 w-full">
                            Show {total} {total === 1 ? "product" : "products"}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
