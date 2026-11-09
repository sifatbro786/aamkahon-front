import { SITE_URL } from "@/lib/config";
import { getCategories, getProducts } from "@/lib/data/catalog";

export default async function sitemap() {
    const [{ products }, categories] = await Promise.all([getProducts({ limit: 500 }), getCategories()]);
    const page = (path, priority = 0.6) => ({ url: `${SITE_URL}${path}`, changeFrequency: "weekly", priority });
    return [
        page("/", 1),
        page("/shop", 0.9),
        page("/wholesale", 0.8),
        page("/story", 0.6),
        page("/delivery", 0.5),
        page("/contact", 0.5),
        page("/track-order", 0.3),
        page("/privacy", 0.2),
        page("/terms", 0.2),
        ...categories.map((c) => page(`/shop?category=${c.slug}`, 0.7)),
        ...products.map((p) => page(`/product/${p.slug}`, 0.8)),
    ];
}
