"use client";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

import { inquiryApi } from "@/lib/api/inquiryApi";
import { errorMessage } from "@/lib/api/client";

const PHONE_RE = /^(?:\+?88)?01[3-9]\d{8}$/;

/**
 * POST /api/inquiries. Used for price on request / TBA products, wholesale
 * quotes and general questions. The server stores it, emails the shop and
 * rate limits it (5 per 15 minutes per IP).
 */
export default function InquiryForm({ type = "general", product, variantLabel, unit, defaultQty, title, intro, compact = false }) {
    const [form, setForm] = useState({ name: "", phone: "", email: "", district: "", quantity: defaultQty || "", message: "" });
    const [errors, setErrors] = useState({});
    const [state, setState] = useState({ status: "idle", message: "" });

    const set = (k) => (e) => {
        setForm((f) => ({ ...f, [k]: e.target.value }));
        setErrors((er) => ({ ...er, [k]: undefined }));
    };

    const submit = async (e) => {
        e.preventDefault();
        const next = {};
        if (!form.name.trim()) next.name = "Please tell us your name.";
        const phone = form.phone.replace(/[\s-]/g, "");
        if (!PHONE_RE.test(phone)) next.phone = "Enter an 11 digit mobile number starting 01.";
        if (form.email && !/\S+@\S+\.\S+/.test(form.email)) next.email = "That email does not look right.";
        setErrors(next);
        if (Object.keys(next).length) return;

        setState({ status: "sending", message: "" });
        try {
            const { data } = await inquiryApi.create({
                type,
                productId: product?._id,
                variantLabel: variantLabel || undefined,
                quantity: form.quantity ? Number(form.quantity) : undefined,
                name: form.name.trim(),
                phone,
                email: form.email.trim() || undefined,
                district: form.district.trim() || undefined,
                message: form.message.trim() || undefined,
            });
            setState({ status: "sent", message: data?.message || "Thanks. We will call you shortly." });
        } catch (error) {
            setState({ status: "error", message: errorMessage(error, "Could not send that. Please call us instead.") });
        }
    };

    if (state.status === "sent") {
        return (
            <div className="rounded-card border border-leaf/40 bg-leaf-soft p-6">
                <CheckCircle2 className="text-leaf-deep" aria-hidden />
                <p className="mt-3 text-lg font-medium">Inquiry received</p>
                <p className="mt-1 text-[15px] text-ink/75">{state.message}</p>
            </div>
        );
    }

    const field = "mt-1.5 h-12 w-full rounded-lg border border-line bg-paper px-4 text-[15px] outline-none focus:border-ink aria-[invalid=true]:border-danger";

    return (
        <form onSubmit={submit} noValidate className={compact ? "" : "rounded-card border border-line bg-paper p-5 md:p-6"}>
            {title && <h3 className="text-lg font-medium">{title}</h3>}
            {intro && <p className="mt-1 text-[14px] text-muted">{intro}</p>}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block text-[14px]">
                    Your name
                    <input className={field} value={form.name} onChange={set("name")} autoComplete="name" aria-invalid={Boolean(errors.name)} />
                    {errors.name && <span className="mt-1 block text-[13px] text-danger">{errors.name}</span>}
                </label>
                <label className="block text-[14px]">
                    Mobile number
                    <input className={field} value={form.phone} onChange={set("phone")} inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" aria-invalid={Boolean(errors.phone)} />
                    {errors.phone && <span className="mt-1 block text-[13px] text-danger">{errors.phone}</span>}
                </label>
                <label className="block text-[14px]">
                    Quantity {unit ? `(${unit})` : ""} <span className="text-muted">optional</span>
                    <input className={field} value={form.quantity} onChange={set("quantity")} inputMode="numeric" />
                </label>
                <label className="block text-[14px]">
                    District <span className="text-muted">optional</span>
                    <input className={field} value={form.district} onChange={set("district")} autoComplete="address-level2" />
                </label>
                <label className="block text-[14px] sm:col-span-2">
                    Email <span className="text-muted">optional</span>
                    <input className={field} type="email" value={form.email} onChange={set("email")} autoComplete="email" aria-invalid={Boolean(errors.email)} />
                    {errors.email && <span className="mt-1 block text-[13px] text-danger">{errors.email}</span>}
                </label>
                <label className="block text-[14px] sm:col-span-2">
                    Anything we should know <span className="text-muted">optional</span>
                    <textarea className={`${field} h-28 py-3`} value={form.message} onChange={set("message")} maxLength={2000} />
                </label>
            </div>
            {state.status === "error" && (
                <p role="alert" className="mt-4 text-[14px] text-danger">
                    {state.message}
                </p>
            )}
            <button type="submit" disabled={state.status === "sending"} className="btn btn-ink mt-5 w-full disabled:opacity-60 sm:w-auto">
                {state.status === "sending" ? "Sending" : "Send inquiry"}
            </button>
        </form>
    );
}
