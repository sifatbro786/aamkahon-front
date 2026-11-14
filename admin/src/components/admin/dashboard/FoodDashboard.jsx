// Food store panels for the dashboard: season calendar, lots near their
// best-before, top districts. GET /api/admin/analytics/food
// (analyticsController.getFoodDashboard). Hides itself if the request fails,
// like LowStockWidget: the rest of the dashboard is still useful.
import { useEffect, useState } from "react";
import { CalendarRange, Clock, MapPin } from "lucide-react";
import { Link } from "@/admin/router";
import { analyticsApi } from "../../../api/adminApi";

const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const SEASON_LABEL = { mango: "Mango season", winter: "Winter (gur) season", all: "All year" };
const WINDOWS = [
    [30, "30 days"],
    [90, "90 days"],
    [365, "12 months"],
];
const fmtCurrency = (n) => `৳${Math.round(Number(n || 0)).toLocaleString("en-US")}`;
const fmtDate = (d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const Box = ({ icon: Icon, title, subtitle, right, children }) => (
    <div className="min-w-0 rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 px-4 py-3">
            <div>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <Icon size={15} className="text-gray-400" /> {title}
                </h2>
                {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
            </div>
            {right}
        </div>
        {children}
    </div>
);
const Empty = ({ children }) => <p className="px-4 py-6 text-center text-sm text-gray-400">{children}</p>;

function SeasonCalendar({ rows, activeSeason }) {
    const thisMonth = new Date().getMonth() + 1;
    return (
        <Box
            icon={CalendarRange}
            title="Season calendar"
            subtitle="Months each product is sold fresh (product form > Food details) and pre-booking ship dates."
            right={<span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">Now: {SEASON_LABEL[activeSeason] || activeSeason}</span>}
        >
            {rows.length === 0 ? (
                <Empty>No product has season months yet.</Empty>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-sm">
                        <thead>
                            <tr className="text-xs text-gray-500">
                                <th className="px-4 py-2 text-left font-medium">Product</th>
                                {MONTHS.map((m, i) => (
                                    <th key={i} title={MONTH_NAMES[i]} className={`w-7 py-2 text-center font-medium ${i + 1 === thisMonth ? "text-gray-900" : ""}`}>
                                        {m}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rows.map((p) => {
                                const shipMonth = p.expectedDate ? new Date(p.expectedDate).getMonth() + 1 : null;
                                return (
                                    <tr key={p._id}>
                                        <td className="max-w-48 truncate px-4 py-2 text-gray-800">
                                            <Link to={`/admin/products/${p._id}/edit`} className="hover:underline">
                                                {p.name}
                                            </Link>
                                        </td>
                                        {MONTHS.map((_, i) => {
                                            const m = i + 1;
                                            const on = p.seasonMonths.includes(m);
                                            return (
                                                <td key={i} className={`py-2 text-center ${m === thisMonth ? "bg-gray-50" : ""}`}>
                                                    <span
                                                        className={`mx-auto flex h-4 w-5 items-center justify-center rounded-sm ${on ? "bg-gray-800" : "bg-gray-100"}`}
                                                        title={m === shipMonth ? `Pre-booking ships ${fmtDate(p.expectedDate)}` : on ? `${MONTH_NAMES[i]}: in season` : ""}
                                                    >
                                                        {m === shipMonth && <span className={`size-1.5 rounded-full ${on ? "bg-amber-300" : "bg-amber-500"}`} />}
                                                    </span>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <p className="flex flex-wrap items-center gap-4 px-4 py-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5">
                            <span className="h-3 w-4 rounded-sm bg-gray-800" /> In season
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-amber-500" /> Pre-booking ships
                        </span>
                    </p>
                </div>
            )}
        </Box>
    );
}

function BestBefore({ rows, warnDays }) {
    return (
        <Box
            icon={Clock}
            title="Best-before watch"
            subtitle={`Lots received with a best-before in the next ${warnDays} days (or up to a week past), on products that still have stock.`}
            right={
                <Link to="/admin/stock" className="text-xs font-medium text-gray-500 underline underline-offset-2 hover:text-gray-900">
                    Stock page
                </Link>
            }
        >
            {rows.length === 0 ? (
                <Empty>Nothing close to its best-before. Add batch and date when you receive stock.</Empty>
            ) : (
                <>
                    <ul className="divide-y divide-gray-100">
                        {rows.map((l) => {
                            const tone = l.daysLeft < 0 ? "bg-red-50 text-red-700" : l.daysLeft <= 7 ? "bg-amber-50 text-amber-800" : "bg-gray-100 text-gray-700";
                            const when = l.daysLeft < 0 ? `${-l.daysLeft} d past` : l.daysLeft === 0 ? "Today" : `${l.daysLeft} d left`;
                            return (
                                <li key={l._id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-medium text-gray-800">
                                            {l.productName}
                                            {l.variantLabel ? <span className="font-normal text-gray-500"> · {l.variantLabel}</span> : null}
                                        </p>
                                        <p className="truncate text-xs text-gray-500">
                                            {l.batch ? `Batch ${l.batch} · ` : ""}
                                            {l.received} {l.unit} received {fmtDate(l.receivedAt)} · best before {fmtDate(l.bestBefore)} · {l.onHand} on hand now
                                        </p>
                                    </div>
                                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>{when}</span>
                                </li>
                            );
                        })}
                    </ul>
                    <p className="border-t border-gray-100 px-4 py-2 text-xs text-gray-500">
                        Sales are not matched to lots, so check the shelf. Spoiled stock: Stock page &gt; Stock out &gt; Damaged.
                    </p>
                </>
            )}
        </Box>
    );
}

function TopDistricts({ rows, days, setDays, noDistrictOrders }) {
    const max = Math.max(1, ...rows.map((d) => d.revenue));
    return (
        <Box
            icon={MapPin}
            title="Top districts"
            subtitle="Pre-booked, confirmed, shipped and delivered orders, by delivery district."
            right={
                <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700">
                    {WINDOWS.map(([v, l]) => (
                        <option key={v} value={v}>
                            Last {l}
                        </option>
                    ))}
                </select>
            }
        >
            {rows.length === 0 ? (
                <Empty>No orders in this window yet.</Empty>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[420px] text-sm">
                        <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="w-8 px-4 py-2.5">#</th>
                                <th className="px-4 py-2.5">District</th>
                                <th className="px-4 py-2.5 text-right">Orders</th>
                                <th className="px-4 py-2.5 text-right">Customers</th>
                                <th className="px-4 py-2.5 text-right">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rows.map((d, i) => (
                                <tr key={d.district}>
                                    <td className="px-4 py-2.5 text-gray-400">{i + 1}</td>
                                    <td className="px-4 py-2.5">
                                        <span className="font-medium text-gray-800">{d.district}</span>
                                        <span className="mt-1 block h-1.5 w-full max-w-40 overflow-hidden rounded-full bg-gray-100">
                                            <span className="block h-full rounded-full bg-gray-800" style={{ width: `${Math.max(3, (d.revenue / max) * 100)}%` }} />
                                        </span>
                                    </td>
                                    <td className="px-4 py-2.5 text-right text-gray-600">{d.orders}</td>
                                    <td className="px-4 py-2.5 text-right text-gray-600">{d.customers}</td>
                                    <td className="px-4 py-2.5 text-right font-medium text-gray-900">
                                        {fmtCurrency(d.revenue)}
                                        <span className="block text-xs font-normal text-gray-400">{Math.round(d.share * 100)}%</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {noDistrictOrders > 0 && <p className="px-4 py-2 text-xs text-gray-500">{noDistrictOrders} order(s) without a district (courier pickup) are not ranked.</p>}
                </div>
            )}
        </Box>
    );
}

export default function FoodDashboard() {
    const [days, setDays] = useState(90);
    const [data, setData] = useState(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let cancelled = false;
        analyticsApi
            .getFood({ days })
            .then(({ data: res }) => {
                if (!cancelled) setData(res.data);
            })
            .catch(() => {
                if (!cancelled) setFailed(true);
            });
        return () => {
            cancelled = true;
        };
    }, [days]);

    if (failed) return null;
    if (!data) return <div className="h-40 animate-pulse rounded-lg border border-gray-200 bg-white" />;

    return (
        <div className="space-y-4">
            <SeasonCalendar rows={data.calendar || []} activeSeason={data.activeSeason} />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <BestBefore rows={data.bestBefore || []} warnDays={data.warnDays || 30} />
                <TopDistricts rows={data.topDistricts || []} days={days} setDays={setDays} noDistrictOrders={data.noDistrictOrders || 0} />
            </div>
        </div>
    );
}
