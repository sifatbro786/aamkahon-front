"use client";
import Image from "next/image";
import { useState } from "react";

export default function ProductGallery({ images = [], name }) {
    const [active, setActive] = useState(0);
    const current = images[active] || images[0];
    if (!current) return null;

    return (
        <div className="min-w-0">
            <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-paper-2 md:aspect-square lg:aspect-[4/5]">
                <Image key={current.src} src={current.src} alt={current.alt || name} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
            {images.length > 1 && (
                <ul className="mt-3 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {images.map((img, i) => (
                        <li key={img.src + i} className="shrink-0">
                            <button
                                type="button"
                                onClick={() => setActive(i)}
                                className={`relative block size-20 overflow-hidden rounded-lg border-2 transition-colors ${i === active ? "border-ink" : "border-transparent opacity-75 hover:opacity-100"}`}
                                aria-label={`Show image ${i + 1}`}
                                aria-current={i === active}
                            >
                                <Image src={img.src} alt="" fill sizes="80px" className="object-cover" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
