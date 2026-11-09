"use client";
import { Minus, Plus } from "lucide-react";

/** Quantity control. Typing is allowed; the parent clamps. */
export default function QtyStepper({ value, onChange, min = 1, max = Infinity, size = "md", label = "Quantity" }) {
    const h = size === "sm" ? "h-9" : "h-12";
    const w = size === "sm" ? "w-9" : "w-12";
    return (
        <div className={`inline-flex ${h} items-center rounded-full border border-line bg-paper`} role="group" aria-label={label}>
            <button type="button" className={`grid ${h} ${w} place-items-center rounded-full text-ink disabled:text-ink/25`} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Decrease">
                <Minus size={16} />
            </button>
            <input
                type="number"
                inputMode="numeric"
                className="num w-12 bg-transparent text-center text-[15px] font-medium outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                value={value}
                min={min}
                max={Number.isFinite(max) ? max : undefined}
                onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    if (Number.isFinite(n)) onChange(n);
                }}
                aria-label={label}
            />
            <button type="button" className={`grid ${h} ${w} place-items-center rounded-full text-ink disabled:text-ink/25`} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase">
                <Plus size={16} />
            </button>
        </div>
    );
}
