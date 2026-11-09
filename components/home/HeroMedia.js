"use client";
import { Volume2, VolumeX } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { mediaUrl } from "@/lib/media";

const MQ = "(min-width: 768px)";
const subscribe = (cb) => {
    const m = window.matchMedia(MQ);
    m.addEventListener("change", cb);
    return () => m.removeEventListener("change", cb);
};

const FALLBACK = {
    desktop: { mediaType: "image", mediaUrl: "/images/mango-cut-halves.jpg" },
    mobile: { mediaType: "video", mediaUrl: "/videos/hero-loop.mp4" },
};
const POSTER = { desktop: "/images/mango-cut-halves.jpg", mobile: "/videos/hero-poster.jpg" };

/**
 * Full bleed hero media, one record per device from Admin > Homepage hero
 * (HeroContent). Only the media for the current breakpoint is mounted, so a
 * phone never downloads the desktop video and vice versa. Before hydration
 * both posters are server rendered (CSS picks one), so the first paint is
 * never empty.
 *
 * Videos are muted through the ref before play(): React does not render the
 * `muted` attribute into server HTML, and browsers refuse unmuted autoplay.
 */
export default function HeroMedia({ desktop, mobile }) {
    const device = useSyncExternalStore(subscribe, () => (window.matchMedia(MQ).matches ? "desktop" : "mobile"), () => null);
    const ref = useRef(null);
    const [muted, setMuted] = useState(true);
    const [failed, setFailed] = useState({});

    const pick = (d) => {
        const item = (d === "desktop" ? desktop : mobile) || FALLBACK[d];
        return failed[d] ? FALLBACK[d] : item;
    };
    const active = device ? pick(device) : null;
    const isVideo = active?.mediaType === "video";

    useEffect(() => {
        const v = ref.current;
        if (!v) return;
        v.muted = true;
        v.play().catch(() => {});
    }, [device, active?.mediaUrl]);

    const toggle = () => {
        const v = ref.current;
        if (!v) return;
        v.muted = !v.muted;
        setMuted(v.muted);
        if (v.paused) v.play().catch(() => {});
    };

    return (
        <>
            {/* Server / first paint: posters, CSS chooses by breakpoint. */}
            {!device && (
                <>
                    <Image src={POSTER.mobile} alt="" fill priority sizes="100vw" className="object-cover md:hidden" />
                    <Image src={mediaUrl(desktop?.mediaType === "image" ? desktop.mediaUrl : POSTER.desktop)} alt="" fill priority sizes="100vw" className="hidden object-cover md:block" />
                </>
            )}

            {device && !isVideo && <Image key={active.mediaUrl} src={mediaUrl(active.mediaUrl)} alt="" fill priority sizes="100vw" className="object-cover" onError={() => setFailed((f) => ({ ...f, [device]: true }))} />}

            {device && isVideo && (
                <video
                    ref={ref}
                    key={`${device}-${active.mediaUrl}`}
                    className="absolute inset-0 size-full object-cover"
                    src={mediaUrl(active.mediaUrl)}
                    poster={POSTER[device]}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    aria-hidden
                    onError={() => setFailed((f) => ({ ...f, [device]: true }))}
                />
            )}

            {device && isVideo && (
                <button
                    type="button"
                    onClick={toggle}
                    className="absolute bottom-5 right-4 z-20 inline-flex items-center gap-2 rounded-full border border-paper/25 bg-ink/50 px-3.5 py-2 text-[13px] text-paper transition hover:bg-ink/80 md:right-8 md:bottom-8"
                    aria-pressed={!muted}
                    aria-label={muted ? "Turn sound on" : "Turn sound off"}
                >
                    {muted ? <VolumeX size={16} aria-hidden /> : <Volume2 size={16} aria-hidden />}
                    {muted ? "Sound off" : "Sound on"}
                </button>
            )}
        </>
    );
}
