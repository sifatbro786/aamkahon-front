// URL query string is the source of truth for the catalogue (as in Footpath).
// Only these keys are read or written; anything else in the URL is ignored.
export const SORTS = [
    { value: "displayOrder", label: "Featured" },
    { value: "price_asc", label: "Price, low to high" },
    { value: "price_desc", label: "Price, high to low" },
    { value: "newest", label: "Newest" },
];

export const AVAILABILITY = [
    { value: "", label: "Everything" },
    { value: "in_stock", label: "In season now" },
    { value: "pre_order", label: "Pre-booking" },
];

export const PAGE_SIZE = 12;

/** searchParams object -> clean params for GET /api/products */
export function toApiParams(sp = {}) {
    const one = (k) => (Array.isArray(sp[k]) ? sp[k][0] : sp[k]) || "";
    const sort = SORTS.some((s) => s.value === one("sort")) ? one("sort") : "displayOrder";
    const page = Math.max(1, parseInt(one("page"), 10) || 1);
    const params = {
        page,
        limit: PAGE_SIZE,
        sortBy: sort,
        sortOrder: "asc",
    };
    if (one("category")) params.category = one("category").slice(0, 80);
    if (["in_stock", "pre_order"].includes(one("availability"))) params.availability = one("availability");
    if (one("wholesale") === "1") params.wholesale = "true";
    if (one("q")) params.search = one("q").slice(0, 80);
    return params;
}

/** Build a /shop href from current params plus changes. Filter changes reset the page. */
export function shopHref(current = {}, changes = {}) {
    const next = { ...current, ...changes };
    if (!("page" in changes)) delete next.page;
    const qs = new URLSearchParams();
    for (const k of ["q", "category", "availability", "wholesale", "sort", "page"]) {
        const v = next[k];
        if (v && !(k === "sort" && v === "displayOrder") && !(k === "page" && Number(v) <= 1)) qs.set(k, v);
    }
    const s = qs.toString();
    return s ? `/shop?${s}` : "/shop";
}
