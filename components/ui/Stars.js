import { Star } from "lucide-react";

/** Read-only star rating. Half stars round to the nearest whole for clarity. */
export default function Stars({ value = 0, size = 14, className = "" }) {
    const filled = Math.round(value);
    return (
        <span className={`inline-flex items-center gap-0.5 text-mango ${className}`} role="img" aria-label={`${value.toFixed(1)} out of 5`}>
            {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={size} fill={i <= filled ? "currentColor" : "none"} strokeWidth={1.6} className={i <= filled ? "" : "text-line"} aria-hidden />
            ))}
        </span>
    );
}
