"use client";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import QtyStepper from "@/components/ui/QtyStepper";
import { useCart } from "@/context/CartContext";
import { dayMonth, plural, taka } from "@/lib/format";
import { lineIsWholesale, lineUnitPrice } from "@/lib/store/cartLine";

export default function CartLines({ compact = false, onNavigate }) {
    const { items, updateQty, removeItem } = useCart();

    return (
        <ul className="divide-y divide-line">
            {items.map((line) => {
                const unit = lineUnitPrice(line);
                const wholesale = lineIsWholesale(line);
                const toTier = line.wholesale?.price && !wholesale && line.wholesale.price < line.price ? line.wholesale.minQty - line.quantity : 0;
                return (
                    <li key={line.key} className="flex gap-4 py-5">
                        <Link href={`/product/${line.slug}`} onClick={onNavigate} className={`relative shrink-0 overflow-hidden rounded-lg bg-paper-2 ${compact ? "size-20" : "size-24"}`}>
                            <Image src={line.image} alt={line.name} fill sizes="96px" className="object-cover" />
                        </Link>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <Link href={`/product/${line.slug}`} onClick={onNavigate} className="block truncate font-medium hover:text-mango-deep">
                                        {line.name}
                                    </Link>
                                    {line.variantLabel && <p className="text-[13px] text-muted">{line.variantLabel}</p>}
                                </div>
                                <button type="button" onClick={() => removeItem(line.key)} className="-mr-1 -mt-1 grid size-8 shrink-0 place-items-center rounded-full text-muted hover:bg-paper-2 hover:text-ink" aria-label={`Remove ${line.name}`}>
                                    <X size={16} />
                                </button>
                            </div>

                            {line.isPreOrder && line.expectedDate && <p className="mt-1 text-[13px] text-mango-deep">Pre-booking, ships from {dayMonth(line.expectedDate)}</p>}

                            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                                <QtyStepper size="sm" value={line.quantity} min={line.minQty || 1} max={line.stock} onChange={(q) => updateQty(line.key, q)} label={`Quantity of ${line.name}`} />
                                <p className="num text-right">
                                    <span className="font-semibold">{taka(unit * line.quantity)}</span>
                                    <span className="block text-[12px] text-muted">
                                        {taka(unit)} / {line.variantLabel || line.unit}
                                        {wholesale && <span className="text-leaf-deep"> · wholesale</span>}
                                    </span>
                                </p>
                            </div>
                            {toTier > 0 && (
                                <p className="mt-2 text-[12px] text-leaf-deep">
                                    Add {toTier} more {plural(toTier, line.unit)} for {taka(line.wholesale.price)} each
                                </p>
                            )}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
