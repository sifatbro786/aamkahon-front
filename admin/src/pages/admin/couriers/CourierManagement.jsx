// Aamkahon: courier companies (AJR, Sundarban, Steadfast...). Products tick
// which couriers may carry them (product form, "Selling & Season"); checkout
// offers only couriers every product in the bag allows. A courier that takes
// no cash makes the order full payment online (backend services/couriers.js).
import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { courierApi } from "../../../api/courierApi";
import ConfirmDialog from "../../../components/admin/common/ConfirmDialog";

const field = "w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400";
const EMPTY = { key: "", name: "", codAllowed: true, isDefault: true, note: "", trackingUrl: "", isActive: true, sortOrder: 0 };

function CourierForm({ initial, onCancel, onSaved }) {
    const isEdit = Boolean(initial._id);
    const [form, setForm] = useState(initial);
    const [saving, setSaving] = useState(false);
    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) return toast.error("Name is required");
        setSaving(true);
        try {
            const payload = { ...form, sortOrder: Number(form.sortOrder) || 0 };
            delete payload._id;
            delete payload.createdAt;
            delete payload.updatedAt;
            delete payload.__v;
            if (isEdit) {
                delete payload.key;
                await courierApi.update(initial._id, payload);
            } else {
                await courierApi.create(payload);
            }
            toast.success("Saved");
            onSaved();
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not save");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={submit} className="grid gap-3 rounded-lg border border-gray-300 bg-gray-50 p-4 sm:grid-cols-2">
            <label className="text-sm text-gray-700">
                Name
                <input className={`${field} mt-1`} value={form.name} onChange={set("name")} maxLength={80} placeholder="Sundarban Courier" autoFocus />
            </label>
            <label className="text-sm text-gray-700">
                Key {isEdit && <span className="text-xs text-gray-400">(fixed)</span>}
                <input
                    className={`${field} mt-1 font-mono disabled:bg-gray-100`}
                    value={form.key}
                    onChange={(e) => setForm((f) => ({ ...f, key: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))}
                    disabled={isEdit}
                    maxLength={40}
                    placeholder="sundarban"
                />
            </label>
            <label className="text-sm text-gray-700 sm:col-span-2">
                Note for customers (product page and checkout)
                <input className={`${field} mt-1`} value={form.note} onChange={set("note")} maxLength={200} placeholder="Cash on delivery or online payment." />
            </label>
            <label className="text-sm text-gray-700">
                Tracking link (optional, {"{id}"} = consignment id)
                <input className={`${field} mt-1`} value={form.trackingUrl} onChange={set("trackingUrl")} maxLength={300} placeholder="https://..." />
            </label>
            <label className="text-sm text-gray-700">
                Order in lists
                <input className={`${field} mt-1`} type="number" min={0} max={999} value={form.sortOrder} onChange={set("sortOrder")} />
            </label>
            <div className="space-y-2 text-sm text-gray-700 sm:col-span-2">
                <label className="flex items-start gap-2">
                    <input type="checkbox" className="mt-0.5" checked={form.codAllowed} onChange={set("codAllowed")} />
                    <span>
                        Collects cash on delivery
                        <span className="block text-xs text-gray-500">Untick for couriers like AJR: the customer then pays product price and delivery in full online.</span>
                    </span>
                </label>
                <label className="flex items-start gap-2">
                    <input type="checkbox" className="mt-0.5" checked={form.isDefault} onChange={set("isDefault")} />
                    <span>
                        Use for products that do not choose couriers
                        <span className="block text-xs text-gray-500">Untick for a courier only some products use (AJR is mango only).</span>
                    </span>
                </label>
                <label className="flex items-center gap-2">
                    <input type="checkbox" checked={form.isActive} onChange={set("isActive")} /> Active (offered at checkout)
                </label>
            </div>
            <div className="flex justify-end gap-2 sm:col-span-2">
                <button type="button" onClick={onCancel} className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm">Cancel</button>
                <button disabled={saving} className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
            </div>
        </form>
    );
}

export default function CourierManagement() {
    const { isAdmin } = useAuth();
    const [couriers, setCouriers] = useState([]);
    const [usage, setUsage] = useState({});
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null); // "new" | id
    const [toDelete, setToDelete] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await courierApi.list();
            setCouriers(data.couriers || []);
            setUsage(data.usage || {});
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not load couriers");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const remove = async () => {
        try {
            await courierApi.remove(toDelete._id);
            toast.success("Deleted");
            setToDelete(null);
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Delete failed");
            setToDelete(null);
        }
    };

    const done = () => {
        setEditing(null);
        load();
    };

    return (
        <div className="space-y-4 pb-10">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="max-w-2xl text-sm text-gray-500">
                    Each product chooses its couriers in the product form. At checkout the customer picks from the couriers every product in the bag allows. A courier that does not collect cash makes the order full payment online, delivery included.
                </p>
                {isAdmin && editing !== "new" && (
                    <button onClick={() => setEditing("new")} className="inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800">
                        <Plus size={15} /> Add courier
                    </button>
                )}
            </div>
            {editing === "new" && <CourierForm initial={EMPTY} onCancel={() => setEditing(null)} onSaved={done} />}

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                {loading ? (
                    <div className="p-10 text-center text-sm text-gray-500">Loading...</div>
                ) : couriers.length === 0 ? (
                    <div className="p-10 text-center text-sm text-gray-500">No couriers yet. Without couriers, checkout does not ask for one.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="px-4 py-3">Courier</th>
                                    <th className="px-4 py-3">Payment</th>
                                    <th className="px-4 py-3">Used by</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {couriers.map((c) =>
                                    editing === c._id ? (
                                        <tr key={c._id}>
                                            <td colSpan={5} className="p-3">
                                                <CourierForm initial={{ ...EMPTY, ...c }} onCancel={() => setEditing(null)} onSaved={done} />
                                            </td>
                                        </tr>
                                    ) : (
                                        <tr key={c._id} className="align-top">
                                            <td className="px-4 py-3">
                                                <span className="font-medium text-gray-900">{c.name}</span> <span className="font-mono text-xs text-gray-400">{c.key}</span>
                                                {c.note && <p className="mt-0.5 max-w-md text-xs text-gray-500">{c.note}</p>}
                                            </td>
                                            <td className="px-4 py-3">
                                                {c.codAllowed ? (
                                                    <span className="text-gray-700">COD or online</span>
                                                ) : (
                                                    <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">Full payment online</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {usage[c.key] ? `${usage[c.key]} product${usage[c.key] > 1 ? "s" : ""} ticked` : "No product ticked"}
                                                {c.isDefault && <span className="block text-xs text-gray-400">+ products with no courier chosen</span>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`rounded-full px-2 py-0.5 text-xs ${c.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>{c.isActive ? "Active" : "Off"}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {isAdmin && (
                                                    <div className="flex justify-end gap-1">
                                                        <button onClick={() => setEditing(c._id)} className="rounded p-1.5 text-gray-500 hover:bg-gray-100" aria-label="Edit"><Pencil size={15} /></button>
                                                        <button onClick={() => setToDelete(c)} className="rounded p-1.5 text-red-500 hover:bg-red-50" aria-label="Delete"><Trash2 size={15} /></button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ),
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={Boolean(toDelete)}
                title="Delete courier"
                message={`${toDelete?.name} will be removed. Old orders keep the name they were sent with.`}
                onConfirm={remove}
                onCancel={() => setToDelete(null)}
            />
        </div>
    );
}
