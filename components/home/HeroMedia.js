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
const noop = () => () => {};

const SLIDE_MS = 6000;
const FALLBACK_DESKTOP = [{ _id: "fallback", mediaType: "image", mediaUrl: "/images/mango-cut-halves.jpg", label: "" }];
const FALLBACK_MOBILE = { mediaType: "video", mediaUrl: "/videos/hero-loop.mp4" };
const MOBILE_POSTER = "/videos/hero-poster.jpg";

/**
 * Hero background.
 *  desktop: slider over the admin's desktop records (crossfade + slow zoom);
 *           only the background changes, the copy above it is static.
 *  phone:   one record, normally the vertical reel video.
 * Only the current breakpoint's media is mounted after hydration, so phones
 * never download desktop images or videos. Before hydration both first frames
 * are server rendered and CSS picks one, so the first paint is never empty.
 *
 * Videos are muted through the ref before play(): React does not render the
 * `muted` attribute into server HTML and browsers refuse unmuted autoplay.
 *
 * Desktop video slides sit on top of their poster (admin field posterUrl,
 * optimised through next/image) and fade in only once frames are playing, so
 * a slow connection shows a still instead of a black box. The poster also
 * replaces the video for reduced motion, and when the video errors or the
 * browser refuses autoplay; such a slide then counts as a photo, otherwise the
 * slider would wait for an `ended` event that never comes.
 */
export default function HeroMedia({ slides, mobile }) {
    const device = useSyncExternalStore(subscribe, () => (window.matchMedia(MQ).matches ? "desktop" : "mobile"), () => null);
    const reduced = useSyncExternalStore(noop, () => window.matchMedia("(prefers-reduced-motion: reduce)").matches, () => false);
    const list = slides?.length ? slides : FALLBACK_DESKTOP;
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const [mobileFailed, setMobileFailed] = useState(false);
    const [muted, setMuted] = useState(true);
    // Desktop video slides that cannot play (error or autoplay refused), by url.
    const [stalled, setStalled] = useState(() => new Set());
    // Url of the desktop video that is actually showing frames.
    const [playingUrl, setPlayingUrl] = useState(null);
    const videoRef = useRef(null);

    const mobileItem = !mobile || mobileFailed ? FALLBACK_MOBILE : mobile;
    const current = list[index % list.length];
    const mobilePoster = mediaUrl(mobileItem.posterUrl || MOBILE_POSTER);
    // A desktop video slide plays unless it is stalled, or reduced motion is on
    // and there is a poster to show instead.
    const playsVideo = (s) => s.mediaType === "video" && !stalled.has(s.mediaUrl) && !(reduced && s.posterUrl);
    const stall = (url) => setStalled((prev) => (prev.has(url) ? prev : new Set(prev).add(url)));
    const activeIsVideo = device === "mobile" ? mobileItem.mediaType === "video" : playsVideo(current);

    // Auto advance on desktop. Paused while a desktop video slide plays, on
    // hover over the indicators, when the tab is hidden, or for reduced motion.
    useEffect(() => {
        if (device !== "desktop" || list.length < 2 || paused || reduced || playsVideo(current)) return;
        const t = setTimeout(() => {
            if (!document.hidden) setIndex((i) => (i + 1) % list.length);
        }, SLIDE_MS);
        return () => clearTimeout(t);
        // playsVideo reads stalled/reduced, both listed.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [device, list.length, paused, reduced, index, current.mediaType, stalled]);

    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        v.muted = true;
        const url = device === "desktop" ? current.mediaUrl : null;
        v.play().catch((err) => {
            // AbortError = the element was swapped mid-play, not a refusal.
            if (url && err?.name !== "AbortError") stall(url);
        });
        // current.mediaUrl changes with index.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [device, index, mobileItem.mediaUrl]);

    const toggleSound = () => {
        const v = videoRef.current;
        if (!v) return;
        v.muted = !v.muted;
        setMuted(v.muted);
        if (v.paused) v.play().catch(() => {});
    };

    return (
        <>
            {/* First paint, before we know the breakpoint. */}
            {!device && (
                <>
                    <Image src={mobileItem.mediaType === "image" ? mediaUrl(mobileItem.mediaUrl) : mobilePoster} alt="" fill priority sizes="100vw" className="object-cover md:hidden" />
                    {(list[0].mediaType === "image" || list[0].posterUrl) && (
                        <Image src={mediaUrl(list[0].mediaType === "image" ? list[0].mediaUrl : list[0].posterUrl)} alt="" fill priority sizes="100vw" className="hidden object-cover md:block" />
                    )}
                </>
            )}

            {device === "mobile" &&
                (mobileItem.mediaType === "video" ? (
                    <video
                        ref={videoRef}
                        key={mobileItem.mediaUrl}
                        className="absolute inset-0 size-full object-cover"
                        src={mediaUrl(mobileItem.mediaUrl)}
                        poster={mobilePoster}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                        aria-hidden
                        onError={() => setMobileFailed(true)}
                    />
                ) : (
                    <Image src={mediaUrl(mobileItem.mediaUrl)} alt="" fill priority sizes="100vw" className="object-cover" onError={() => setMobileFailed(true)} />
                ))}

            {device === "desktop" &&
                list.map((s, i) => {
                    const on = i === index % list.length;
                    return (
                        <div key={s._id || s.mediaUrl} className={`absolute inset-0 transition-opacity duration-[1400ms] ease-out ${on ? "opacity-100" : "opacity-0"}`} aria-hidden={!on}>
                            {s.mediaType === "video" ? (
                                <>
                                    {(s.posterUrl || !playsVideo(s)) && (
                                        <Image
                                            src={s.posterUrl ? mediaUrl(s.posterUrl) : FALLBACK_DESKTOP[0].mediaUrl}
                                            alt=""
                                            fill
                                            priority={i === 0}
                                            sizes="100vw"
                                            className="object-cover"
                                        />
                                    )}
                                    {on && playsVideo(s) && (
                                        <video
                                            ref={videoRef}
                                            key={s.mediaUrl}
                                            className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ${playingUrl === s.mediaUrl ? "opacity-100" : "opacity-0"}`}
                                            src={mediaUrl(s.mediaUrl)}
                                            autoPlay
                                            muted
                                            playsInline
                                            preload="auto"
                                            onPlaying={() => setPlayingUrl(s.mediaUrl)}
                                            onError={() => stall(s.mediaUrl)}
                                            onEnded={() => setIndex((x) => (x + 1) % list.length)}
                                            loop={list.length < 2}
                                        />
                                    )}
                                </>
                            ) : (
                                <Image
                                    src={mediaUrl(s.mediaUrl)}
                                    alt=""
                                    fill
                                    priority={i === 0}
                                    sizes="100vw"
                                    // Slow zoom on the visible slide only; restarts each time it comes round.
                                    className={`object-cover ${on && !reduced ? "animate-[ak-kenburns_7s_ease-out_forwards]" : ""}`}
                                />
                            )}
                        </div>
                    );
                })}

            {device === "desktop" && list.length > 1 && (
                <div className="absolute bottom-8 right-8 z-20 hidden gap-5 lg:flex" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
                    {list.map((s, i) => {
                        const on = i === index % list.length;
                        return (
                            <button key={s._id || i} type="button" onClick={() => setIndex(i)} className="group w-28 text-left" aria-label={`Show ${s.label || `slide ${i + 1}`}`} aria-current={on}>
                                <span className="block h-0.5 overflow-hidden rounded-full bg-paper/25">
                                    <span
                                        key={on ? `on-${index}` : "off"}
                                        className={`block h-full origin-left bg-mango ${on ? (paused || reduced ? "scale-x-100" : "animate-[ak-progress_6s_linear_forwards]") : "scale-x-0"}`}
                                    />
                                </span>
                                {s.label && <span className={`mt-2 block truncate text-[13px] transition-colors ${on ? "text-paper" : "text-paper/55 group-hover:text-paper/85"}`}>{s.label}</span>}
                            </button>
                        );
                    })}
                </div>
            )}

            {device && activeIsVideo && (
                <button
                    type="button"
                    onClick={toggleSound}
                    className={`absolute z-20 grid size-11 place-items-center rounded-full border border-paper/30 bg-ink/55 text-paper backdrop-blur-sm transition hover:bg-ink/80 ${device === "desktop" && list.length > 1 ? "bottom-8 right-8 lg:bottom-24" : "bottom-5 right-4 md:bottom-8 md:right-8"}`}
                    aria-pressed={!muted}
                    aria-label={muted ? "Turn sound on" : "Turn sound off"}
                    title={muted ? "Sound on" : "Sound off"}
                >
                    {muted ? <VolumeX size={18} aria-hidden /> : <Volume2 size={18} aria-hidden />}
                </button>
            )}
        </>
    );
}
