// Which nav link is "current". Nav hrefs carry query strings
// (/shop?category=mango, /shop?availability=pre_order), so the path alone is
// not enough: the most specific link whose path AND every query param match
// wins. "Shop all" (/shop) therefore lights up only when no filtered link fits.
const parse = (href) => {
    try {
        const u = new URL(href, "http://x");
        return { path: u.pathname.replace(/\/$/, "") || "/", params: [...u.searchParams.entries()] };
    } catch {
        return null;
    }
};

const pathMatches = (linkPath, pathname) =>
    linkPath === "/" ? pathname === "/" : pathname === linkPath || pathname.startsWith(`${linkPath}/`);

/** @returns {string|null} the href of the active link */
export function activeHref(links, pathname, searchParams) {
    const current = (pathname || "/").replace(/\/$/, "") || "/";
    let best = null;
    let bestScore = -1;
    for (const l of links) {
        const p = parse(l.href);
        if (!p || /^https?:/i.test(l.href) || !pathMatches(p.path, current)) continue;
        if (!p.params.every(([k, v]) => searchParams?.get(k) === v)) continue;
        // Exact path beats a parent path; more matching params beat fewer.
        const score = (p.path === current ? 100 : 0) + p.params.length;
        if (score > bestScore) {
            best = l.href;
            bestScore = score;
        }
    }
    return best;
}
