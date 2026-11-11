// Printable invoice for any order (web or phone). "Download PDF" is the
// browser's print dialog with Save as PDF: no PDF library, and what prints is
// exactly what is on screen. Two paper sizes: A4 and 80 mm thermal (POS).
// Store identity comes from lib/site.js, the one place client details live.
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "@/admin/router";
import { ArrowLeft, Printer } from "lucide-react";
import toast from "react-hot-toast";
import { SITE } from "@/lib/site";
import { orderApi } from "../../../api/orderApi";

const bdt = (n) => `৳${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
const date = (d) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "");
const PAY_LABEL = { cash: "Cash", bkash: "bKash", nagad: "Nagad", rocket: "Rocket", bank: "Bank transfer", card: "Card", other: "Other" };

/** What has actually been received for this order, by how it was paid. */
function paidSoFar(o) {
    if (o.paymentStatus === "Paid") return o.totalPrice;
    if (o.paymentMethod === "Manual") return o.manualPayment?.paidAmount || 0;
    // Web COD / pre-booking: the online part is paid once the gateway confirmed it,
    // which is when the order leaves Pending.
    if ((o.paymentMethod === "COD" || o.orderType === "pre_order") && !["Pending", "Cancelled"].includes(o.orderStatus)) {
        return o.codOnlinePaymentAmount || 0;
    }
    return 0;
}

function paymentLine(o) {
    if (o.paymentMethod === "Manual") return `${PAY_LABEL[o.manualPayment?.method] || "Cash"}${o.manualPayment?.reference ? `, ref ${o.manualPayment.reference}` : ""}`;
    if (o.paymentMethod === "COD") return "Cash on delivery (delivery charge paid online)";
    return "Online (SSLCommerz)";
}

// Print only the invoice. A copy is portalled straight under <body> and every
// other body child is hidden while printing: the admin shell has fixed/scroll
// containers that would otherwise clip a long invoice to one page.
const printCss = (size) => `
#invoice-print { display: none; }
@media print {
  body > *:not(#invoice-print) { display: none !important; }
  #invoice-print { display: block; }
  #invoice-print .sheet { border: 0 !important; box-shadow: none !important; padding: 0 !important; max-width: none !important; }
  @page { size: ${size === "pos" ? "80mm auto" : "A4"}; margin: ${size === "pos" ? "3mm" : "12mm"}; }
}`;

export default function OrderInvoice() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [size, setSize] = useState("a4");

    const load = useCallback(async () => {
        try {
            const { data } = await orderApi.getOne(id);
            setOrder(data.order);
        } catch (err) {
            toast.error(err.response?.data?.message || "Order not found");
        }
    }, [id]);

    useEffect(() => {
        load();
    }, [load]);

    if (!order) return <div className="py-24 text-center text-sm text-gray-400">Loading...</div>;

    const a = order.shippingAddress || {};
    const subtotal = order.orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const paid = paidSoFar(order);
    const due = Math.max(0, order.totalPrice - paid);
    const pos = size === "pos";
    const where = a.deliveryType === "Courier" ? `Courier pickup: ${a.courierBranch}, ${a.district}` : [a.addressLine1, a.addressLine2, a.upazila, a.district].filter(Boolean).join(", ");

    const sheet = <Sheet order={order} pos={pos} a={a} where={where} subtotal={subtotal} paid={paid} due={due} />;

    return (
        <div className="space-y-4 pb-10">
            <style>{printCss(size)}</style>
            <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(`/admin/orders/${order._id}`)} className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100" aria-label="Back to order">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">Invoice {order.orderNumber}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <div className="inline-flex rounded-md border border-gray-200 bg-white p-0.5">
                        {[["a4", "A4"], ["pos", "80 mm"]].map(([v, l]) => (
                            <button key={v} onClick={() => setSize(v)} className={`rounded px-3 py-1.5 text-sm ${size === v ? "bg-gray-900 text-white" : "text-gray-600"}`}>{l}</button>
                        ))}
                    </div>
                    <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800" title="Choose 'Save as PDF' in the print dialog to download">
                        <Printer size={15} /> Print / Save PDF
                    </button>
                </div>
            </div>

            {sheet}
            {createPortal(<div id="invoice-print">{sheet}</div>, document.body)}
        </div>
    );
}

function Sheet({ order, pos, a, where, subtotal, paid, due }) {
    return (
            <div className={`sheet mx-auto bg-white text-gray-900 ${pos ? "w-[80mm] p-3 text-[11px] leading-snug" : "w-full max-w-[210mm] border border-gray-200 p-10 text-sm shadow-sm"}`}>
                {/* Header */}
                <div className={pos ? "text-center" : "flex items-start justify-between gap-6"}>
                    <div className={pos ? "" : "flex items-center gap-3"}>
                        {!pos && <img src="/images/logo-icon.png" alt="" className="h-12 w-12 object-contain" />}
                        <div>
                            <p className={`font-bold ${pos ? "text-sm" : "text-xl"}`}>
                                {SITE.legalName} <span lang="bn" className="font-normal">{SITE.nameBn}</span>
                            </p>
                            <p className="text-gray-600">{SITE.location}</p>
                            <p className="text-gray-600">{SITE.phone}{SITE.phoneAlt ? `, ${SITE.phoneAlt}` : ""}</p>
                        </div>
                    </div>
                    <div className={pos ? "mt-2 border-t border-dashed border-gray-400 pt-2" : "text-right"}>
                        <p className={`font-semibold uppercase tracking-wide ${pos ? "" : "text-lg"}`}>Invoice</p>
                        <p>No. <span className="font-mono">{order.orderNumber}</span></p>
                        <p>Date {date(order.createdAt)}</p>
                        {order.orderSource === "phone" && <p className="text-gray-500">Phone order</p>}
                    </div>
                </div>

                {/* Parties */}
                <div className={pos ? "mt-2 border-t border-dashed border-gray-400 pt-2" : "mt-8 grid grid-cols-2 gap-8"}>
                    <div>
                        <p className="text-xs font-semibold uppercase text-gray-500">Bill to</p>
                        <p className="font-medium">{a.name}</p>
                        <p className="font-mono">{a.phone}</p>
                        {(a.email || order.guestEmail) && <p>{a.email || order.guestEmail}</p>}
                    </div>
                    <div className={pos ? "mt-1" : ""}>
                        <p className="text-xs font-semibold uppercase text-gray-500">Deliver to</p>
                        <p>{where}</p>
                        {order.trackingNumber && <p>Tracking {order.carrier ? `${order.carrier} ` : ""}{order.trackingNumber}</p>}
                    </div>
                </div>

                {/* Lines */}
                {pos ? (
                    <div className="mt-2 border-t border-dashed border-gray-400 pt-2">
                        {order.orderItems.map((i) => (
                            <div key={i._id} className="mb-1">
                                <p>{i.name}</p>
                                <p className="flex justify-between">
                                    <span>{i.quantity} {i.unit || ""} x {bdt(i.price)}</span>
                                    <span>{bdt(i.price * i.quantity)}</span>
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <table className="mt-8 w-full border-collapse">
                        <thead>
                            <tr className="border-b-2 border-gray-900 text-left text-xs uppercase text-gray-600">
                                <th className="py-2 pr-2">#</th>
                                <th className="py-2 pr-2">Item</th>
                                <th className="py-2 pr-2 text-right">Qty</th>
                                <th className="py-2 pr-2 text-right">Unit price</th>
                                <th className="py-2 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.orderItems.map((i, n) => (
                                <tr key={i._id} className="border-b border-gray-200 align-top">
                                    <td className="py-2 pr-2 text-gray-500">{n + 1}</td>
                                    <td className="py-2 pr-2">{i.name}</td>
                                    <td className="py-2 pr-2 text-right">{i.quantity} {i.unit || ""}</td>
                                    <td className="py-2 pr-2 text-right">{bdt(i.price)}</td>
                                    <td className="py-2 text-right">{bdt(i.price * i.quantity)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Totals */}
                <div className={pos ? "mt-2 border-t border-dashed border-gray-400 pt-2" : "mt-6 ml-auto w-72"}>
                    {[
                        ["Subtotal", bdt(subtotal)],
                        order.discountAmount > 0 && [`Discount${order.couponCode ? ` (${order.couponCode})` : ""}`, `-${bdt(order.discountAmount)}`],
                        [`Delivery${order.totalWeightKg ? ` (${order.totalWeightKg} kg)` : ""}`, bdt(order.shippingPrice)],
                        order.codCharge > 0 && ["COD charge", bdt(order.codCharge)],
                        order.taxPrice > 0 && ["VAT", bdt(order.taxPrice)],
                    ]
                        .filter(Boolean)
                        .map(([l, v]) => (
                            <p key={l} className="flex justify-between py-0.5"><span className="text-gray-600">{l}</span><span>{v}</span></p>
                        ))}
                    <p className={`mt-1 flex justify-between border-t border-gray-900 pt-1.5 font-bold ${pos ? "" : "text-base"}`}><span>Total</span><span>{bdt(order.totalPrice)}</span></p>
                    <p className="flex justify-between py-0.5"><span className="text-gray-600">Paid</span><span>{bdt(paid)}</span></p>
                    <p className="flex justify-between py-0.5 font-semibold"><span>{due > 0 ? "Due" : "Balance"}</span><span>{bdt(due)}</span></p>
                </div>

                <div className={pos ? "mt-2 border-t border-dashed border-gray-400 pt-2 text-center" : "mt-10 border-t border-gray-200 pt-4 text-xs text-gray-600"}>
                    <p>Payment: {paymentLine(order)}{order.paymentStatus ? ` · ${order.paymentStatus}` : ""}</p>
                    <p className="mt-1">Thank you for choosing {SITE.name}. Questions: {SITE.phone}</p>
                </div>
            </div>
    );
}
