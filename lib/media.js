import { API_URL } from "./config";

// Product and category images are either files in /public (seed content,
// "/images/x.jpg") or admin uploads served by the backend
// ("http://host/uploads/..." or a bare "/uploads/..."). Normalise both.
const BACKEND_ORIGIN = (() => {
    try {
        return new URL(API_URL).origin;
    } catch {
        return "";
    }
})();

export const mediaUrl = (url) => {
    if (!url) return "/images/logo.jpg";
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith("/uploads/")) return `${BACKEND_ORIGIN}${url}`;
    return url;
};

export const firstImage = (product, groupName) => {
    const groups = product?.imageGroups || [];
    const group = (groupName && groups.find((g) => g.name === groupName)) || groups.find((g) => g.name === "Main") || groups[0];
    const img = group?.images?.[0];
    return { src: mediaUrl(img?.url), alt: img?.alt || product?.name || "" };
};

export const allImages = (product) =>
    (product?.imageGroups || []).flatMap((g) => (g.images || []).map((im) => ({ src: mediaUrl(im.url), alt: im.alt || product?.name || "", group: g.name })));
