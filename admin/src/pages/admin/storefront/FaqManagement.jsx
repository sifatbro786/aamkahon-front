// Aamkahon: storefront FAQ (homepage block + /faq). Plain text answers.
import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { storefrontApi } from "../../../api/storefrontApi";
import ConfirmDialog from "../../../components/admin/common/ConfirmDialog";

const field = "w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400";
const SEASON_LABEL = { mango: "Mango", winter: "Winter", all: "All year" };
const EMPTY = { question: "", answer: "", seasons: [], showOnHomepage: true, isActive: true };

function FaqForm({ initial, onCancel, onSaved }) {
    const [form, setForm] = useState(initial);
    const [saving, setSaving] = useState(false);
    const submit = async (e) => {
        e.preventDefault();
        if (!form.question.trim() || !form.answer.trim()) return toast.error("Question and answer are required");
        setSaving(true);
        try {
            if (initial._id) await storefrontApi.updateFaq(initial._id, form);
            else await storefrontApi.createFaq(form);
            toast.success("Saved");
            onSaved();
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not save");
        } finally {
            setSaving(false);
        }
    };
    return (
        <form onSubmit={submit} className="space-y-3 rounded-lg border border-gray-300 bg-gray-50 p-4">
            <input className={field} maxLength={200} placeholder="Question" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} autoFocus />
            <textarea className={field} rows={4} maxLength={2000} placeholder="Answer (plain text, new lines are kept)" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} />
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
                <span>Season:</span>
                {Object.entries(SEASON_LABEL).map(([v, l]) => (
                    <label key={v} className="flex items-center gap-1.5">
                        <input type="checkbox" checked={form.seasons.includes(v)} onChange={(e) => setForm({ ...form, seasons: e.target.checked ? [...form.seasons, v] : form.seasons.filter((x) => x !== v) })} /> {l}
                    </label>
                ))}
                <span className="text-xs text-gray-400">(none ticked = always)</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
                <label className="flex items-center gap-1.5"><input type="checkbox" checked={form.showOnHomepage} onChange={(e) => setForm({ ...form, showOnHomepage: e.target.checked })} /> Show on homepage</label>
                <label className="flex items-center gap-1.5"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Published</label>
                <div className="ml-auto flex gap-2">
                    <button type="button" onClick={onCancel} className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm">Cancel</button>
                    <button disabled={saving} className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
                </div>
            </div>
        </form>
    );
}

export default function FaqManagement() {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null); // "new" | id
    const [toDelete, setToDelete] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await storefrontApi.listFaqs();
            setFaqs(data.faqs || []);
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not load FAQ");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const move = async (i, dir) => {
        const next = [...faqs];
        [next[i], next[i + dir]] = [next[i + dir], next[i]];
        setFaqs(next);
        try {
            await storefrontApi.reorderFaqs(next.map((f) => f._id));
        } catch {
            toast.error("Could not reorder");
            load();
        }
    };

    const remove = async () => {
        try {
            await storefrontApi.deleteFaq(toDelete._id);
            toast.success("Deleted");
            setToDelete(null);
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Delete failed");
        }
    };

    const done = () => {
        setEditing(null);
        load();
    };

    return (
        <div className="space-y-4 pb-10">
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-gray-500">Shown on the homepage (up to 6) and on the /faq page, filtered by the active season.</p>
                {editing !== "new" && (
                    <button onClick={() => setEditing("new")} className="inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800">
                        <Plus size={15} /> Add question
                    </button>
                )}
            </div>
            {editing === "new" && <FaqForm initial={EMPTY} onCancel={() => setEditing(null)} onSaved={done} />}

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                {loading ? (
                    <div className="p-10 text-center text-sm text-gray-500">Loading...</div>
                ) : faqs.length === 0 ? (
                    <div className="p-10 text-center text-sm text-gray-500">No questions yet.</div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {faqs.map((f, i) =>
                            editing === f._id ? (
                                <li key={f._id} className="p-3">
                                    <FaqForm initial={{ ...EMPTY, ...f }} onCancel={() => setEditing(null)} onSaved={done} />
                                </li>
                            ) : (
                                <li key={f._id} className="flex items-start gap-3 p-4">
                                    <div className="flex flex-col">
                                        <button disabled={i === 0} onClick={() => move(i, -1)} className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30" aria-label="Move up"><ArrowUp size={14} /></button>
                                        <button disabled={i === faqs.length - 1} onClick={() => move(i, 1)} className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30" aria-label="Move down"><ArrowDown size={14} /></button>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className={`font-medium ${f.isActive ? "text-gray-900" : "text-gray-400 line-through"}`}>{f.question}</p>
                                        <p className="mt-1 line-clamp-2 whitespace-pre-line text-sm text-gray-600">{f.answer}</p>
                                        <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                                            {(f.seasons?.length ? f.seasons : ["always"]).map((s) => (
                                                <span key={s} className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-600">{SEASON_LABEL[s] || "Every season"}</span>
                                            ))}
                                            {!f.showOnHomepage && <span className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-600">FAQ page only</span>}
                                        </div>
                                    </div>
                                    <button onClick={() => setEditing(f._id)} className="rounded p-1.5 text-gray-500 hover:bg-gray-100" aria-label="Edit"><Pencil size={15} /></button>
                                    <button onClick={() => setToDelete(f)} className="rounded p-1.5 text-red-500 hover:bg-red-50" aria-label="Delete"><Trash2 size={15} /></button>
                                </li>
                            ),
                        )}
                    </ul>
                )}
            </div>
            <ConfirmDialog open={Boolean(toDelete)} title="Delete question" message={`Delete "${toDelete?.question}"?`} confirmLabel="Delete" onConfirm={remove} onCancel={() => setToDelete(null)} />
        </div>
    );
}
