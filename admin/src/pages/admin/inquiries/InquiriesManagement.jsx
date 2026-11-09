// Aamkahon: price / availability / wholesale / pre-booking inquiries from the
// storefront (POST /api/inquiries). Plain grey dashboard style like the rest.
import { useCallback, useEffect, useState } from "react";
import { MessageCircle, Phone, RefreshCw, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { inquiryAdminApi } from "../../../api/inquiryAdminApi";
import Pagination from "../../../components/admin/common/Pagination";
import ConfirmDialog from "../../../components/admin/common/ConfirmDialog";

const STATUSES = ["new", "contacted", "quoted", "converted", "closed"];
const STATUS_STYLES = {
    new: "bg-orange-100 text-orange-700",
    contacted: "bg-blue-100 text-blue-700",
    quoted: "bg-indigo-100 text-indigo-700",
    converted: "bg-green-100 text-green-700",
    closed: "bg-gray-200 text-gray-600",
};
const TYPE_LABEL = { price: "Price", availability: "Availability", wholesale: "Wholesale", pre_booking: "Pre-booking", general: "General" };

const waLink = (phone) => `https://wa.me/${String(phone).replace(/\D/g, "").replace(/^0/, "880")}`;

export default function InquiriesManagement() {
    const [rows, setRows] = useState([]);
    const [counts, setCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("");
    const [search, setSearch] = useState("");
    const [q, setQ] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [open, setOpen] = useState(null);
    const [note, setNote] = useState("");
    const [toDelete, setToDelete] = useState(null);

    useEffect(() => {
        const t = setTimeout(() => setQ(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await inquiryAdminApi.list({ page, limit: 20, status: status || undefined, search: q || undefined });
            setRows(data.inquiries || []);
            setCounts(data.statusCounts || {});
            setTotalPages(data.totalPages || 1);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load inquiries");
        } finally {
            setLoading(false);
        }
    }, [page, status, q]);

    useEffect(() => {
        load();
    }, [load]);

    const patch = async (id, payload, msg) => {
        try {
            const { data } = await inquiryAdminApi.update(id, payload);
            setRows((r) => r.map((x) => (x._id === id ? { ...x, ...data.inquiry } : x)));
            if (msg) toast.success(msg);
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || "Update failed");
            return false;
        }
    };

    const remove = async () => {
        try {
            await inquiryAdminApi.remove(toDelete._id);
            toast.success("Inquiry deleted");
            setToDelete(null);
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Delete failed");
        }
    };

    const total = Object.values(counts).reduce((a, b) => a + b, 0);

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                {[["", `All (${total})`], ...STATUSES.map((s) => [s, `${s[0].toUpperCase()}${s.slice(1)} (${counts[s] || 0})`])].map(([v, label]) => (
                    <button
                        key={v || "all"}
                        onClick={() => {
                            setStatus(v);
                            setPage(1);
                        }}
                        className={`rounded-full px-3 py-1.5 text-sm ${status === v ? "bg-gray-900 text-white" : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}
                    >
                        {label}
                    </button>
                ))}
                <div className="relative ml-auto w-full sm:w-64">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Name, phone, product"
                        className="w-full rounded-md border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-gray-400"
                    />
                </div>
                <button onClick={load} className="rounded-md border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50" title="Refresh">
                    <RefreshCw size={16} />
                </button>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                {loading ? (
                    <div className="p-10 text-center text-sm text-gray-500">Loading...</div>
                ) : rows.length === 0 ? (
                    <div className="p-10 text-center text-sm text-gray-500">No inquiries here.</div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {rows.map((r) => (
                            <li key={r._id} className="p-4">
                                <div className="flex flex-wrap items-start gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-semibold text-gray-900">{r.name}</span>
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[r.status]}`}>{r.status}</span>
                                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{TYPE_LABEL[r.type] || r.type}</span>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-600">
                                            {r.productName || "General inquiry"}
                                            {r.variantLabel ? ` · ${r.variantLabel}` : ""}
                                            {r.quantity ? ` · ${r.quantity} ${r.unit || ""}` : ""}
                                            {r.district ? ` · ${r.district}` : ""}
                                        </p>
                                        {r.message && <p className="mt-2 whitespace-pre-line text-sm text-gray-800">{r.message}</p>}
                                        <p className="mt-2 text-xs text-gray-400">{new Date(r.createdAt).toLocaleString("en-GB")}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <a href={`tel:${r.phone}`} className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                                            <Phone size={14} /> {r.phone}
                                        </a>
                                        <a href={waLink(r.phone)} target="_blank" rel="noopener noreferrer" className="rounded-md border border-gray-200 p-2 text-green-700 hover:bg-gray-50" title="WhatsApp">
                                            <MessageCircle size={15} />
                                        </a>
                                        <select
                                            value={r.status}
                                            onChange={(e) => patch(r._id, { status: e.target.value }, "Status updated")}
                                            className="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm"
                                        >
                                            {STATUSES.map((s) => (
                                                <option key={s}>{s}</option>
                                            ))}
                                        </select>
                                        <button onClick={() => setToDelete(r)} className="rounded-md p-2 text-gray-400 hover:bg-red-50 hover:text-red-600" title="Delete">
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>

                                <button onClick={() => setOpen(open === r._id ? null : r._id)} className="mt-3 text-xs font-medium text-gray-500 hover:text-gray-900">
                                    {open === r._id ? "Hide notes" : `Notes and quote (${r.adminNotes?.length || 0})`}
                                </button>
                                {open === r._id && (
                                    <div className="mt-3 space-y-3 rounded-md bg-gray-50 p-3">
                                        <label className="flex items-center gap-2 text-sm text-gray-700">
                                            Quoted unit price (BDT)
                                            <input
                                                type="number"
                                                min="0"
                                                defaultValue={r.quotedPrice ?? ""}
                                                onBlur={(e) => e.target.value !== String(r.quotedPrice ?? "") && patch(r._id, { quotedPrice: e.target.value === "" ? null : Number(e.target.value) }, "Quote saved")}
                                                className="w-28 rounded-md border border-gray-200 px-2 py-1"
                                            />
                                        </label>
                                        {(r.adminNotes || []).map((n, i) => (
                                            <p key={i} className="text-sm text-gray-700">
                                                <span className="text-xs text-gray-400">{new Date(n.addedAt).toLocaleString("en-GB")} {n.addedBy?.name ? `· ${n.addedBy.name}` : ""}</span>
                                                <br />
                                                {n.note}
                                            </p>
                                        ))}
                                        <div className="flex gap-2">
                                            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note (call outcome, quote sent...)" className="flex-1 rounded-md border border-gray-200 px-3 py-1.5 text-sm" />
                                            <button
                                                onClick={async () => {
                                                    if (note.trim() && (await patch(r._id, { note: note.trim() }, "Note added"))) setNote("");
                                                }}
                                                className="rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            <ConfirmDialog
                open={Boolean(toDelete)}
                title="Delete inquiry"
                message={`Delete the inquiry from ${toDelete?.name}? This cannot be undone.`}
                confirmLabel="Delete"
                onConfirm={remove}
                onCancel={() => setToDelete(null)}
            />
        </div>
    );
}
