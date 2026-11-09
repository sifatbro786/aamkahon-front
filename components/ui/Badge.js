const TONES = {
    mango: "bg-mango text-ink",
    leaf: "bg-leaf-soft text-leaf-deep",
    neutral: "bg-paper text-ink",
    muted: "bg-paper-3 text-muted",
    ink: "bg-ink text-paper",
};

export default function Badge({ tone = "neutral", children, className = "" }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-medium leading-none ${TONES[tone] || TONES.neutral} ${className}`}>
            {children}
        </span>
    );
}
