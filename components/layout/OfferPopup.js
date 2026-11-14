"use client";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import api from "@/lib/api/client";
import { mediaUrl } from "@/lib/media";

/**
 * Storefront offer popup. Data: GET /api/offers/active
 * -> { success, count, data: [offer] } sorted by priority, already filtered by
 * date window, isActive and the active season on the server.
 *
 * displayFrequency is enforced here (the server only stores it):
 *   once   never again in this browser after it was shown
 *   daily  at most once per 24 h
 *   always once per browser session (not on every page change)
 * The seen key includes updatedAt, so editing an offer shows it again.
 *
 * Never on checkout, cart, payment result, account or auth pages, and it waits
 * for the homepage intro loader (which locks <html> scrolling) to finish.
 */
const DELAY_MS = 6000;
const DAY_MS = 86_400_000;
const QUIET = /^\/(checkout|cart|order|account|login|register|verify-email|forgot-password|reset-password|track-order)(\/|$)/;

const seenKey = (o) => `aamkahon.offer.${o._id}.${o.updatedAt || ""}`;
const isDue = (o) => {
    try {
        if (o.displayFrequency === "always") return sessionStorage.getItem(seenKey(o)) !== "1";
        const last = Number(localStorage.getItem(seenKey(o)) || 0);
        if (!last) return true;
        return o.displayFrequency === "daily" ? Date.now() - last > DAY_MS : false;
    } catch {
        return false; // storage blocked: do not nag on every page
    }
};
const markSeen = (o) => {
    try {
        if (o.displayFrequency === "always") sessionStorage.setItem(seenKey(o), "1");
        else localStorage.setItem(seenKey(o), String(Date.now()));
    } catch {
        /* ignore */
    }
};
const isInternal = (href) => /^\/(?!\/)/.test(href || "");

export default function OfferPopup() {
    const pathname = usePathname();
    const [offer, setOffer] = useState(null);
    const [open, setOpen] = useState(false);
    const closeRef = useRef(null);
    const quiet = QUIET.test(pathname || "");

    // Fetch once per mount (the layout keeps it mounted across navigation).
    useEffect(() => {
        let cancelled = false;
        api.get("/offers/active")
            .then(({ data }) => {
                if (cancelled) return;
                const next = (data?.data || []).find((o) => o.thumbnailImage && o.buttonLink && isDue(o));
                if (next) setOffer(next);
            })
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!offer || open || quiet) return;
        let t;
        const tryOpen = () => {
            // Intro loader still on screen: try again shortly.
            if (document.documentElement.style.overflow === "hidden" || document.hidden) {
                t = setTimeout(tryOpen, 1000);
                return;
            }
            if (!isDue(offer)) return;
            markSeen(offer);
            setOpen(true);
        };
        t = setTimeout(tryOpen, DELAY_MS);
        return () => clearTimeout(t);
    }, [offer, open, quiet]);

    // Esc to close, focus the close button, lock page scroll, return focus on close.
    useEffect(() => {
        if (!open) return;
        const prev = document.activeElement;
        const html = document.documentElement;
        const prevOverflow = html.style.overflow;
        html.style.overflow = "hidden";
        closeRef.current?.focus();
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", onKey);
        return () => {
            window.removeEventListener("keydown", onKey);
            html.style.overflow = prevOverflow;
            prev?.focus?.();
        };
    }, [open]);

    if (!open || !offer || quiet) return null;

    const close = () => setOpen(false);
    const cta = (
        <span className="btn btn-mango w-full sm:w-auto">{offer.buttonText || "Shop now"}</span>
    );

    return (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6" role="presentation">
            <button type="button" aria-label="Close offer" tabIndex={-1} onClick={close} className="absolute inset-0 animate-[ak-fade_0.3s_ease-out] bg-ink/60" />
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="offer-title"
                className="relative grid w-full max-w-3xl animate-[ak-pop_0.45s_cubic-bezier(0.22,1,0.36,1)] overflow-hidden rounded-t-2xl bg-paper text-ink shadow-2xl sm:grid-cols-[1fr_1.1fr] sm:rounded-2xl"
            >
                <div className="relative aspect-[16/10] sm:aspect-auto sm:min-h-[380px]">
                    <Image src={mediaUrl(offer.thumbnailImage)} alt="" fill sizes="(min-width: 640px) 360px, 100vw" className="object-cover" />
                </div>
                <div className="flex flex-col justify-center gap-4 p-6 sm:p-9">
                    <h2 id="offer-title" className="text-balance text-[1.7rem] font-semibold leading-[1.15] tracking-tight sm:text-[2rem]">
                        {offer.title}
                    </h2>
                    {/* Plain text on purpose: admin copy is never rendered as HTML. */}
                    <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink-soft">{offer.description}</p>
                    <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                        {isInternal(offer.buttonLink) ? (
                            <Link href={offer.buttonLink} onClick={close}>
                                {cta}
                            </Link>
                        ) : (
                            <a href={offer.buttonLink} target="_blank" rel="noreferrer" onClick={close}>
                                {cta}
                            </a>
                        )}
                        <button type="button" onClick={close} className="py-2 text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
                            Maybe later
                        </button>
                    </div>
                </div>
                <button
                    ref={closeRef}
                    type="button"
                    onClick={close}
                    aria-label="Close"
                    className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-paper/90 text-ink transition hover:bg-paper"
                >
                    <X size={18} aria-hidden />
                </button>
            </div>
        </div>
    );
}
