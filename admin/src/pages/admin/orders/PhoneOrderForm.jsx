// Aamkahon: enter an order taken on the phone. The browser only collects
// choices; every number shown comes from POST /admin/orders/manual/preview and
// the save recomputes it (controllers/admin/manualOrderController.js).
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@/admin/router";
import { ArrowLeft, Minus, Plus, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../../api/axiosInstance";
import { customerAdminApi } from "../../../api/customerAdminApi";
import { manualOrderApi } from "../../../api/manualOrderApi";
import { stockApi } from "../../../api/stockApi";

const field = "w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400";
const card = "rounded-lg border border-gray-200 bg-white p-5";
const bdt = (n) => `৳${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const PAY_METHODS = [
    ["cash", "Cash"],
    ["bkash", "bKash"],
    ["nagad", "Nagad"],
    ["rocket", "Rocket"],
    ["bank", "Bank transfer"],
    ["card", "Card"],
    ["other", "Other"],
];

/** Small debounced search box with a result list. */
function Lookup({ placeholder, search, render, onPick }) {
    const [term, setTerm] = useState("");
    const [results, setResults] = useState([]);
    const [open, setOpen] = useState(false);
    const box = useRef(null);

    useEffect(() => {
        if (term.trim().length < 2) return;
        let live = true;
        const t = setTimeout(async () => {
            try {
                const r = await search(term.trim());
                if (live) {
                    setResults(r);
                    setOpen(true);
                }
            } catch {
                /* a failed lookup just shows nothing */
            }
        }, 300);
        return () => {
            live = false;
            clearTimeout(t);
        };
    }, [term, search]);

    useEffect(() => {
        const close = (e) => box.current && !box.current.contains(e.target) && setOpen(false);
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    return (
        <div ref={box} className="relative">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input value={term} onChange={(e) => setTerm(e.target.value)} onFocus={() => results.length && setOpen(true)} placeholder={placeholder} className={`${field} pl-9`} />
            {open && term.trim().length >= 2 && (
                <ul className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
                    {results.length === 0 ? (
                        <li className="px-3 py-2 text-sm text-gray-500">No match</li>
                    ) : (
                        results.map((r) => (
                            <li key={r._id}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onPick(r);
                                        setTerm("");
                                        setOpen(false);
                                    }}
                                    className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                                >
                                    {render(r)}
                                </button>
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
}

const searchCustomers = async (term) => (await customerAdminApi.list({ search: term, limit: 6 })).data.customers || [];
const searchProducts = async (term) => (await stockApi.list({ search: term, limit: 8 })).data.items || [];

export default function PhoneOrderForm() {
    const navigate = useNavigate();
    const [customer, setCustomer] = useState({ name: "", phone: "", email: "" });
    const [address, setAddress] = useState({ district: "", upazila: "", addressLine1: "", addressLine2: "" });
    const [deliveryType, setDeliveryType] = useState("");
    const [courierBranch, setCourierBranch] = useState("");
    const [lines, setLines] = useState([]); // { key, product, options, quantity, unitPrice }
    const [discount, setDiscount] = useState("");
    const [shippingCharge, setShippingCharge] = useState("");
    const [payment, setPayment] = useState({ method: "cash", paidAmount: "", reference: "" });
    const [status, setStatus] = useState("Confirmed");
    const [note, setNote] = useState("");

    const [districts, setDistricts] = useState([]);
    const [upazilas, setUpazilas] = useState([]);
    const [deliveryTypes, setDeliveryTypes] = useState([]);
    const [branches, setBranches] = useState([]);

    const [preview, setPreview] = useState(null);
    const [previewError, setPreviewError] = useState("");
    const [saving, setSaving] = useState(false);

    // ── Address data (public checkout endpoints, same rules as the shop) ──
    useEffect(() => {
        axiosInstance.get("/checkout/districts").then(({ data }) => setDistricts(data.districts || [])).catch(() => {});
    }, []);
    useEffect(() => {
        if (!address.district) return;
        let live = true;
        axiosInstance
            .get(`/checkout/upazilas/${encodeURIComponent(address.district)}`)
            .then(({ data }) => live && setUpazilas((data.upazilas || []).map((u) => u.name)))
            .catch(() => live && setUpazilas([]));
        return () => {
            live = false;
        };
    }, [address.district]);
    useEffect(() => {
        if (!address.district || !address.upazila) return;
        let live = true;
        axiosInstance
            .post("/checkout/validate-location", { district: address.district, upazila: address.upazila })
            .then(({ data }) => {
                if (!live) return;
                const types = data.availableDeliveryTypes || [];
                setDeliveryTypes(types);
                setDeliveryType((t) => (types.includes(t) ? t : types[0] || ""));
            })
            .catch(() => live && setDeliveryTypes([]));
        return () => {
            live = false;
        };
    }, [address.district, address.upazila]);
    useEffect(() => {
        if (deliveryType !== "Courier" || !address.district) return;
        let live = true;
        axiosInstance
            .get(`/checkout/courier-branches/${encodeURIComponent(address.district)}`)
            .then(({ data }) => live && setBranches(data.branches || []))
            .catch(() => live && setBranches([]));
        return () => {
            live = false;
        };
    }, [deliveryType, address.district]);

    // ── Payload + server preview ────────────────────────────────────────────
    const payload = useMemo(
        () => ({
            customer,
            address,
            deliveryType: deliveryType || undefined,
            courierBranch: deliveryType === "Courier" ? courierBranch || undefined : undefined,
            items: lines.map((l) => ({ productId: l.product._id, options: l.options, quantity: Number(l.quantity), unitPrice: l.unitPrice === "" ? undefined : Number(l.unitPrice) })),
            discount: discount === "" ? undefined : Number(discount),
            shippingCharge: shippingCharge === "" ? undefined : Number(shippingCharge),
            payment: { method: payment.method, paidAmount: payment.paidAmount === "" ? 0 : Number(payment.paidAmount), reference: payment.reference || undefined },
            status,
            note: note || undefined,
        }),
        [customer, address, deliveryType, courierBranch, lines, discount, shippingCharge, payment, status, note],
    );
    const ready = customer.name.trim() && customer.phone.trim() && address.district && address.upazila && lines.length > 0 && lines.every((l) => !l.product.hasVariants || l.options);

    useEffect(() => {
        if (!ready) return;
        let live = true;
        const t = setTimeout(async () => {
            try {
                const { data } = await manualOrderApi.preview(payload);
                if (live) {
                    setPreview(data);
                    setPreviewError("");
                }
            } catch (err) {
                if (live) setPreviewError(err.response?.data?.message || "Could not calculate");
            }
        }, 400);
        return () => {
            live = false;
            clearTimeout(t);
        };
    }, [payload, ready]);

    const addProduct = (p) => {
        const v = p.hasVariants ? p.variants[0] : null;
        setLines((ls) => [...ls, { key: `${p._id}-${Date.now()}`, product: p, options: v ? v.options : null, quantity: p.minOrderQty || 1, unitPrice: "" }]);
    };
    const patchLine = (key, patch) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));

    const pickCustomer = (c) => {
        setCustomer({ name: c.name || "", phone: c.phone, email: c.email || "" });
        if (c.district && districts.includes(c.district)) setAddress((a) => ({ ...a, district: c.district, upazila: "" }));
        if (c.address) setAddress((a) => ({ ...a, addressLine1: a.addressLine1 || c.address }));
    };

    const submit = async () => {
        if (!ready) return toast.error("Fill customer, address and at least one product");
        setSaving(true);
        try {
            const { data } = await manualOrderApi.create(payload);
            (data.warnings || []).forEach((w) => toast(w, { icon: "!" }));
            toast.success(`Order ${data.order.orderNumber} saved`);
            navigate(`/admin/orders/${data.order._id}/invoice`);
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not save the order");
        } finally {
            setSaving(false);
        }
    };

    const t = preview?.totals;
    const priceOf = (l) => preview?.lines?.find((x) => String(x.product) === String(l.product._id) && (x.variant?.displayName || "") === (l.options ? l.options.map((o) => o.value).join(" / ") : ""));

    return (
        <div className="space-y-5 pb-10">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate("/admin/orders")} className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100" aria-label="Back">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">New phone order</h1>
                    <p className="text-sm text-gray-500">For orders confirmed on a call. Prices fill in from the catalogue; type a price to change it for this order.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                <div className="space-y-5 lg:col-span-2">
                    <section className={card}>
                        <h2 className="mb-3 font-semibold text-gray-900">Customer</h2>
                        <Lookup placeholder="Find in customer list by name or phone" search={searchCustomers} onPick={pickCustomer} render={(c) => (<><span className="font-medium">{c.name || "No name"}</span> <span className="font-mono text-gray-500">{c.phone}</span>{c.district ? <span className="text-gray-400"> · {c.district}</span> : null}</>)} />
                        <div className="mt-3 grid gap-3 sm:grid-cols-3">
                            <input className={field} placeholder="Name *" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
                            <input className={`${field} font-mono`} placeholder="01XXXXXXXXX *" inputMode="tel" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
                            <input className={field} placeholder="Email (optional)" type="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} />
                        </div>
                    </section>

                    <section className={card}>
                        <h2 className="mb-3 font-semibold text-gray-900">Delivery</h2>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <select className={field} value={address.district} onChange={(e) => { setAddress({ ...address, district: e.target.value, upazila: "" }); setUpazilas([]); setDeliveryTypes([]); setCourierBranch(""); }}>
                                <option value="">District *</option>
                                {districts.map((d) => <option key={d}>{d}</option>)}
                            </select>
                            <select className={field} value={address.upazila} disabled={!address.district} onChange={(e) => { setAddress({ ...address, upazila: e.target.value }); setCourierBranch(""); }}>
                                <option value="">Upazila / area *</option>
                                {upazilas.map((u) => <option key={u}>{u}</option>)}
                            </select>
                        </div>
                        {address.upazila && deliveryTypes.length === 0 && <p className="mt-3 text-sm text-red-600">No delivery rate for this area. Type a delivery charge below, or add a rate in Shipping.</p>}
                        {deliveryTypes.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {deliveryTypes.map((d) => (
                                    <button key={d} type="button" onClick={() => setDeliveryType(d)} className={`rounded-md border px-3 py-1.5 text-sm ${deliveryType === d ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
                                        {d === "Courier" ? "Courier pickup" : "Home delivery"}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            {deliveryType === "Courier" ? (
                                <select className={`${field} sm:col-span-2`} value={courierBranch} onChange={(e) => setCourierBranch(e.target.value)}>
                                    <option value="">Courier branch *</option>
                                    {branches.map((b) => <option key={b}>{b}</option>)}
                                </select>
                            ) : (
                                <>
                                    <input className={field} placeholder="House, road, village *" value={address.addressLine1} onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })} />
                                    <input className={field} placeholder="Landmark (optional)" value={address.addressLine2} onChange={(e) => setAddress({ ...address, addressLine2: e.target.value })} />
                                </>
                            )}
                        </div>
                    </section>

                    <section className={card}>
                        <h2 className="mb-3 font-semibold text-gray-900">Products</h2>
                        <Lookup
                            placeholder="Search products to add"
                            search={searchProducts}
                            onPick={addProduct}
                            render={(p) => (
                                <span className="flex items-center justify-between gap-3">
                                    <span>{p.name}{p.nameBn ? <span lang="bn" className="text-gray-400"> · {p.nameBn}</span> : null}</span>
                                    <span className="text-xs text-gray-500">{p.priceVisibility !== "show" ? "Price on request" : bdt(p.price)} · {p.stock} {p.unit}</span>
                                </span>
                            )}
                        />
                        {lines.length === 0 ? (
                            <p className="mt-4 text-sm text-gray-500">No products yet.</p>
                        ) : (
                            <div className="mt-4 divide-y divide-gray-100">
                                {lines.map((l) => {
                                    const priced = priceOf(l);
                                    const variant = l.product.hasVariants ? l.product.variants.find((v) => v.label === l.options?.map((o) => o.value).join(" / ")) : null;
                                    const stock = variant ? variant.stock : l.product.stock;
                                    return (
                                        <div key={l.key} className="grid gap-3 py-3 sm:grid-cols-12 sm:items-center">
                                            <div className="sm:col-span-4">
                                                <p className="font-medium text-gray-900">{l.product.name}</p>
                                                <p className="text-xs text-gray-500">{l.product.availability === "pre_order" ? "Pre-booking" : `${stock} ${l.product.unit} in stock`}</p>
                                            </div>
                                            <div className="sm:col-span-3">
                                                {l.product.hasVariants ? (
                                                    <select className={field} value={l.options ? l.options.map((o) => o.value).join(" / ") : ""} onChange={(e) => patchLine(l.key, { options: l.product.variants.find((v) => v.label === e.target.value)?.options || null })}>
                                                        {l.product.variants.map((v) => <option key={v.label} value={v.label}>{v.label} ({v.stock})</option>)}
                                                    </select>
                                                ) : (
                                                    <span className="text-sm text-gray-500">per {l.product.unit}</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 sm:col-span-2">
                                                <button type="button" onClick={() => patchLine(l.key, { quantity: Math.max(1, Number(l.quantity) - 1) })} className="rounded border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50" aria-label="Less"><Minus size={14} /></button>
                                                <input type="number" min="1" className="w-14 rounded-md border border-gray-200 px-2 py-1.5 text-center text-sm" value={l.quantity} onChange={(e) => patchLine(l.key, { quantity: e.target.value })} />
                                                <button type="button" onClick={() => patchLine(l.key, { quantity: Number(l.quantity) + 1 })} className="rounded border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50" aria-label="More"><Plus size={14} /></button>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <input type="number" min="0" className={field} placeholder={priced ? String(priced.retailPrice) : "Price"} value={l.unitPrice} onChange={(e) => patchLine(l.key, { unitPrice: e.target.value })} title="Leave empty to use the catalogue price" />
                                                {priced && <p className="mt-0.5 text-right text-xs text-gray-500">{bdt(priced.lineTotal)}{priced.priceOverridden ? " · custom" : priced.wholesaleApplied ? " · wholesale" : ""}</p>}
                                            </div>
                                            <div className="text-right sm:col-span-1">
                                                <button type="button" onClick={() => setLines((ls) => ls.filter((x) => x.key !== l.key))} className="rounded p-1.5 text-red-500 hover:bg-red-50" aria-label="Remove"><Trash2 size={15} /></button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    <section className={card}>
                        <h2 className="mb-3 font-semibold text-gray-900">Note</h2>
                        <textarea className={field} rows={2} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything the packer or rider should know" />
                    </section>
                </div>

                <div className="space-y-5">
                    <section className={card}>
                        <h2 className="mb-3 font-semibold text-gray-900">Payment</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <label className="text-xs text-gray-600">
                                Received by
                                <select className={`${field} mt-1`} value={payment.method} onChange={(e) => setPayment({ ...payment, method: e.target.value })}>
                                    {PAY_METHODS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                </select>
                            </label>
                            <label className="text-xs text-gray-600">
                                Amount received
                                <input type="number" min="0" className={`${field} mt-1`} value={payment.paidAmount} onChange={(e) => setPayment({ ...payment, paidAmount: e.target.value })} placeholder="0" />
                            </label>
                        </div>
                        {t && (
                            <button type="button" onClick={() => setPayment({ ...payment, paidAmount: String(t.totalPrice) })} className="mt-2 text-xs text-blue-600 hover:underline">Mark fully paid ({bdt(t.totalPrice)})</button>
                        )}
                        <input className={`${field} mt-3`} placeholder="Transaction ID / reference (optional)" value={payment.reference} onChange={(e) => setPayment({ ...payment, reference: e.target.value })} />
                        <div className="mt-3 grid grid-cols-2 gap-3">
                            <label className="text-xs text-gray-600">
                                Discount (৳)
                                <input type="number" min="0" className={`${field} mt-1`} value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="0" />
                            </label>
                            <label className="text-xs text-gray-600">
                                Delivery charge (৳)
                                <input type="number" min="0" className={`${field} mt-1`} value={shippingCharge} onChange={(e) => setShippingCharge(e.target.value)} placeholder={t ? `${t.shippingPrice} (auto)` : "auto"} />
                            </label>
                        </div>
                    </section>

                    <section className={card}>
                        <h2 className="mb-3 font-semibold text-gray-900">Summary</h2>
                        {!ready ? (
                            <p className="text-sm text-gray-500">Add the customer, area and products to see the total.</p>
                        ) : previewError ? (
                            <p className="text-sm text-red-600">{previewError}</p>
                        ) : t ? (
                            <dl className="space-y-1.5 text-sm">
                                <div className="flex justify-between"><dt className="text-gray-500">Items</dt><dd>{bdt(t.itemsSubtotal)}</dd></div>
                                {t.discountAmount > 0 && <div className="flex justify-between"><dt className="text-gray-500">Discount</dt><dd>-{bdt(t.discountAmount)}</dd></div>}
                                <div className="flex justify-between"><dt className="text-gray-500">Delivery{t.totalWeightKg ? ` (${t.totalWeightKg} kg)` : ""}</dt><dd>{bdt(t.shippingPrice)}</dd></div>
                                <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold"><dt>Total</dt><dd>{bdt(t.totalPrice)}</dd></div>
                                <div className="flex justify-between"><dt className="text-gray-500">Received</dt><dd>{bdt(t.paidAmount)}</dd></div>
                                <div className="flex justify-between font-medium"><dt>Due</dt><dd>{bdt(t.dueAmount)}</dd></div>
                                {(preview.warnings || []).map((w) => <p key={w} className="rounded bg-yellow-50 px-2 py-1 text-xs text-yellow-800">{w}</p>)}
                            </dl>
                        ) : (
                            <p className="text-sm text-gray-500">Calculating...</p>
                        )}

                        <label className="mt-4 block text-xs text-gray-600">
                            Save as
                            <select className={`${field} mt-1`} value={status} onChange={(e) => setStatus(e.target.value)}>
                                <option value="Confirmed">Confirmed (takes stock now)</option>
                                <option value="Pending">Pending (no stock change yet)</option>
                                <option value="Pre-booked">Pre-booked (harvest not ready)</option>
                            </select>
                        </label>
                        <button type="button" onClick={submit} disabled={saving || !ready || Boolean(previewError)} className="mt-4 w-full rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
                            {saving ? "Saving..." : "Save order and open invoice"}
                        </button>
                    </section>
                </div>
            </div>
        </div>
    );
}
