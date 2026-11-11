// Aamkahon: the owner spotlight on /story and the homepage story block.
import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { storefrontApi } from "../../../api/storefrontApi";
import { uploadApi } from "../../../api/uploadApi";

const field = "w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400";

export default function StorySettings() {
    const [story, setStory] = useState(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef(null);

    useEffect(() => {
        storefrontApi
            .get()
            .then(({ data }) => setStory({ facts: [], quoteLang: "bn", ...data.settings.story }))
            .catch((err) => toast.error(err.response?.data?.message || "Could not load"));
    }, []);

    if (!story) return <div className="py-24 text-center text-sm text-gray-400">Loading...</div>;
    const set = (k) => (e) => setStory((s) => ({ ...s, [k]: e.target.value }));

    const upload = async (file) => {
        if (!file) return;
        setUploading(true);
        try {
            const { data } = await uploadApi.uploadSingle(file);
            setStory((s) => ({ ...s, ownerPhoto: data.imageUrl || data.file?.url }));
            toast.success("Photo uploaded. Press Save to publish.");
        } catch (err) {
            toast.error(err.response?.data?.message || "Upload failed");
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = "";
        }
    };

    const save = async () => {
        setSaving(true);
        try {
            const { data } = await storefrontApi.save({ story });
            setStory({ facts: [], ...data.settings.story });
            toast.success("Saved. Live within a minute.");
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not save");
        } finally {
            setSaving(false);
        }
    };

    const setFact = (i, k, v) => setStory((s) => ({ ...s, facts: s.facts.map((f, j) => (j === i ? { ...f, [k]: v } : f)) }));

    return (
        <div className="space-y-5 pb-10">
            <p className="max-w-2xl text-sm text-gray-500">The owner is shown at the top of the Our story page and in the story block on the homepage. Use a real, well lit portrait.</p>

            <div className="grid gap-5 lg:grid-cols-3">
                <section className="rounded-lg border border-gray-200 bg-white p-5">
                    <h2 className="font-semibold text-gray-900">Portrait</h2>
                    <div className="mt-3 aspect-[4/5] overflow-hidden rounded-md bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {story.ownerPhoto ? <img src={story.ownerPhoto} alt="" className="size-full object-cover" /> : <div className="flex size-full items-center justify-center text-sm text-gray-400">No photo</div>}
                    </div>
                    <input ref={fileRef} type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={(e) => upload(e.target.files?.[0])} />
                    <button type="button" disabled={uploading} onClick={() => fileRef.current?.click()} className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                        <Upload size={14} /> {uploading ? "Uploading..." : "Upload photo"}
                    </button>
                    <input className={`${field} mt-2`} value={story.ownerPhoto || ""} onChange={set("ownerPhoto")} placeholder="/images/founder.jpg or https://..." />
                    <label className="mt-3 block text-sm text-gray-700">
                        Photo description (for screen readers)
                        <input className={`${field} mt-1`} maxLength={160} value={story.ownerPhotoAlt || ""} onChange={set("ownerPhotoAlt")} />
                    </label>
                </section>

                <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-5 lg:col-span-2">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="text-sm text-gray-700">
                            Owner name
                            <input className={`${field} mt-1`} maxLength={80} value={story.ownerName || ""} onChange={set("ownerName")} />
                        </label>
                        <label className="text-sm text-gray-700">
                            Role
                            <input className={`${field} mt-1`} maxLength={80} value={story.ownerRole || ""} onChange={set("ownerRole")} placeholder="Founder, Aamkahon" />
                        </label>
                    </div>
                    <label className="block text-sm text-gray-700">
                        Quote in their words
                        <textarea rows={3} maxLength={400} lang={story.quoteLang} className={`${field} mt-1`} value={story.quote || ""} onChange={set("quote")} />
                    </label>
                    <div className="flex gap-4 text-sm text-gray-700">
                        Quote language:
                        {[
                            ["bn", "বাংলা"],
                            ["en", "English"],
                        ].map(([v, l]) => (
                            <label key={v} className="flex items-center gap-1.5">
                                <input type="radio" checked={story.quoteLang === v} onChange={() => setStory((s) => ({ ...s, quoteLang: v }))} /> {l}
                            </label>
                        ))}
                    </div>
                    <label className="block text-sm text-gray-700">
                        A few lines from the owner (optional)
                        <textarea rows={4} maxLength={2000} className={`${field} mt-1`} value={story.note || ""} onChange={set("note")} />
                    </label>

                    <div>
                        <p className="text-sm font-medium text-gray-900">Facts beside the portrait</p>
                        <div className="mt-2 space-y-2">
                            {story.facts.map((f, i) => (
                                <div key={i} className="flex gap-2">
                                    <input className={field} maxLength={40} placeholder="Label, e.g. Started" value={f.label} onChange={(e) => setFact(i, "label", e.target.value)} />
                                    <input className={field} maxLength={40} placeholder="Value, e.g. 2021" value={f.value} onChange={(e) => setFact(i, "value", e.target.value)} />
                                    <button type="button" onClick={() => setStory((s) => ({ ...s, facts: s.facts.filter((_, j) => j !== i) }))} className="rounded p-2 text-red-500 hover:bg-red-50" aria-label="Remove"><Trash2 size={15} /></button>
                                </div>
                            ))}
                        </div>
                        {story.facts.length < 6 && (
                            <button type="button" onClick={() => setStory((s) => ({ ...s, facts: [...s.facts, { label: "", value: "" }] }))} className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
                                <Plus size={14} /> Add a fact
                            </button>
                        )}
                    </div>

                    <div className="flex justify-end border-t border-gray-200 pt-4">
                        <button onClick={save} disabled={saving} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
                            {saving ? "Saving..." : "Save"}
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}
