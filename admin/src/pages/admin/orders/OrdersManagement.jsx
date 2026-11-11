/* eslint-disable no-unused-vars */
// src/pages/admin/orders/OrdersManagement.jsx
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "@/admin/router";
import { Search, RefreshCw, Eye, Package, Clock, CheckCircle2, Wallet, Download, PhoneCall } from "lucide-react";
import toast from "react-hot-toast";
import { orderApi } from "../../../api/orderApi";
import { exportCsv } from "../../../lib/admin/exportCsv";
import Pagination from "../../../components/admin/common/Pagination";
import OrderStatusBadge from "../../../components/admin/orders/OrderStatusBadge";
import PaymentStatusBadge from "../../../components/admin/orders/PaymentStatusBadge";

// Order.js `orderStatus` enum — exact 7 values, in schema order
const ORDER_STATUSES = [
    "Pending",
    "Pre-booked", // Aamkahon: advance paid, waiting for harvest
    "Confirmed",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
    "Refunded",
];
// Order.js `paymentStatus` enum
const PAYMENT_STATUSES = ["Pending", "Partial", "Paid", "Failed", "Refunded"];

const formatBDT = (n) =>
    `\u09F3${Number(n || 0).toLocaleString("en-BD", { minimumFractionDigits: 2 })}`;

const StatCard = ({ icon: Icon, label, value, tint }) => (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tint}`}>
            <Icon size={20} />
        </div>
        <div className="min-w-0">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="truncate text-lg font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

// Aamkahon: two screens share this list.
//   Orders       = ?view=orders: everything that ships now (web, phone, and
//                  pre-bookings once Confirmed)
//   Pre-bookings = ?view=prebookings: pre-orders still Pending / Pre-booked
// They are split so a pre-booking never sits in the daily packing list, and
// each screen shows the numbers that matter for it.
const OrdersManagement = ({ orderType = "regular" } = {}) => {
    const isPre = orderType === "pre_order";
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [paymentMethod, setPaymentMethod] = useState("all");
    const [paymentStatus, setPaymentStatus] = useState("all");

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        orderApi
            .getStats({ view: isPre ? "prebookings" : "orders" })
            .then(({ data }) => setStats(data.stats))
            .catch(() => {});
    }, [isPre]);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await orderApi.getAll({
                page,
                limit: 10,
                status: status !== "all" ? status : undefined,
                paymentMethod: paymentMethod !== "all" ? paymentMethod : undefined,
                paymentStatus: paymentStatus !== "all" ? paymentStatus : undefined,
                search: debouncedSearch || undefined,
                view: isPre ? "prebookings" : "orders",
                // Pre-bookings: nearest harvest first, that is the work order.
                ...(isPre ? { sortBy: "preOrder.expectedDate", sortOrder: "asc" } : {}),
            });
            setOrders(data.orders || []);
            setTotal(data.total || 0);
            setTotalPages(data.pages || 1);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load orders");
        } finally {
            setLoading(false);
        }
    }, [page, status, paymentMethod, paymentStatus, debouncedSearch, isPre]);

    useEffect(() => {
        load();
    }, [load]);

    // reset to page 1 whenever a filter changes
    useEffect(() => {
        setPage(1);
    }, [status, paymentMethod, paymentStatus, debouncedSearch]);

    const refresh = () => {
        load();
        orderApi
            .getStats({ view: isPre ? "prebookings" : "orders" })
            .then(({ data }) => setStats(data.stats))
            .catch(() => {});
    };

    /**
     * Export the orders currently listed.
     *
     * Scoped to THIS page of results, not the whole collection: getAllOrders is
     * paginated and the filters above are what the operator actually chose, so
     * exporting anything else would quietly disagree with what they are looking
     * at. The button title says as much.
     *
     * Customer name and phone are user-supplied, so exportCsv neutralises any
     * leading =, +, - or @ before writing, otherwise a name like "=HYPERLINK(..)"
     * executes when the file is opened in Excel.
     */
    const handleExport = () => {
        if (orders.length === 0) {
            toast.error("There are no orders to export.");
            return;
        }

        exportCsv({
            filename: "orders",
            columns: [
                { label: "Order number", key: "orderNumber" },
                {
                    label: "Placed",
                    format: (o) => new Date(o.createdAt).toISOString().slice(0, 10),
                },
                { label: "Customer", format: (o) => o.shippingAddress?.name ?? "" },
                { label: "Phone", format: (o) => o.shippingAddress?.phone ?? "" },
                { label: "District", format: (o) => o.shippingAddress?.district ?? "" },
                { label: "Area", format: (o) => o.shippingAddress?.upazila ?? "" },
                { label: "Items", format: (o) => (o.orderItems ?? []).reduce((n, i) => n + i.quantity, 0) },
                { label: "Order status", key: "orderStatus" },
                { label: "Payment method", key: "paymentMethod" },
                { label: "Payment status", key: "paymentStatus" },
                { label: "Shipping (BDT)", format: (o) => Math.round(o.shippingPrice || 0) },
                { label: "Discount (BDT)", format: (o) => Math.round(o.discountAmount || 0) },
                { label: "Total (BDT)", format: (o) => Math.round(o.totalPrice || 0) },
                { label: "Due on delivery (BDT)", format: (o) => Math.round(o.remainingAmount || 0) },
            ],
            rows: orders,
        });

        toast.success(`Exported ${orders.length} orders`);
    };

    const harvest = (o) => (o.preOrder?.expectedDate ? new Date(o.preOrder.expectedDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Not set");
    const source = (o) => (o.orderSource === "phone" ? "Phone order" : o.isGuest ? "Web, guest" : "Web, registered");
    const cols = 7;
    const selectCls = "w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-gray-500 focus:outline-none";

    return (
        <div className="space-y-5 pb-10">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{isPre ? "Pre-bookings" : "Orders"}</h1>
                    <p className="text-sm text-gray-500">
                        {isPre
                            ? "Advance paid, waiting for the harvest. Nearest harvest date first."
                            : "Orders to pack and ship: website and phone. Pre-bookings have their own page."}
                    </p>
                </div>
                {!isPre && (
                    // Aamkahon: orders taken on the phone are entered here.
                    <Link to="/admin/orders/new" className="inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800">
                        <PhoneCall size={15} /> New phone order
                    </Link>
                )}
            </div>

            {/* Stats — GET /admin/orders/stats?view= */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {isPre ? (
                    <>
                        <StatCard icon={Package} label="Waiting for harvest" value={stats?.preBookedOrders ?? "—"} tint="bg-orange-100 text-orange-600" />
                        <StatCard icon={Clock} label="Advance not paid yet" value={stats?.pendingOrders ?? "—"} tint="bg-yellow-100 text-yellow-600" />
                        <StatCard icon={Wallet} label="Advance received" value={formatBDT(stats?.preOrderAdvance)} tint="bg-green-100 text-green-600" />
                        <StatCard icon={CheckCircle2} label="Balance to collect" value={formatBDT(stats?.preOrderBalance)} tint="bg-purple-100 text-purple-600" />
                    </>
                ) : (
                    <>
                        <StatCard icon={Package} label="Total orders" value={stats?.totalOrders ?? "—"} tint="bg-emerald-100 text-emerald-600" />
                        <StatCard icon={Clock} label="Pending" value={stats?.pendingOrders ?? "—"} tint="bg-yellow-100 text-yellow-600" />
                        <StatCard icon={CheckCircle2} label="Delivered" value={stats?.deliveredOrders ?? "—"} tint="bg-green-100 text-green-600" />
                        <StatCard icon={Wallet} label="Revenue (delivered)" value={formatBDT(stats?.totalRevenue)} tint="bg-purple-100 text-purple-600" />
                    </>
                )}
            </div>

            {/* Filters: wrap instead of a fixed grid, so no field gets squeezed at mid widths. */}
            <div className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-4">
                <div className="min-w-[220px] flex-1">
                    <label className="mb-1 block text-xs font-medium text-gray-500">Search</label>
                    <div className="relative">
                        <Search size={16} className="absolute left-2.5 top-2.5 text-gray-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Order #, name, phone"
                            className="w-full rounded-md border border-gray-300 py-2 pl-8 pr-3 text-sm focus:border-gray-500 focus:outline-none"
                        />
                    </div>
                </div>
                <div className="w-full sm:w-40">
                    <label className="mb-1 block text-xs font-medium text-gray-500">Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls}>
                        <option value="all">All status</option>
                        {(isPre ? ["Pending", "Pre-booked"] : ORDER_STATUSES.filter((s) => s !== "Pre-booked")).map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
                {!isPre && (
                    <div className="w-full sm:w-40">
                        <label className="mb-1 block text-xs font-medium text-gray-500">Payment method</label>
                        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={selectCls}>
                            <option value="all">All methods</option>
                            <option value="COD">COD</option>
                            <option value="SSLCommerz">Paid online</option>
                            <option value="Manual">Phone order</option>
                        </select>
                    </div>
                )}
                <div className="w-full sm:w-40">
                    <label className="mb-1 block text-xs font-medium text-gray-500">Payment status</label>
                    <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className={selectCls}>
                        <option value="all">All</option>
                        {PAYMENT_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        title="Export the orders currently listed"
                        className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <Download size={14} />
                        Export
                    </button>
                    <button
                        onClick={refresh}
                        className="flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
                    >
                        <RefreshCw size={14} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-4 py-3">Order</th>
                                <th className="px-4 py-3">Customer</th>
                                {isPre ? (
                                    <>
                                        <th className="px-4 py-3">Harvest</th>
                                        <th className="px-4 py-3">Advance / balance</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-4 py-3">Amount</th>
                                        <th className="px-4 py-3">Payment</th>
                                    </>
                                )}
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Placed</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={cols} className="px-4 py-10 text-center text-gray-400">Loading…</td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={cols} className="px-4 py-10 text-center text-gray-400">
                                        {isPre ? "No pre-bookings" : "No orders found"}
                                    </td>
                                </tr>
                            ) : (
                                orders.map((o) => (
                                    <tr key={o._id} className="cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/admin/orders/${o._id}`)}>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900">{o.orderNumber}</p>
                                            <p className="text-xs text-gray-400">{source(o)}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-gray-900">{o.shippingAddress?.name || "—"}</p>
                                            <p className="text-xs text-gray-400">
                                                {o.shippingAddress?.phone}
                                                {o.shippingAddress?.district ? ` · ${o.shippingAddress.district}` : ""}
                                            </p>
                                        </td>
                                        {isPre ? (
                                            <>
                                                <td className="px-4 py-3">
                                                    <p className="text-gray-900">{harvest(o)}</p>
                                                    <p className="text-xs text-gray-400">{o.orderItems?.map((i) => i.name).join(", ")}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-gray-900">{formatBDT(o.codOnlinePaymentAmount)}</p>
                                                    <p className="text-xs text-gray-400">{formatBDT(o.remainingAmount)} due · total {formatBDT(o.totalPrice)}</p>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-gray-900">{formatBDT(o.totalPrice)}</p>
                                                    <p className="text-xs text-gray-400">{o.orderItems?.length || 0} items</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <PaymentStatusBadge status={o.paymentStatus} />
                                                    <p className="mt-1 text-xs text-gray-400">{o.paymentMethod === "Manual" ? "Phone" : o.paymentMethod}</p>
                                                </td>
                                            </>
                                        )}
                                        <td className="px-4 py-3">
                                            <OrderStatusBadge status={o.orderStatus} />
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">{new Date(o.createdAt).toLocaleDateString("en-GB")}</td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="inline-flex items-center gap-1 text-blue-600">
                                                <Eye size={14} /> View
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
            <p className="text-xs text-gray-400">{total} {isPre ? "pre-bookings" : "orders"}</p>
        </div>
    );
};

export default OrdersManagement;
