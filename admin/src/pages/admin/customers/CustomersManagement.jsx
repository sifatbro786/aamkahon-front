// Aamkahon: customer / lead book for marketing. Old customers come in by CSV,
// new ones are added by hand, and storefront orders and inquiries add
// themselves (backend services/customerSync.js). Plain grey dashboard style.
import { useCallback, useEffect, useState } from "react";
import { Download, MessageCircle, Pencil, Phone, Plus, RefreshCw, Search, Trash2, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { customerAdminApi } from "../../../api/customerAdminApi";
import Pagination from "../../../components/admin/common/Pagination";
import ConfirmDialog from "../../../components/admin/common/ConfirmDialog";
import CustomerFormModal from "../../../components/admin/customers/CustomerFormModal";
import CustomerImportModal from "../../../components/admin/customers/CustomerImportModal";

const SOURCE_LABEL = { manual: "Manual", import: "Imported", order: "Order", inquiry: "Inquiry" };
const select = "rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400";
const waLink = (phone) => `https://wa.me/88${phone}`;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "");

export default function CustomersManagement() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [tags, setTags] = useState([]);
    const [counts, setCounts] = useState({});
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [q, setQ] = useState("");
    const [filters, setFilters] = useState({ source: "", tag: "", optIn: "", sort: "newest" });
    const [editing, setEditing] = useState(null); // {} for new, customer for edit
    const [importing, setImporting] = useState(false);
    const [toDelete, setToDelete] = useState(null);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setQ(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    const params = useCallback(
        () => Object.fromEntries(Object.entries({ ...filters, search: q }).filter(([, v]) => v !== "")),
        [filters, q],
    );

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await customerAdminApi.list({ ...params(), page, limit: 25 });
            setRows(data.customers || []);
            setTotal(data.total || 0);
            setTotalPages(data.totalPages || 1);
            setTags(data.tags || []);
            setCounts(data.sourceCounts || {});
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load customers");
        } finally {
            setLoading(false);
        }
    }, [params, page]);

    useEffect(() => {
        load();
    }, [load]);

    const setFilter = (k) => (e) => {
        setFilters((f) => ({ ...f, [k]: e.target.value }));
        setPage(1);
    };

    const exportCsv = async () => {
        setExporting(true);
        try {
            const { data } = await customerAdminApi.exportCsv(params());
            const url = URL.createObjectURL(data);
            const a = document.createElement("a");
            a.href = url;
            a.download = `customers-${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            toast.error("Export failed");
        } finally {
            setExporting(false);
        }
    };

    const remove = async () => {
        try {
            await customerAdminApi.remove(toDelete._id);
            toast.success("Customer deleted");
            setToDelete(null);
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Delete failed");
        }
    };

    const allCount = Object.values(counts).reduce((a, b) => a + b, 0);

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                <div>
                    <p className="text-sm text-gray-500">
                        {allCount} in total
                        {Object.entries(counts).map(([k, v]) => ` · ${v} ${SOURCE_LABEL[k]?.toLowerCase() || k}`)}
                    </p>
                </div>
                <div className="ml-auto flex flex-wrap gap-2">
                    <button onClick={exportCsv} disabled={exporting} className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50" title="Exports the current filter. Customers who opted out are left out.">
                        <Download size={16} /> {exporting ? "Exporting..." : "Export CSV"}
                    </button>
                    <button onClick={() => setImporting(true)} className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Upload size={16} /> Import CSV
                    </button>
                    <button onClick={() => setEditing({})} className="inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800">
                        <Plus size={16} /> Add customer
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full sm:w-72">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Name, phone, district"
                        className="w-full rounded-md border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-gray-400"
                    />
                </div>
                <select className={select} value={filters.source} onChange={setFilter("source")}>
                    <option value="">All sources</option>
                    {Object.entries(SOURCE_LABEL).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                    ))}
                </select>
                <select className={select} value={filters.tag} onChange={setFilter("tag")}>
                    <option value="">All tags</option>
                    {tags.map((t) => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>
                <select className={select} value={filters.optIn} onChange={setFilter("optIn")}>
                    <option value="">Any promo status</option>
                    <option value="true">Gets promotions</option>
                    <option value="false">Opted out</option>
                </select>
                <select className={select} value={filters.sort} onChange={setFilter("sort")}>
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="name">Name A to Z</option>
                    <option value="lastOrder">Last order</option>
                    <option value="orders">Most orders</option>
                </select>
                <button onClick={load} className="rounded-md border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50" title="Refresh">
                    <RefreshCw size={16} />
                </button>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                {loading ? (
                    <div className="p-10 text-center text-sm text-gray-500">Loading...</div>
                ) : rows.length === 0 ? (
                    <div className="p-10 text-center text-sm text-gray-500">No customers yet. Import your old list or add one by hand.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Phone</th>
                                    <th className="px-4 py-3">District</th>
                                    <th className="px-4 py-3">Tags</th>
                                    <th className="px-4 py-3">Source</th>
                                    <th className="px-4 py-3 text-right">Orders</th>
                                    <th className="px-4 py-3">Added</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {rows.map((c) => (
                                    <tr key={c._id} className="hover:bg-gray-50/60">
                                        <td className="px-4 py-3">
                                            <span className="font-medium text-gray-900">{c.name || <span className="text-gray-400">No name</span>}</span>
                                            {!c.marketingOptIn && <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">opted out</span>}
                                            {c.note && <p className="mt-0.5 max-w-xs truncate text-xs text-gray-500">{c.note}</p>}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-gray-800">{c.phone}</td>
                                        <td className="px-4 py-3 text-gray-600">{c.district}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex max-w-[220px] flex-wrap gap-1">
                                                {(c.tags || []).map((t) => (
                                                    <span key={t} className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">{t}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{SOURCE_LABEL[c.source] || c.source}</td>
                                        <td className="px-4 py-3 text-right text-gray-800">
                                            {c.ordersPlaced || 0}
                                            {c.lastOrderAt && <span className="block text-xs text-gray-400">{fmtDate(c.lastOrderAt)}</span>}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">{fmtDate(c.createdAt)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-1">
                                                <a href={`tel:${c.phone}`} className="rounded p-1.5 text-gray-500 hover:bg-gray-100" title="Call"><Phone size={15} /></a>
                                                <a href={waLink(c.phone)} target="_blank" rel="noreferrer" className="rounded p-1.5 text-gray-500 hover:bg-gray-100" title="WhatsApp"><MessageCircle size={15} /></a>
                                                <button onClick={() => setEditing(c)} className="rounded p-1.5 text-gray-500 hover:bg-gray-100" title="Edit"><Pencil size={15} /></button>
                                                <button onClick={() => setToDelete(c)} className="rounded p-1.5 text-red-500 hover:bg-red-50" title="Delete"><Trash2 size={15} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
            {!loading && <p className="text-xs text-gray-400">{total} match the current filter.</p>}

            {editing && (
                <CustomerFormModal
                    customer={editing}
                    onClose={() => setEditing(null)}
                    onSaved={() => {
                        setEditing(null);
                        load();
                    }}
                />
            )}
            {importing && <CustomerImportModal onClose={() => setImporting(false)} onDone={load} />}
            <ConfirmDialog
                open={Boolean(toDelete)}
                title="Delete customer"
                message={`${toDelete?.name || toDelete?.phone} will be removed from the customer list. Orders are not affected.`}
                onConfirm={remove}
                onCancel={() => setToDelete(null)}
            />
        </div>
    );
}
