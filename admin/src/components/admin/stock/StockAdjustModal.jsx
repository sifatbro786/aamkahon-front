// Receive / remove / count stock for one product or variant.
// The server applies it atomically and writes the ledger row.
import { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { stockApi } from "../../../api/stockApi";

const MODES = [
    { v: "in", t: "Stock in", d: "New harvest, supplier delivery, customer return", types: [["purchase", "Received / purchase"], ["return", "Customer return"], ["other", "Other"]] },
    { v: "out", t: "Stock out", d: "Spoiled, damaged, expired, given away", types: [["damage", "Damaged / spoiled"], ["other", "Other"]] },
    { v: "set", t: "Set to count", d: "After counting the store, set the exact number", types: [["correction", "Stock count correction"]] },
];
const field = "w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400";

export default function StockAdjustModal({ item, variant, onClose, onSaved }) {
    const [mode, setMode] = useState("in");
    const [type, setType] = useState("purchase");
    const [quantity, setQuantity] = useState("");
    const [note, setNote] = useState("");
    const [saving, setSaving] = useState(false);
    const current = variant ? variant.stock : item.stock;
    const q = parseInt(quantity, 10);
    const after = !Number.isInteger(q) ? null : mode === "in" ? current + q : mode === "out" ? current - q : q;

    const pickMode = (m) => {
        setMode(m.v);
        setType(m.types[0][0]);
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!Number.isInteger(q) || q < 0 || (mode !== "set" && q === 0)) return toast.error("Enter a whole number");
        if (after < 0) return toast.error(`Only ${current} in stock`);
        setSaving(true);
        try {
            const { data } = await stockApi.adjust({ productId: item._id, options: variant?.options, mode, quantity: q, type, note: note.trim() || undefined });
            toast.success(`Stock is now ${data.after} ${item.unit}`);
            onSaved();
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not update stock");
        } finally {
            setSaving(false);
        }
    };

    const m = MODES.find((x) => x.v === mode);
    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
            <form onSubmit={submit} className="my-10 w-full max-w-md rounded-lg bg-white shadow-xl">
                <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Update stock</h2>
                        <p className="text-sm text-gray-500">
                            {item.name}
                            {variant ? ` · ${variant.label}` : ""} · now {current} {item.unit}
                        </p>
                    </div>
                    <button type="button" onClick={onClose} className="rounded p-1 text-gray-500 hover:bg-gray-100" aria-label="Close">
                        <X size={18} />
                    </button>
                </div>
                <div className="space-y-4 p-5">
                    <div className="grid grid-cols-3 gap-2">
                        {MODES.map((x) => (
                            <button key={x.v} type="button" onClick={() => pickMode(x)} className={`rounded-md border px-2 py-2 text-sm ${mode === x.v ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
                                {x.t}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500">{m.d}</p>
                    <div className="grid grid-cols-2 gap-3">
                        <label className="text-sm text-gray-700">
                            {mode === "set" ? "Counted quantity" : "Quantity"} ({item.unit})
                            <input type="number" min={mode === "set" ? 0 : 1} step="1" className={`${field} mt-1`} value={quantity} onChange={(e) => setQuantity(e.target.value)} autoFocus required />
                        </label>
                        <label className="text-sm text-gray-700">
                            Reason
                            <select className={`${field} mt-1`} value={type} onChange={(e) => setType(e.target.value)}>
                                {m.types.map(([v, l]) => (
                                    <option key={v} value={v}>{l}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                    <label className="block text-sm text-gray-700">
                        Note (optional)
                        <input className={`${field} mt-1`} value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} placeholder="e.g. Batch from Bagha orchard, 12 crates" />
                    </label>
                    {after !== null && (
                        <p className={`rounded-md px-3 py-2 text-sm ${after < 0 ? "bg-red-50 text-red-700" : "bg-gray-50 text-gray-700"}`}>
                            {current} → <span className="font-semibold">{after}</span> {item.unit}
                        </p>
                    )}
                </div>
                <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
                    <button type="button" onClick={onClose} className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                    <button disabled={saving} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
                </div>
            </form>
        </div>
    );
}
