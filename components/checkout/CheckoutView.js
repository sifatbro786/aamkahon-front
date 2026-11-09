"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import Field, { inputCls } from "@/components/checkout/Field";
import OrderSummary from "@/components/checkout/OrderSummary";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { errorMessage } from "@/lib/api/client";
import { IS_STATIC } from "@/lib/config";
import { taka } from "@/lib/format";
import { useCalculation, useCourierBranches, useDistricts, useGuestItems, useLocation, usePlaceOrder, useUpazilas } from "@/lib/hooks/useCheckout";
import { rememberGuestOrderToken } from "@/lib/store/orderAccess";
import { SITE } from "@/lib/site";

const EMPTY = { name: "", phone: "", email: "", district: "", upazila: "", addressLine1: "", addressLine2: "", deliveryType: "", courierBranch: "" };

/**
 * Single page checkout (port of the Footpath flow):
 *  - locationType comes from the server (district + upazila), never picked here
 *  - guests send guestItems; signed in users send none (server cart is used)
 *  - nothing price related is sent; every figure is from /checkout/calculate
 *  - both COD and online return a gateway redirectUrl
 *  - the guest capability token is stored BEFORE redirecting
 * Aamkahon: a pre-booking bag pays only the advance online (no COD choice).
 */
export default function CheckoutView() {
    const router = useRouter();
    const { items, isGuestCart, isPreOrderBag, resetAfterOrder } = useCart();
    const { user, isAuthenticated } = useAuth();

    const [draft, setDraft] = useState(EMPTY);
    const [method, setMethod] = useState("COD");
    const [coupon, setCoupon] = useState("");
    const [couponInput, setCouponInput] = useState("");
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState(null);

    // Signed in details fill blanks without an effect (derived, not copied).
    const address = {
        ...draft,
        name: draft.name || (user?.name ?? ""),
        email: draft.email || (user?.email ?? ""),
        phone: draft.phone || (user?.phoneNumber ?? ""),
    };

    const guestItems = useGuestItems(items);
    const { data: districts = [] } = useDistricts();
    const { data: upazilas = [], isFetching: upazilasLoading } = useUpazilas(address.district);
    const { data: location } = useLocation(address.district, address.upazila);
    const locationType = location?.locationType ?? null;
    const deliveryTypes = location?.availableDeliveryTypes ?? [];
    const outside = locationType === "outside_dhaka";
    const deliveryType = outside ? address.deliveryType : locationType ? "Home Delivery" : "";
    const isCourier = deliveryType === "Courier";
    const { data: branches = [] } = useCourierBranches(address.district, isCourier);

    const paymentMethod = isPreOrderBag ? "SSLCommerz" : method;
    const payload = useMemo(
        () => ({
            isGuest: isGuestCart,
            guestItems: isGuestCart ? guestItems : undefined,
            couponCode: coupon || undefined,
            locationType,
            deliveryType: deliveryType || undefined,
            courierBranch: isCourier ? address.courierBranch || undefined : undefined,
            paymentMethod,
            shippingAddress: { district: address.district, upazila: address.upazila },
        }),
        [isGuestCart, guestItems, coupon, locationType, deliveryType, isCourier, address.courierBranch, paymentMethod, address.district, address.upazila],
    );
    const { totals, isCalculating, needsAddress, error: calcError } = useCalculation(payload, items.length > 0);
    const placeOrder = usePlaceOrder();

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
        if (isGuestCart && !address.email.trim()) e.email = "We send your confirmation here.";
        else if (address.email && !/\S+@\S+\.\S+/.test(address.email)) e.email = "That email does not look right.";
        if (!address.district) e.district = "Choose a district.";
        if (!address.upazila) e.upazila = "Choose an area.";
        if (outside && !address.deliveryType) e.deliveryType = "Choose a delivery option.";
        if (isCourier && !address.courierBranch) e.courierBranch = "Choose a branch.";
        if (!isCourier && !address.addressLine1.trim()) e.addressLine1 = "We need a street address for home delivery.";
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
                isGuest: isGuestCart,
                guestEmail: isGuestCart ? address.email.trim() : undefined,
                guestItems: isGuestCart ? guestItems : undefined,
            });
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
            {!isAuthenticated && !IS_STATIC && (
                <p className="mt-5 text-[15px] text-muted">
                    Checking out as a guest.{" "}
                    <Link href="/login?next=/checkout" className="text-ink underline underline-offset-4">
                        Sign in
                    </Link>{" "}
                    to keep this order in your account.
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
                            <Field label={isGuestCart ? "Email" : "Email (optional)"} error={errors.email} className="sm:col-span-2">
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

                            {outside && (
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
                        <OrderSummary items={items} totals={totals} isCalculating={isCalculating} needsAddress={needsAddress || !locationType} />
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
                    </div>
                </aside>
            </form>
        </div>
    );
}
