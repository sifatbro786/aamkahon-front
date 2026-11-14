// Add or edit a review typed in by the admin (Aamkahon has no customer
// accounts). Source = where the customer said it: Facebook, phone, WhatsApp.
// POST /api/admin/reviews | PUT /api/admin/reviews/:id -> { success, review }
// Published at once (approved); the product rating is recalculated server side.
import { useEffect, useState } from "react";
import { Star, X } from "lucide-react";
import toast from "react-hot-toast";
import reviewApi from "../../../api/reviewApi";
import { stockApi } from "../../../api/stockApi";

const SOURCES = [
    ["facebook", "Facebook"],
    ["phone", "Phone call"],
    ["whatsapp", "WhatsApp"],
    ["website", "Website"],
    ["other", "Other"],
];
const field = "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none";
const today = () => new Date().toISOString().slice(0, 10);

export default function ReviewFormModal({ review, onClose, onSaved }) {
    const isEdit = Boolean(review?._id);
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState(() => ({
        productId: review?.product?._id || review?.product || "",
        reviewerName: review?.reviewerName || review?.user?.name || "",
        reviewerDistrict: review?.reviewerDistrict || "",
        rating: review?.rating || 5,
        comment: review?.comment || "",
        source: review?.source || "facebook",
        reviewedAt: String(review?.reviewedAt || review?.createdAt || today()).slice(0, 10),
    }));
    const [saving, setSaving] = useState(false);
    const set = (patch) => setForm((f) => ({ ...f, ...patch }));

    // Small catalogue: one list call is enough for the picker.
    useEffect(() => {
        let alive = true;
        stockApi
            .list({ limit: 100 })
            .then(({ data }) => alive && setProducts((data.items || []).map((p) => ({ _id: p._id, name: p.name }))))
            .catch(() => {});
        return () => {
            alive = false;
        };
    }, []);

    const submit = async (e) => {
        e.preventDefault();
        if (!form.productId) return toast.error("Choose the product");
        if (!form.reviewerName.trim()) return toast.error("Write the customer's name");
        setSaving(true);
        try {
            const payload = { ...form, reviewerName: form.reviewerName.trim(), comment: form.comment.trim() };
            if (isEdit) await reviewApi.updateAdmin(review._id, payload);
            else await reviewApi.createAdmin(payload);
            toast.success(isEdit ? "Review updated" : "Review published");
            onSaved();
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not save the review");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
            <form onSubmit={submit} className="my-10 w-full max-w-lg rounded-lg bg-white shadow-xl">
                <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">{isEdit ? "Edit review" : "Add a review"}</h2>
                        <p className="text-sm text-gray-500">Copy a real customer review, for example from the Facebook page. It goes live straight away.</p>
                    </div>
                    <button type="button" onClick={onClose} className="rounded p-1 text-gray-500 hover:bg-gray-100" aria-label="Close">
                        <X size={18} />
                    </button>
                </div>
                <div className="space-y-4 p-5">
                    <label className="block text-sm text-gray-700">
                        Product
                        <select className={`${field} mt-1`} value={form.productId} onChange={(e) => set({ productId: e.target.value })} disabled={isEdit}>
                            <option value="">Choose a product</option>
                            {products.map((p) => (
                                <option key={p._id} value={p._id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <label className="text-sm text-gray-700">
                            Customer name
                            <input className={`${field} mt-1`} value={form.reviewerName} onChange={(e) => set({ reviewerName: e.target.value })} maxLength={80} />
                        </label>
                        <label className="text-sm text-gray-700">
                            District (optional)
                            <input className={`${field} mt-1`} value={form.reviewerDistrict} onChange={(e) => set({ reviewerDistrict: e.target.value })} maxLength={60} placeholder="e.g. Dhaka" />
                        </label>
                    </div>
                    <div>
                        <p className="text-sm text-gray-700">Rating</p>
                        <div className="mt-1 flex gap-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <button key={n} type="button" onClick={() => set({ rating: n })} aria-label={`${n} star`} className="p-0.5">
                                    <Star size={24} className={n <= form.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <label className="block text-sm text-gray-700">
                        What they said
                        <textarea className={`${field} mt-1`} rows={4} value={form.comment} onChange={(e) => set({ comment: e.target.value })} maxLength={1000} placeholder="Bangla or English, as the customer wrote it" />
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <label className="text-sm text-gray-700">
                            Where it came from
                            <select className={`${field} mt-1`} value={form.source} onChange={(e) => set({ source: e.target.value })}>
                                {SOURCES.map(([v, l]) => (
                                    <option key={v} value={v}>
                                        {l}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="text-sm text-gray-700">
                            Date written
                            <input type="date" max={today()} className={`${field} mt-1`} value={form.reviewedAt} onChange={(e) => set({ reviewedAt: e.target.value })} />
                        </label>
                    </div>
                </div>
                <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
                    <button type="button" onClick={onClose} className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button disabled={saving} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
                        {saving ? "Saving..." : isEdit ? "Save" : "Publish review"}
                    </button>
                </div>
            </form>
        </div>
    );
}
