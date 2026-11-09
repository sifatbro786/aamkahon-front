"use client";
import { useState } from "react";

import Field, { inputCls } from "@/components/checkout/Field";
import OrderDetails, { statusLabel } from "@/components/order/OrderDetails";
import { checkoutApi } from "@/lib/api/checkoutApi";
import { errorMessage } from "@/lib/api/client";

/** POST /api/orders/track (rate limited, phone stays out of URLs). */
export default function TrackOrder() {
    const [orderNumber, setOrderNumber] = useState("");
    const [phone, setPhone] = useState("");
    const [state, setState] = useState({ status: "idle" });

    const submit = async (e) => {
        e.preventDefault();
        if (!orderNumber.trim() || !phone.trim()) return setState({ status: "error", message: "Enter both the order number and your phone number." });
        setState({ status: "loading" });
        try {
            const { data } = await checkoutApi.trackOrder({ orderNumber: orderNumber.trim().toUpperCase(), phone: phone.replace(/[\s-]/g, "") });
            setState({ status: "found", order: data.order });
        } catch (error) {
            setState({ status: "error", message: errorMessage(error, "We could not find an order with those details.") });
        }
    };

    return (
        <div className="wrap max-w-3xl py-14 md:py-20">
            <p className="label text-mango-deep">Orders</p>
            <h1 className="mt-3 text-h2 font-medium">Track your order</h1>
            <p className="mt-3 text-[16px] text-muted">Use the order number from your receipt and the phone number you ordered with.</p>
            <form onSubmit={submit} className="mt-8 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                <Field label="Order number">
                    <input className={`${inputCls} uppercase`} value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="ORD2611090001" />
                </Field>
                <Field label="Phone">
                    <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="01XXXXXXXXX" />
                </Field>
                <button type="submit" className="btn btn-ink h-12" disabled={state.status === "loading"}>
                    {state.status === "loading" ? "Looking" : "Track"}
                </button>
            </form>
            {state.status === "error" && (
                <p role="alert" className="mt-4 text-danger">
                    {state.message}
                </p>
            )}
            {state.status === "found" && (
                <div className="mt-12">
                    <p className="text-[15px] text-muted">
                        Order <span className="num text-ink">{state.order.orderNumber}</span>
                    </p>
                    <p className="mt-1 text-2xl font-medium">{statusLabel(state.order.orderStatus)}</p>
                    <div className="mt-8">
                        <OrderDetails order={state.order} />
                    </div>
                </div>
            )}
        </div>
    );
}
