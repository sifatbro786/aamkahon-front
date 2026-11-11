// Aamkahon: stock levels per product and pack size, stock in/out/count, and the
// full history (orders + manual changes) from the StockMovement ledger.
import { useCallback, useEffect, useState } from "react";
import { Link } from "@/admin/router";
import { History, PackagePlus, RefreshCw, Search } from "lucide-react";
import toast from "react-hot-toast";
import { stockApi } from "../../../api/stockApi";
import Pagination from "../../../components/admin/common/Pagination";
import StockAdjustModal from "../../../components/admin/stock/StockAdjustModal";

const TYPE_LABEL = {
    purchase: "Received",
    return: "Customer return",
    damage: "Damaged",
    correction: "Count correction",
    order: "Sold (order)",
    order_cancel: "Order cancelled / edited",
    other: "Other",
};
const AVAIL = { in_stock: "In stock", pre_order: "Pre-booking", out_of_season: "Out of season" };
const select = "rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400";
const fmt = (d) => new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

function level(stock, alert) {
    if (stock <= 0) return "bg-red-100 text-red-700";
    if (stock <= alert) return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
}

function Levels({ onHistory }) {
    const [rows, setRows] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [q, setQ] = useState("");
    const [status, setStatus] = useState("");
    const [availability, setAvailability] = useState("");
    const [adjusting, setAdjusting] = useState(null); // { item, variant }

    useEffect(() => {
        const t = setTimeout(() => setQ(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await stockApi.list({ page, limit: 25, search: q || undefined, status: status || undefined, availability: availability || undefined });
            setRows(data.items || []);
            setSummary(data.summary);
            setTotalPages(data.totalPages || 1);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load stock");
        } finally {
            setLoading(false);
        }
    }, [page, q, status, availability]);

    useEffect(() => {
        load();
    }, [load]);

    const adjustBtn = (item, variant) => (
        <button onClick={() => setAdjusting({ item, variant })} className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50">
            <PackagePlus size={13} /> Update
        </button>
    );

    return (
        <div className="space-y-4">
            {summary && (
                <div className="grid grid-cols-3 gap-3">
                    {[
                        ["Products", summary.products, ""],
                        ["Low stock", summary.lowStock, "low"],
                        ["Out of stock", summary.outOfStock, "out"],
                    ].map(([l, v, s]) => (
                        <button
                            key={l}
                            onClick={() => {
                                setStatus(s);
                                setPage(1);
                            }}
                            className={`rounded-lg border bg-white p-4 text-left ${status === s ? "border-gray-900" : "border-gray-200 hover:border-gray-300"}`}
                        >
                            <p className="text-xs text-gray-500">{l}</p>
                            <p className="mt-1 text-2xl font-semibold text-gray-900">{v}</p>
                        </button>
                    ))}
                </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full sm:w-72">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Product name or SKU" className="w-full rounded-md border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-gray-400" />
                </div>
                <select className={select} value={availability} onChange={(e) => { setAvailability(e.target.value); setPage(1); }}>
                    <option value="">All availability</option>
                    {Object.entries(AVAIL).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                    ))}
                </select>
                <button onClick={load} className="rounded-md border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50" title="Refresh"><RefreshCw size={16} /></button>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                {loading ? (
                    <div className="p-10 text-center text-sm text-gray-500">Loading...</div>
                ) : rows.length === 0 ? (
                    <div className="p-10 text-center text-sm text-gray-500">Nothing here.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="px-4 py-3">Product</th>
                                    <th className="px-4 py-3">Pack / size</th>
                                    <th className="px-4 py-3 text-right">In stock</th>
                                    <th className="px-4 py-3">Availability</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {rows.flatMap((p) => {
                                    const lines = p.hasVariants && p.variants.length ? p.variants : [null];
                                    return lines.map((v, i) => {
                                        const stock = v ? v.stock : p.stock;
                                        return (
                                            <tr key={`${p._id}-${v?.label || "base"}`} className="hover:bg-gray-50/60">
                                                <td className="px-4 py-2.5">
                                                    {i === 0 && (
                                                        <div className="flex items-center gap-3">
                                                            {p.image ? <img src={p.image} alt="" className="h-9 w-9 rounded object-cover" /> : <div className="h-9 w-9 rounded bg-gray-100" />}
                                                            <div>
                                                                <Link to={`/admin/products/${p._id}/edit`} className="font-medium text-gray-900 hover:underline">{p.name}</Link>
                                                                {p.nameBn && <p lang="bn" className="text-xs text-gray-500">{p.nameBn}</p>}
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2.5 text-gray-600">{v ? v.label : <span className="text-gray-400">Single</span>}</td>
                                                <td className="px-4 py-2.5 text-right">
                                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${level(stock, p.lowStockAlert)}`}>
                                                        {stock} {p.unit}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2.5 text-gray-600">{i === 0 ? AVAIL[p.availability] : ""}</td>
                                                <td className="px-4 py-2.5">
                                                    <div className="flex justify-end gap-1.5">
                                                        {adjustBtn(p, v)}
                                                        {i === 0 && (
                                                            <button onClick={() => onHistory(p)} className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100" title="History"><History size={15} /></button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    });
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
            <p className="text-xs text-gray-400">Pre-booking products sell without stock; stock is taken when the order is set to Confirmed.</p>

            {adjusting && (
                <StockAdjustModal
                    item={adjusting.item}
                    variant={adjusting.variant}
                    onClose={() => setAdjusting(null)}
                    onSaved={() => {
                        setAdjusting(null);
                        load();
                    }}
                />
            )}
        </div>
    );
}

function Movements({ product, onClear }) {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [type, setType] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await stockApi.movements({ page, limit: 30, product: product?._id, type: type || undefined });
            setRows(data.movements || []);
            setTotalPages(data.totalPages || 1);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load history");
        } finally {
            setLoading(false);
        }
    }, [page, product, type]);

    useEffect(() => {
        load();
    }, [load]);

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                {product && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-3 py-1 text-sm text-white">
                        {product.name}
                        <button onClick={onClear} className="text-white/70 hover:text-white" aria-label="Show all products">×</button>
                    </span>
                )}
                <select className={select} value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
                    <option value="">All changes</option>
                    {Object.entries(TYPE_LABEL).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                    ))}
                </select>
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                {loading ? (
                    <div className="p-10 text-center text-sm text-gray-500">Loading...</div>
                ) : rows.length === 0 ? (
                    <div className="p-10 text-center text-sm text-gray-500">No stock changes recorded yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="px-4 py-3">When</th>
                                    <th className="px-4 py-3">Product</th>
                                    <th className="px-4 py-3">Change</th>
                                    <th className="px-4 py-3 text-right">Qty</th>
                                    <th className="px-4 py-3 text-right">Stock after</th>
                                    <th className="px-4 py-3">By / note</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {rows.map((m) => (
                                    <tr key={m._id}>
                                        <td className="whitespace-nowrap px-4 py-2.5 text-gray-500">{fmt(m.createdAt)}</td>
                                        <td className="px-4 py-2.5 text-gray-900">
                                            {m.productName}
                                            {m.variantLabel ? <span className="text-gray-500"> · {m.variantLabel}</span> : null}
                                        </td>
                                        <td className="px-4 py-2.5 text-gray-600">
                                            {TYPE_LABEL[m.type] || m.type}
                                            {m.order && (
                                                <Link to={`/admin/orders/${m.order}`} className="ml-1 text-blue-600 hover:underline">{m.orderNumber}</Link>
                                            )}
                                        </td>
                                        <td className={`px-4 py-2.5 text-right font-medium ${m.change < 0 ? "text-red-600" : "text-green-700"}`}>
                                            {m.change > 0 ? `+${m.change}` : m.change}
                                        </td>
                                        <td className="px-4 py-2.5 text-right text-gray-800">{m.after ?? ""} {m.unit || ""}</td>
                                        <td className="px-4 py-2.5 text-xs text-gray-500">
                                            {m.by?.name || "System"}
                                            {m.note ? ` · ${m.note}` : ""}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
        </div>
    );
}

export default function StockManagement() {
    const [tab, setTab] = useState("levels");
    const [product, setProduct] = useState(null);

    return (
        <div className="space-y-4">
            <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
                {[
                    ["levels", "Stock levels"],
                    ["history", "History"],
                ].map(([v, l]) => (
                    <button key={v} onClick={() => setTab(v)} className={`rounded-md px-4 py-1.5 text-sm ${tab === v ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"}`}>
                        {l}
                    </button>
                ))}
            </div>
            {tab === "levels" ? (
                <Levels
                    onHistory={(p) => {
                        setProduct(p);
                        setTab("history");
                    }}
                />
            ) : (
                <Movements product={product} onClear={() => setProduct(null)} />
            )}
        </div>
    );
}
