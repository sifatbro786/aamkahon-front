// Navbar items come from GET /api/navbar/config (admin editable). Category
// items are linked by the populated category slug, never by the stored
// `path` (base navbar hook writes /category/<ObjectId> there).
export function navHref(item) {
    if (item.type === "category" && item.category?.slug) return `/shop?category=${item.category.slug}`;
    return item.customUrl || item.path || "/";
}
