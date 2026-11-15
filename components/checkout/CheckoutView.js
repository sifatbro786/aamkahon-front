"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import Field, { inputCls } from "@/components/checkout/Field";
import OrderSummary from "@/components/checkout/OrderSummary";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { useCart } from "@/context/CartContext";
import { errorMessage } from "@/lib/api/client";
import { IS_STATIC } from "@/lib/config";
import { taka } from "@/lib/format";
import { useCalculation, useCourierBranches, useDistricts, useGuestItems, useLocation, usePlaceOrder, useUpazilas } from "@/lib/hooks/useCheckout";
import { forgetCheckoutDetails, loadCheckoutDetails, saveCheckoutDetails } from "@/lib/store/checkoutMemory";
import { rememberGuestOrderToken } from "@/lib/store/orderAccess";
import { SITE } from "@/lib/site";

const EMPTY = { name: "", phone: "", email: "", district: "", upazila: "", addressLine1: "", addressLine2: "", deliveryType: "", courierBranch: "", courier: "" };

/**
 * Single page checkout (port of the Footpath flow):
 *  - locationType comes from the server (district + upazila), never picked here
 *  - every order is a guest order (Aamkahon has no customer accounts); the
 *    last details are remembered on the device (lib/store/checkoutMemory.js)
 *  - email is optional: phone is the contact
 *  - nothing price related is sent; every figure is from /checkout/calculate
 *  - both COD and online return a gateway redirectUrl
 *  - the guest capability token is stored BEFORE redirecting
 * Aamkahon: a pre-booking bag pays only the advance online (no COD choice).
 */
export default function CheckoutView() {
    const router = useRouter();
    const { items, isGuestCart, isPreOrderBag, resetAfterOrder } = useCart();
    const [draft, setDraft] = useState(EMPTY);
    const [remember, setRemember] = useState(true);
    const [method, setMethod] = useState("COD");
    const [coupon, setCoupon] = useState("");
    const [couponInput, setCouponInput] = useState("");
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState(null);

    // Fill from the last order on this device, after mount (storage is not
    // available during the server render). Only blanks are filled.
    useEffect(() => {
        let alive = true;
        Promise.resolve().then(() => {
            const saved = alive && loadCheckoutDetails();
            if (saved) setDraft((d) => Object.fromEntries(Object.entries(d).map(([k, v]) => [k, v || saved[k] || ""])));
        });
        return () => {
            alive = false;
        };
    }, []);
    const address = draft;

    const guestItems = useGuestItems(items);
    const { data: districts = [] } = useDistricts();
    const { data: upazilas = [], isFetching: upazilasLoading } = useUpazilas(address.district);
    const { data: location } = useLocation(address.district, address.upazila);
    const locationType = location?.locationType ?? null;
    const deliveryTypes = location?.availableDeliveryTypes ?? [];
    // Options come from the server (active rates + the district's courier
    // branches), Dhaka included. Ask only when there is a real choice.
    const hasChoice = deliveryTypes.length > 1;
    const deliveryType = hasChoice ? address.deliveryType : (deliveryTypes[0] ?? "");
    const isCourier = deliveryType === "Courier";
    const { data: branches = [] } = useCourierBranches(address.district, isCourier);

    // A product that must be paid online (e.g. mango by AJR) removes COD for
    // the whole bag. The server decides (checkout/calculate codAvailable);
    // the cart snapshot only lets us hide COD before an address exists.
    const itemsOnlineOnly = !isPreOrderBag && items.some((i) => i.codAllowed === false);

    // Courier company (AJR / Sundarban / Steadfast). Options come from the
    // server (every product in the bag must allow the courier); the last
    // calculation's list is kept while a new one loads.
    const [courierOptions, setCourierOptions] = useState([]);
    const courierKey = courierOptions.length === 1 ? courierOptions[0].key : courierOptions.some((c) => c.key === address.courier) ? address.courier : "";
    const chosenCourier = courierOptions.find((c) => c.key === courierKey) || null;
    const courierOnlineOnly = Boolean(chosenCourier && !chosenCourier.codAllowed);

    const paymentMethod = isPreOrderBag || itemsOnlineOnly || courierOnlineOnly ? "SSLCommerz" : method;
    // Ask the server only once the delivery choice is complete; a half-filled
    // choice used to fire calculate and come back 400 ("Choose a delivery option").
    const deliveryReady = Boolean(locationType) && (!hasChoice || Boolean(address.deliveryType)) && (!isCourier || Boolean(address.courierBranch));
    const payload = useMemo(
        () => ({
            isGuest: isGuestCart,
            guestItems: isGuestCart ? guestItems : undefined,
            couponCode: coupon || undefined,
            locationType,
            deliveryType: deliveryType || undefined,
            courierBranch: isCourier ? address.courierBranch || undefined : undefined,
            courier: courierKey || undefined,
            paymentMethod,
            shippingAddress: { district: address.district, upazila: address.upazila },
        }),
        [isGuestCart, guestItems, coupon, locationType, deliveryType, isCourier, address.courierBranch, courierKey, paymentMethod, address.district, address.upazila],
    );
    const { totals, isCalculating, needsAddress, error: calcError } = useCalculation(payload, items.length > 0 && deliveryReady);
    const placeOrder = usePlaceOrder();
    const onlineOnly = !isPreOrderBag && (itemsOnlineOnly || courierOnlineOnly || totals?.codAvailable === false);

    // Keep the latest server list (state, not derived, so it survives the
    // gap while a recalculation is in flight). Deferred a tick: no
    // synchronous setState inside an effect.
    const serverCouriers = totals?.courierOptions;
    useEffect(() => {
        if (!Array.isArray(serverCouriers)) return;
        let alive = true;
        Promise.resolve().then(() => alive && setCourierOptions(serverCouriers));
        return () => {
            alive = false;
        };
    }, [serverCouriers]);

    const update = (patch) => {
        setDraft((d) => ({ ...d, ...patch }));
        setErrors((e) => {
            const next = { ...e };
            Object.keys(patch).forEach((k) => delete next[k]);
            return next;
        });
    };

    const validate = () => {
        const e = {};
        if (!address.name.trim()) e.name = "We need a name for the delivery.";
        const phone = address.phone.replace(/[\s-]/g, "");
        if (!/^01[3-9]\d{8}$/.test(phone)) e.phone = "Enter an 11 digit mobile number starting 01.";
        if (address.email && !/\S+@\S+\.\S+/.test(address.email)) e.email = "That email does not look right.";
        if (!address.district) e.district = "Choose a district.";
        if (!address.upazila) e.upazila = "Choose an area.";
        if (locationType && !deliveryTypes.length) e.deliveryType = "We do not deliver to this area yet. Call us and we will arrange it.";
        else if (hasChoice && !address.deliveryType) e.deliveryType = "Choose a delivery option.";
        if (isCourier && !address.courierBranch) e.courierBranch = "Choose a branch.";
        if (!isCourier && !address.addressLine1.trim()) e.addressLine1 = "We need a street address for home delivery.";
        if (courierOptions.length > 1 && !courierKey) e.courier = "Choose a courier.";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const submit = async (ev) => {
        ev.preventDefault();
        setSubmitError(null);
        if (IS_STATIC) return;
        if (!validate()) {
            document.querySelector("[aria-invalid='true']")?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }
        try {
            const data = await placeOrder.mutateAsync({
                shippingAddress: {
                    name: address.name.trim(),
                    phone: address.phone.replace(/[\s-]/g, ""),
                    email: address.email.trim(),
                    addressLine1: address.addressLine1.trim(),
                    addressLine2: address.addressLine2.trim(),
                    district: address.district,
                    upazila: address.upazila,
                    country: "Bangladesh",
                },
                paymentMethod,
                couponCode: coupon || undefined,
                locationType,
                deliveryType,
                courierBranch: isCourier ? address.courierBranch : undefined,
                courier: courierKey || undefined,
                isGuest: true,
                guestEmail: address.email.trim() || undefined,
                guestItems,
            });
            if (remember) saveCheckoutDetails(address);
            else forgetCheckoutDetails();
            // Returned exactly once; store before leaving for the gateway.
            if (data?.guestAccessToken && data?.order?.orderNumber) rememberGuestOrderToken(data.order.orderNumber, data.guestAccessToken);
            resetAfterOrder();
            if (data?.redirectUrl) {
                window.location.href = data.redirectUrl;
                return;
            }
            router.push(`/order/success?orderNumber=${data?.order?.orderNumber ?? ""}`);
        } catch (error) {
            const r = error?.response?.data;
            setSubmitError(r?.errors?.join(" ") || errorMessage(error, "We could not place your order. Please try again."));
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    if (items.length === 0 && !placeOrder.isPending) {
        return (
            <div className="wrap py-24 text-center">
                <h1 className="text-h2 font-medium">Nothing to check out yet</h1>
                <p className="mt-3 text-muted">Your bag is empty.</p>
                <Link href="/shop" className="btn btn-ink mt-8">
                    Browse the shop
                </Link>
            </div>
        );
    }

    const select = `${inputCls} appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1.5 6 6.5l5-5' stroke='%236f6355' stroke-width='1.5'/%3E%3C/svg%3E")] bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-10`;

    return (
        <div className="wrap pb-20 pt-8 md:pt-10">
            <Breadcrumbs items={[{ label: "Your bag", href: "/cart" }, { label: "Checkout" }]} />
            <h1 className="mt-6 text-h2 font-medium">{isPreOrderBag ? "Confirm your pre-booking" : "Checkout"}</h1>

            {IS_STATIC && (
                <p className="mt-5 rounded-lg bg-mango-soft px-4 py-3 text-[15px]">
                    This is the demo site, so orders are switched off. On the live store this page calculates delivery by weight and takes you to SSLCommerz.
                </p>
            )}
            {submitError && (
                <div role="alert" className="mt-5 rounded-lg border-l-4 border-danger bg-danger/5 px-4 py-3 text-[15px]">
                    <p className="font-medium text-danger">Order not placed</p>
                    <p className="mt-1">{submitError}</p>
                </div>
            )}

            <form onSubmit={submit} noValidate className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-14">
                <div className="min-w-0 space-y-10">
                    <section>
                        <h2 className="text-xl font-medium">Delivery details</h2>
                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <Field label="Full name" error={errors.name}>
                                <input className={inputCls} value={address.name} onChange={(e) => update({ name: e.target.value })} autoComplete="name" aria-invalid={Boolean(errors.name)} />
                            </Field>
                            <Field label="Mobile number" error={errors.phone} hint="The courier will call this number">
                                <input className={inputCls} value={address.phone} onChange={(e) => update({ phone: e.target.value })} inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" aria-invalid={Boolean(errors.phone)} />
                            </Field>
                            <Field label="Email (optional)" error={errors.email} className="sm:col-span-2">
                                <input className={inputCls} type="email" value={address.email} onChange={(e) => update({ email: e.target.value })} autoComplete="email" aria-invalid={Boolean(errors.email)} />
                            </Field>
                            <Field label="District" error={errors.district}>
                                <select className={select} value={address.district} onChange={(e) => update({ district: e.target.value, upazila: "", courierBranch: "", deliveryType: "" })} aria-invalid={Boolean(errors.district)} disabled={IS_STATIC}>
                                    <option value="">Choose district</option>
                                    {districts.map((d) => (
                                        <option key={d}>{d}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Upazila or area" error={errors.upazila}>
                                <select className={select} value={address.upazila} onChange={(e) => update({ upazila: e.target.value, deliveryType: "", courierBranch: "" })} disabled={!address.district || upazilasLoading} aria-invalid={Boolean(errors.upazila)}>
                                    <option value="">{upazilasLoading ? "Loading" : "Choose area"}</option>
                                    {upazilas.map((u) => (
                                        <option key={u.name}>{u.name}</option>
                                    ))}
                                </select>
                            </Field>

                            {locationType && !deliveryTypes.length && <p className="text-[13px] text-danger sm:col-span-2">{errors.deliveryType || "We do not deliver to this area yet. Call us and we will arrange it."}</p>}

                            {hasChoice && (
                                <fieldset className="sm:col-span-2">
                                    <legend className="text-[14px]">Delivery option</legend>
                                    <div className="mt-2 grid gap-3 sm:grid-cols-2">
                                        {deliveryTypes.map((t) => (
                                            <label key={t} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 ${address.deliveryType === t ? "border-ink bg-paper-2" : "border-line"}`}>
                                                <input type="radio" name="deliveryType" className="mt-1 accent-[var(--color-ink)]" checked={address.deliveryType === t} onChange={() => update({ deliveryType: t })} />
                                                <span>
                                                    <span className="block font-medium">{t === "Courier" ? "Courier pickup" : "Home delivery"}</span>
                                                    <span className="text-[13px] text-muted">{t === "Courier" ? "Collect from a courier branch in your district" : "Delivered to your door"}</span>
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.deliveryType && <p className="mt-1 text-[13px] text-danger">{errors.deliveryType}</p>}
                                </fieldset>
                            )}

                            {isCourier ? (
                                <Field label="Courier branch" error={errors.courierBranch} className="sm:col-span-2">
                                    <select className={select} value={address.courierBranch} onChange={(e) => update({ courierBranch: e.target.value })} aria-invalid={Boolean(errors.courierBranch)}>
                                        <option value="">Choose branch</option>
                                        {branches.map((b) => (
                                            <option key={b}>{b}</option>
                                        ))}
                                    </select>
                                </Field>
                            ) : (
                                <>
                                    <Field label="Street address" error={errors.addressLine1} className="sm:col-span-2">
                                        <input className={inputCls} value={address.addressLine1} onChange={(e) => update({ addressLine1: e.target.value })} autoComplete="address-line1" placeholder="House, road, village" aria-invalid={Boolean(errors.addressLine1)} />
                                    </Field>
                                    <Field label="Landmark (optional)" className="sm:col-span-2">
                                        <input className={inputCls} value={address.addressLine2} onChange={(e) => update({ addressLine2: e.target.value })} autoComplete="address-line2" />
                                    </Field>
                                </>
                            )}
                        </div>
                        {courierOptions.length > 0 && (
                            <fieldset className="mt-6">
                                <legend className="text-[14px]">Courier</legend>
                                {courierOptions.length === 1 ? (
                                    <p className="mt-2 rounded-lg border border-line p-4 text-[14px]">
                                        <span className="font-medium">Ships by {courierOptions[0].name}.</span>{" "}
                                        <span className="text-muted">{courierOptions[0].codAllowed ? "Cash on delivery or online." : "No cash on delivery: price and delivery are paid online now."}</span>
                                    </p>
                                ) : (
                                    <div className="mt-2 grid gap-3 sm:grid-cols-2">
                                        {courierOptions.map((c) => (
                                            <label key={c.key} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 ${courierKey === c.key ? "border-ink bg-paper-2" : "border-line"}`}>
                                                <input type="radio" name="courier" className="mt-1 accent-[var(--color-ink)]" checked={courierKey === c.key} onChange={() => update({ courier: c.key })} />
                                                <span>
                                                    <span className="block font-medium">{c.name}</span>
                                                    <span className="text-[13px] text-muted">{c.note || (c.codAllowed ? "Cash on delivery or online" : "Full payment online")}</span>
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                                {errors.courier && <p className="mt-1 text-[13px] text-danger">{errors.courier}</p>}
                            </fieldset>
                        )}

                        <label className="mt-5 flex items-start gap-3 text-[14px] text-muted">
                            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="mt-0.5 size-4 accent-[var(--color-ink)]" />
                            <span>Remember these details on this device for next time. Untick on a shared phone or computer.</span>
                        </label>
                    </section>

                    <section className="border-t border-line pt-10">
                        <h2 className="text-xl font-medium">Payment</h2>
                        {isPreOrderBag ? (
                            <div className="mt-5 rounded-lg border border-ink bg-paper-2 p-4">
                                <p className="font-medium">Pay the advance online</p>
                                <p className="mt-1 text-[14px] text-muted">
                                    bKash, Nagad, cards or net banking through SSLCommerz. The balance and delivery are paid when the box arrives.
                                </p>
                            </div>
                        ) : onlineOnly ? (
                            <div className="mt-5 rounded-lg border border-ink bg-paper-2 p-4">
                                <p className="font-medium">Pay in full online</p>
                                <p className="mt-1 text-[14px] text-muted">
                                    {courierOnlineOnly ? `${chosenCourier.name} does not collect cash` : "Something in your bag travels with a courier that does not collect cash"}, so the price and delivery are paid now through SSLCommerz (bKash, Nagad, cards, net banking).
                                </p>
                            </div>
                        ) : (
                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                {[
                                    { v: "COD", t: "Cash on delivery", d: "Pay the delivery charge and COD fee online now, the rest to the courier." },
                                    { v: "SSLCommerz", t: "Pay in full online", d: "bKash, Nagad, cards or net banking through SSLCommerz." },
                                ].map((o) => (
                                    <label key={o.v} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 ${method === o.v ? "border-ink bg-paper-2" : "border-line"}`}>
                                        <input type="radio" name="pay" className="mt-1 accent-[var(--color-ink)]" checked={method === o.v} onChange={() => setMethod(o.v)} />
                                        <span>
                                            <span className="block font-medium">{o.t}</span>
                                            <span className="text-[13px] text-muted">{o.d}</span>
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}

                        <div className="mt-8">
                            <p className="text-[14px]">Coupon</p>
                            <div className="mt-1.5 flex gap-2">
                                <input className={`${inputCls} mt-0 uppercase`} value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder="Code" aria-label="Coupon code" />
                                <button type="button" className="btn btn-ghost h-12 shrink-0" onClick={() => setCoupon(couponInput.trim().toUpperCase())} disabled={!couponInput.trim()}>
                                    Apply
                                </button>
                            </div>
                            {coupon && totals?.couponMessage === "Coupon applied successfully" && <p className="mt-1 text-[13px] text-leaf-deep">{coupon} applied.</p>}
                        </div>
                    </section>
                </div>

                <aside className="min-w-0">
                    <div className="lg:sticky lg:top-32">
                        <OrderSummary items={items} totals={totals} isCalculating={isCalculating} needsAddress={needsAddress || !deliveryReady} />
                        {calcError && (
                            <p role="alert" className="mt-3 text-[14px] text-danger">
                                {calcError}
                            </p>
                        )}
                        <button type="submit" disabled={placeOrder.isPending || IS_STATIC || Boolean(calcError)} className="btn btn-mango mt-5 h-14 w-full text-[16px] disabled:cursor-not-allowed disabled:opacity-50">
                            {placeOrder.isPending
                                ? "Placing your order"
                                : totals && (totals.isPreOrder || totals.isCOD)
                                  ? `Pay ${taka(totals.codOnlinePaymentAmount)} now`
                                  : totals
                                    ? `Pay ${taka(totals.finalTotal)}`
                                    : "Place order"}
                        </button>
                        <p className="mt-3 text-center text-[13px] text-muted">
                            You will finish payment on SSLCommerz. Questions? Call {SITE.phone}.
                        </p>
                        <p className="mt-2 text-center text-[13px] text-muted">
                            By ordering you accept our{" "}
                            <Link href="/terms" className="underline underline-offset-2 hover:text-ink">
                                terms
                            </Link>{" "}
                            and{" "}
                            <Link href="/refund-policy" className="underline underline-offset-2 hover:text-ink">
                                refund policy
                            </Link>
                            .
                        </p>
                    </div>
                </aside>
            </form>
        </div>
    );
}
