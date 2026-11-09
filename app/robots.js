import { IS_STATIC, SITE_URL } from "@/lib/config";

export default function robots() {
    // The static Vercel build is a demo: keep it out of search results so it
    // never competes with the live store.
    if (IS_STATIC) return { rules: [{ userAgent: "*", disallow: "/" }] };
    return {
        rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/account", "/checkout", "/cart", "/order/"] }],
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
