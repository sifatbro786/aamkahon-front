export const inputCls =
    "mt-1.5 h-12 w-full rounded-lg border border-line bg-paper px-4 text-[15px] outline-none focus:border-ink aria-[invalid=true]:border-danger disabled:opacity-50";

export default function Field({ label, error, hint, children, className = "" }) {
    return (
        <label className={`block text-[14px] ${className}`}>
            {label}
            {children}
            {error ? <span className="mt-1 block text-[13px] text-danger">{error}</span> : hint ? <span className="mt-1 block text-[13px] text-muted">{hint}</span> : null}
        </label>
    );
}
