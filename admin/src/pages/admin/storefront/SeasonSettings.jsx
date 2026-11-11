// Aamkahon: which season the site is in, and what the homepage says and shows
// for each season. Hero media and product sections are tagged per season on
// their own pages; this page holds the copy and the block switches.
import { useCallback, useEffect, useState } from "react";
import { Link } from "@/admin/router";
import { RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { storefrontApi } from "../../../api/storefrontApi";

const SEASONS = [
    { key: "mango", label: "Mango season", hint: "Summer. Mangoes in stock and shipping." },
    { key: "winter", label: "Winter (gur)", hint: "Khejurer gur in stock, mango pre-booking open." },
    { key: "all", label: "All year", hint: "Between seasons. Ghee and general content." },
];
const BLOCKS = [
    ["seasonBoard", "Two season panels (mango booking + gur)"],
    ["harvestCalendar", "Harvest calendar (pre-booking dates)"],
    ["wholesaleBand", "Wholesale band"],
    ["testimonials", "Customer quotes"],
    ["orchardReels", "Orchard videos"],
    ["delivery", "Delivery rates"],
    ["faq", "FAQ"],
    ["story", "Our story block"],
];
const COPY = [
    ["announcement", "Top bar line", 160, "Shown in the thin bar above the menu"],
    ["heroEyebrow", "Hero small line", 60, "e.g. Rajshahi · winter"],
    ["heroTitle", "Hero headline", 100, ""],
    ["heroSubtitle", "Hero text", 250, ""],
    ["heroButtonText", "Main button text", 40, ""],
    ["heroButtonLink", "Main button link", 200, "/shop?category=mango"],
    ["heroSecondaryText", "Second button text", 40, "Leave empty to hide"],
    ["heroSecondaryLink", "Second button link", 200, "/wholesale"],
];
const field = "w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400";

export default function SeasonSettings() {
    const [settings, setSettings] = useState(null);
    const [tab, setTab] = useState("winter");
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        try {
            const { data } = await storefrontApi.get();
            setSettings(data.settings);
            setTab(data.settings.activeSeason || "winter");
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not load settings");
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    if (!settings) return <div className="py-24 text-center text-sm text-gray-400">Loading...</div>;

    const content = settings.seasons?.[tab] || {};
    const blocks = content.blocks || {};
    const setCopy = (k, v) => setSettings((s) => ({ ...s, seasons: { ...s.seasons, [tab]: { ...s.seasons?.[tab], [k]: v } } }));
    const setBlock = (k, v) => setCopy("blocks", { ...blocks, [k]: v });

    const switchSeason = async (key) => {
        if (key === settings.activeSeason) return;
        try {
            const { data } = await storefrontApi.save({ activeSeason: key });
            setSettings(data.settings);
            setTab(key);
            toast.success(`Website is now in ${SEASONS.find((x) => x.key === key).label.toLowerCase()}. Live within a minute.`);
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not switch season");
        }
    };

    const save = async () => {
        setSaving(true);
        try {
            const { data } = await storefrontApi.save({ seasons: { [tab]: settings.seasons[tab] } });
            setSettings(data.settings);
            toast.success("Saved. Live within a minute.");
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not save");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-5 pb-10">
            <div className="flex items-start justify-between gap-3">
                <p className="max-w-2xl text-sm text-gray-500">
                    Pick the season the website is in. The homepage text, the blocks below, hero media tagged for that season (
                    <Link to="/admin/hero-content" className="text-blue-600 hover:underline">Homepage hero</Link>) and product sections tagged for it (
                    <Link to="/admin/sections" className="text-blue-600 hover:underline">Product sections</Link>) switch together.
                </p>
                <button onClick={load} className="rounded-md border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50" title="Reload">
                    <RefreshCw size={16} />
                </button>
            </div>

            <section className="rounded-lg border border-gray-200 bg-white p-5">
                <h2 className="font-semibold text-gray-900">Website is in</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {SEASONS.map((s) => {
                        const on = settings.activeSeason === s.key;
                        return (
                            <button key={s.key} onClick={() => switchSeason(s.key)} className={`rounded-lg border p-4 text-left transition ${on ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 hover:border-gray-400"}`}>
                                <span className="flex items-center justify-between font-medium">
                                    {s.label}
                                    {on && <span className="rounded-full bg-[#f29a1f] px-2 py-0.5 text-[11px] font-semibold text-gray-900">Live</span>}
                                </span>
                                <span className={`mt-1 block text-xs ${on ? "text-gray-300" : "text-gray-500"}`}>{s.hint}</span>
                            </button>
                        );
                    })}
                </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white">
                <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 px-5 pt-4">
                    {SEASONS.map((s) => (
                        <button key={s.key} onClick={() => setTab(s.key)} className={`-mb-px border-b-2 px-3 pb-3 text-sm ${tab === s.key ? "border-gray-900 font-medium text-gray-900" : "border-transparent text-gray-500 hover:text-gray-800"}`}>
                            {s.label}
                            {settings.activeSeason === s.key && <span className="ml-1.5 inline-block size-1.5 rounded-full bg-green-500 align-middle" />}
                        </button>
                    ))}
                </div>

                <div className="grid gap-6 p-5 lg:grid-cols-3">
                    <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
                        {COPY.map(([k, label, max, hint]) => (
                            <label key={k} className={`text-sm text-gray-700 ${k === "announcement" || k === "heroSubtitle" || k === "heroTitle" ? "sm:col-span-2" : ""}`}>
                                {label}
                                {k === "heroSubtitle" ? (
                                    <textarea rows={2} maxLength={max} className={`${field} mt-1`} value={content[k] || ""} onChange={(e) => setCopy(k, e.target.value)} />
                                ) : (
                                    <input maxLength={max} className={`${field} mt-1`} value={content[k] || ""} onChange={(e) => setCopy(k, e.target.value)} placeholder={hint} />
                                )}
                            </label>
                        ))}
                        <p className="text-xs text-gray-400 sm:col-span-2">Empty fields fall back to the text on the Homepage hero page. Links start with / (a page on this site) or https://.</p>
                    </div>

                    <div>
                        <p className="text-sm font-medium text-gray-900">Homepage blocks</p>
                        <div className="mt-2 space-y-2">
                            {BLOCKS.map(([k, label]) => (
                                <label key={k} className="flex items-center gap-2 text-sm text-gray-700">
                                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300" checked={blocks[k] !== false} onChange={(e) => setBlock(k, e.target.checked)} />
                                    {label}
                                </label>
                            ))}
                        </div>
                        <p className="mt-3 text-xs text-gray-400">The hero and product sections always show. A block with no data (no quotes, no FAQ) hides itself.</p>
                    </div>
                </div>

                <div className="flex justify-end border-t border-gray-200 px-5 py-4">
                    <button onClick={save} disabled={saving} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
                        {saving ? "Saving..." : `Save ${SEASONS.find((x) => x.key === tab).label.toLowerCase()}`}
                    </button>
                </div>
            </section>
        </div>
    );
}
