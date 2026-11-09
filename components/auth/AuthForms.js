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
            const data = await login({ ...form, rememberMe: true });
            const isAdmin = ["admin", "executive"].includes(data.user?.role);
            router.replace(safeNext(sp.get("next")) || (isAdmin ? "/admin" : "/account"));
        } catch (err) {
            const msg = errorMessage(err, "Could not sign in.");
            if (/verify/i.test(msg)) router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
            else setError(msg);
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
            {!IS_STATIC && (
                <p className="pt-2 text-center text-[15px] text-muted">
                    New here?{" "}
                    <Link href="/register" className="text-ink underline underline-offset-4">
                        Create an account
                    </Link>
                </p>
            )}
        </form>
    );
}

export function RegisterForm() {
    const { register } = useAuth();
    const router = useRouter();
    const [form, setForm] = useState({ name: "", email: "", password: "", acceptTerms: false });
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        if (form.password.length < 8) return setError("Use at least 8 characters for your password.");
        if (!form.acceptTerms) return setError("Please accept the terms to continue.");
        setBusy(true);
        setError(null);
        try {
            const data = await register(form);
            router.push(`/verify-email?email=${encodeURIComponent(data.email || form.email)}`);
        } catch (err) {
            setError(errorMessage(err, "Could not create the account."));
        } finally {
            setBusy(false);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            {error && <Alert>{error}</Alert>}
            <Field label="Full name">
                <input className={inputCls} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </Field>
            <Field label="Email">
                <input className={inputCls} type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </Field>
            <Field label="Password" hint="At least 8 characters">
                <input className={inputCls} type="password" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </Field>
            <label className="flex items-start gap-3 text-[14px] text-muted">
                <input type="checkbox" className="mt-0.5 size-4 accent-[var(--color-ink)]" checked={form.acceptTerms} onChange={(e) => setForm({ ...form, acceptTerms: e.target.checked })} />
                <span>
                    I agree to the{" "}
                    <Link href="/terms" className="text-ink underline underline-offset-4">
                        terms
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-ink underline underline-offset-4">
                        privacy policy
                    </Link>
                    .
                </span>
            </label>
            <button className="btn btn-ink h-12 w-full" disabled={busy || IS_STATIC}>
                {busy ? "Creating account" : "Create account"}
            </button>
            <p className="pt-2 text-center text-[15px] text-muted">
                Already have one?{" "}
                <Link href="/login" className="text-ink underline underline-offset-4">
                    Sign in
                </Link>
            </p>
        </form>
    );
}

export function VerifyEmailForm() {
    const { verifyEmail } = useAuth();
    const router = useRouter();
    const sp = useSearchParams();
    const email = sp.get("email") || "";
    const [otp, setOtp] = useState("");
    const [msg, setMsg] = useState(null);
    const [busy, setBusy] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setMsg(null);
        try {
            await verifyEmail({ email, otp: otp.trim() });
            router.replace("/account");
        } catch (err) {
            setMsg({ tone: "danger", text: errorMessage(err, "That code did not work.") });
        } finally {
            setBusy(false);
        }
    };
    const resend = async () => {
        try {
            await authApi.resendVerification({ email });
            setMsg({ tone: "ok", text: "A new code is on its way." });
        } catch (err) {
            setMsg({ tone: "danger", text: errorMessage(err, "Could not resend the code.") });
        }
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <p className="text-[15px] text-muted">
                We sent a 6 digit code to <span className="text-ink">{email || "your email"}</span>.
            </p>
            {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
            <Field label="Verification code">
                <input className={`${inputCls} num text-center text-xl tracking-[0.4em]`} inputMode="numeric" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} autoComplete="one-time-code" required />
            </Field>
            <button className="btn btn-ink h-12 w-full" disabled={busy || otp.length < 6}>
                {busy ? "Checking" : "Verify and continue"}
            </button>
            <button type="button" onClick={resend} className="w-full py-2 text-[14px] text-muted hover:text-ink">
                Send a new code
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
