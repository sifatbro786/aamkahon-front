// Aamkahon: Privacy policy, Terms and Refund policy text, edited here and
// shown at /privacy, /terms and /refund-policy (footer links). Plain text:
// a blank line starts a new paragraph, a line starting "- " is a bullet.
// Pages never saved here show the bundled starting copy on the site.
import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { policyPageApi } from "../../../api/policyPageApi";

const field = "w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400";
const TABS = [
    { slug: "privacy", label: "Privacy policy", path: "/privacy", title: "Privacy policy" },
    { slug: "terms", label: "Terms", path: "/terms", title: "Terms and conditions" },
    { slug: "refund", label: "Refund policy", path: "/refund-policy", title: "Refund and return policy" },
];
const fmt = (d) => (d ? new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dhaka" }) : "");
const blank = (tab) => ({ slug: tab.slug, title: tab.title, metaDescription: "", intro: "", sections: [], isPublished: true });

export default function PolicyPages() {
    const [pages, setPages] = useState({});
    const [active, setActive] = useState("privacy");
    const [form, setForm] = useState(null);
    const [dirty, setDirty] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await policyPageApi.list();
            setPages(Object.fromEntries((data.pages || []).map((p) => [p.slug, p])));
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not load pages");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    // Form follows the tab; unsaved edits ask first.
    const tab = TABS.find((t) => t.slug === active);
    useEffect(() => {
        if (loading) return;
        const p = pages[active];
        const next = p ? { ...p, sections: (p.sections || []).map((s) => ({ title: s.title, body: s.body })) } : blank(tab);
        Promise.resolve().then(() => {
            setForm(next);
            setDirty(false);
        });
    }, [active, pages, loading, tab]);

    const switchTab = (slug) => {
        if (dirty && !window.confirm("You have unsaved changes. Leave this page without saving?")) return;
        setActive(slug);
    };

    const edit = (patch) => {
        setForm((f) => ({ ...f, ...patch }));
        setDirty(true);
    };
    const editSection = (i, patch) => edit({ sections: form.sections.map((s, j) => (j === i ? { ...s, ...patch } : s)) });
    const move = (i, d) => {
        const next = [...form.sections];
        [next[i], next[i + d]] = [next[i + d], next[i]];
        edit({ sections: next });
    };

    const save = async () => {
        if (!form.title.trim()) return toast.error("Title is required");
        const sections = form.sections.filter((s) => s.title.trim() || s.body.trim());
        if (sections.some((s) => !s.title.trim())) return toast.error("Every section needs a heading");
        setSaving(true);
        try {
            const { data } = await policyPageApi.save(active, { title: form.title, metaDescription: form.metaDescription, intro: form.intro, sections, isPublished: form.isPublished });
            setPages((p) => ({ ...p, [active]: data.page }));
            toast.success("Saved. The site updates within a minute.");
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not save");
        } finally {
            setSaving(false);
        }
    };

    if (loading || !form) return <div className="p-10 text-center text-sm text-gray-500">Loading...</div>;
    const saved = pages[active];

    return (
        <div className="space-y-4 pb-6">
            <div className="flex flex-wrap items-center gap-2 border-b border-gray-200">
                {TABS.map((t) => (
                    <button
                        key={t.slug}
                        onClick={() => switchTab(t.slug)}
                        className={`-mb-px border-b-2 px-3 py-2 text-sm ${active === t.slug ? "border-gray-900 font-medium text-gray-900" : "border-transparent text-gray-500 hover:text-gray-800"}`}
                    >
                        {t.label}
                    </button>
                ))}
                <a href={tab.path} target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-1 pb-2 text-sm text-gray-500 hover:text-gray-900">
                    View on site <ExternalLink size={13} />
                </a>
            </div>

            <p className="text-xs text-gray-500">
                {saved ? `Last saved ${fmt(saved.updatedAt)}${saved.updatedBy?.name ? ` by ${saved.updatedBy.name}` : ""}.` : "Not saved yet: the site shows the starting copy until you save."} Plain text: leave an empty line for a new paragraph, start a line with &quot;- &quot; for a bullet.
            </p>

            <div className="grid gap-4 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-2">
                <label className="text-sm text-gray-700">
                    Page title
                    <input className={`${field} mt-1`} value={form.title} onChange={(e) => edit({ title: e.target.value })} maxLength={120} />
                </label>
                <label className="text-sm text-gray-700">
                    Search description (Google)
                    <input className={`${field} mt-1`} value={form.metaDescription} onChange={(e) => edit({ metaDescription: e.target.value })} maxLength={200} />
                </label>
                <label className="text-sm text-gray-700 sm:col-span-2">
                    Introduction
                    <textarea className={`${field} mt-1`} rows={3} value={form.intro} onChange={(e) => edit({ intro: e.target.value })} maxLength={2000} />
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" checked={form.isPublished} onChange={(e) => edit({ isPublished: e.target.checked })} />
                    Published (unticked: the site shows the starting copy)
                </label>
            </div>

            <div className="space-y-3">
                {form.sections.map((s, i) => (
                    <div key={i} className="rounded-lg border border-gray-200 bg-white p-4">
                        <div className="flex items-center gap-2">
                            <span className="w-6 text-sm text-gray-400">{String(i + 1).padStart(2, "0")}</span>
                            <input className={`${field} font-medium`} value={s.title} onChange={(e) => editSection(i, { title: e.target.value })} maxLength={120} placeholder="Section heading" />
                            <button disabled={i === 0} onClick={() => move(i, -1)} className="rounded p-1.5 text-gray-400 hover:bg-gray-100 disabled:opacity-30" aria-label="Move up"><ArrowUp size={15} /></button>
                            <button disabled={i === form.sections.length - 1} onClick={() => move(i, 1)} className="rounded p-1.5 text-gray-400 hover:bg-gray-100 disabled:opacity-30" aria-label="Move down"><ArrowDown size={15} /></button>
                            <button onClick={() => edit({ sections: form.sections.filter((_, j) => j !== i) })} className="rounded p-1.5 text-red-500 hover:bg-red-50" aria-label="Remove section"><Trash2 size={15} /></button>
                        </div>
                        <textarea className={`${field} mt-2 font-[inherit] leading-relaxed`} rows={Math.min(14, Math.max(4, s.body.split("\n").length + 1))} value={s.body} onChange={(e) => editSection(i, { body: e.target.value })} maxLength={8000} />
                    </div>
                ))}
                <button onClick={() => edit({ sections: [...form.sections, { title: "", body: "" }] })} className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
                    <Plus size={15} /> Add section
                </button>
            </div>

            <div className="sticky bottom-0 z-20 flex items-center justify-end gap-3 rounded-lg border border-gray-200 bg-white/95 px-4 py-3 shadow-sm">
                {dirty && <span className="text-sm text-amber-700">Unsaved changes</span>}
                <button onClick={save} disabled={saving || !dirty} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40">
                    {saving ? "Saving..." : "Save page"}
                </button>
            </div>
        </div>
    );
}
