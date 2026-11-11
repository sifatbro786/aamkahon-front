// Add / edit one customer. Phone is normalised and de-duplicated server side.
import { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { customerAdminApi } from "../../../api/customerAdminApi";

const field = "w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400";

export default function CustomerFormModal({ customer, onClose, onSaved }) {
    const isEdit = Boolean(customer?._id);
    const [form, setForm] = useState({
        name: customer?.name || "",
        phone: customer?.phone || "",
        district: customer?.district || "",
        email: customer?.email || "",
        address: customer?.address || "",
        tags: (customer?.tags || []).join(", "),
        note: customer?.note || "",
        marketingOptIn: customer?.marketingOptIn ?? true,
    });
    const [saving, setSaving] = useState(false);
    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        if (!form.phone.trim()) return toast.error("Phone is required");
        setSaving(true);
        try {
            const payload = { ...form, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) };
            const { data } = isEdit ? await customerAdminApi.update(customer._id, payload) : await customerAdminApi.create(payload);
            toast.success(isEdit ? "Customer updated" : "Customer added");
            onSaved(data.customer);
        } catch (err) {
            toast.error(err.response?.data?.message || "Save failed");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
            <form onSubmit={submit} className="my-10 w-full max-w-lg rounded-lg bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                    <h2 className="text-lg font-semibold text-gray-900">{isEdit ? "Edit customer" : "Add customer"}</h2>
                    <button type="button" onClick={onClose} className="rounded p-1 text-gray-500 hover:bg-gray-100" aria-label="Close">
                        <X size={18} />
                    </button>
                </div>
                <div className="grid gap-4 p-5 sm:grid-cols-2">
                    <label className="text-sm text-gray-700">
                        Name
                        <input className={`${field} mt-1`} value={form.name} onChange={set("name")} maxLength={120} />
                    </label>
                    <label className="text-sm text-gray-700">
                        Phone *
                        <input className={`${field} mt-1 font-mono`} value={form.phone} onChange={set("phone")} placeholder="01XXXXXXXXX" inputMode="tel" required />
                    </label>
                    <label className="text-sm text-gray-700">
                        District
                        <input className={`${field} mt-1`} value={form.district} onChange={set("district")} maxLength={80} />
                    </label>
                    <label className="text-sm text-gray-700">
                        Email
                        <input className={`${field} mt-1`} type="email" value={form.email} onChange={set("email")} />
                    </label>
                    <label className="text-sm text-gray-700 sm:col-span-2">
                        Address
                        <input className={`${field} mt-1`} value={form.address} onChange={set("address")} maxLength={300} />
                    </label>
                    <label className="text-sm text-gray-700 sm:col-span-2">
                        Tags (comma separated)
                        <input className={`${field} mt-1`} value={form.tags} onChange={set("tags")} placeholder="wholesale, mango-2026" />
                    </label>
                    <label className="text-sm text-gray-700 sm:col-span-2">
                        Note
                        <textarea className={`${field} mt-1`} rows={3} value={form.note} onChange={set("note")} maxLength={1000} />
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700 sm:col-span-2">
                        <input type="checkbox" checked={form.marketingOptIn} onChange={set("marketingOptIn")} />
                        Send offers and promotions (untick if the customer asked to stop)
                    </label>
                </div>
                <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
                    <button type="button" onClick={onClose} className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button disabled={saving} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </form>
        </div>
    );
}
