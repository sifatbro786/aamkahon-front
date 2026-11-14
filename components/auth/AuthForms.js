"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import Field, { inputCls } from "@/components/checkout/Field";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/lib/api/authApi";
import { errorMessage } from "@/lib/api/client";
import { DEMO_ADMIN, IS_STATIC } from "@/lib/config";

// Only allow same-site relative redirects (?next=/checkout), never //evil.com.
const safeNext = (v) => (v && v.startsWith("/") && !v.startsWith("//") ? v : null);

function Alert({ children, tone = "danger" }) {
    return (
        <p role="alert" className={`rounded-lg px-4 py-3 text-[15px] ${tone === "danger" ? "bg-danger/8 text-danger" : "bg-leaf-soft text-leaf-deep"}`}>
            {children}
        </p>
    );
}

export function LoginForm() {
    const { login } = useAuth();
    const router = useRouter();
    const sp = useSearchParams();
    const [form, setForm] = useState({ email: IS_STATIC ? DEMO_ADMIN.email : "", password: IS_STATIC ? DEMO_ADMIN.password : "" });
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
            await login({ ...form, rememberMe: true });
            // Team only (the API refuses anyone else). Stay on admin paths.
            const next = safeNext(sp.get("next"));
            router.replace(next && next.startsWith("/admin") ? next : "/admin");
        } catch (err) {
            setError(errorMessage(err, "Could not sign in."));
        } finally {
            setBusy(false);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            {IS_STATIC && <Alert tone="ok">Demo site: the admin demo login is filled in for you.</Alert>}
            {error && <Alert>{error}</Alert>}
            <Field label="Email">
                <input className={inputCls} type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </Field>
            <Field label="Password">
                <input className={inputCls} type="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </Field>
            <div className="flex justify-end">
                <Link href="/forgot-password" className="text-[14px] text-muted hover:text-ink">
                    Forgot password?
                </Link>
            </div>
            <button className="btn btn-ink h-12 w-full" disabled={busy}>
                {busy ? "Signing in" : "Sign in"}
            </button>
        </form>
    );
}

export function ForgotPasswordForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(false);
    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
            await authApi.forgotPassword({ email });
            router.push(`/reset-password?email=${encodeURIComponent(email)}`);
        } catch (err) {
            setError(errorMessage(err, "Could not send the reset code."));
        } finally {
            setBusy(false);
        }
    };
    return (
        <form onSubmit={submit} className="space-y-4">
            {error && <Alert>{error}</Alert>}
            <Field label="Email">
                <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </Field>
            <button className="btn btn-ink h-12 w-full" disabled={busy || IS_STATIC}>
                {busy ? "Sending" : "Send reset code"}
            </button>
        </form>
    );
}

export function ResetPasswordForm() {
    const router = useRouter();
    const sp = useSearchParams();
    const [form, setForm] = useState({ email: sp.get("email") || "", otp: "", newPassword: "" });
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(false);
    const submit = async (e) => {
        e.preventDefault();
        if (form.newPassword.length < 8) return setError("Use at least 8 characters.");
        setBusy(true);
        setError(null);
        try {
            await authApi.resetPassword(form);
            router.replace("/login");
        } catch (err) {
            setError(errorMessage(err, "Could not reset the password."));
        } finally {
            setBusy(false);
        }
    };
    return (
        <form onSubmit={submit} className="space-y-4">
            {error && <Alert>{error}</Alert>}
            <Field label="Email">
                <input className={inputCls} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </Field>
            <Field label="Code from your email">
                <input className={`${inputCls} num tracking-[0.3em]`} inputMode="numeric" maxLength={6} value={form.otp} onChange={(e) => setForm({ ...form, otp: e.target.value.replace(/\D/g, "") })} required />
            </Field>
            <Field label="New password">
                <input className={inputCls} type="password" autoComplete="new-password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} required />
            </Field>
            <button className="btn btn-ink h-12 w-full" disabled={busy}>
                {busy ? "Saving" : "Set new password"}
            </button>
        </form>
    );
}
