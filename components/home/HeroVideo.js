"use client";
import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const FALLBACK = "/videos/hero-loop.mp4";

/**
 * Autoplay needs the video to be muted at the moment play() is called.
 * React does not reliably render the `muted` attribute into server HTML, so
 * browsers saw an unmuted autoplay video and refused to start it. Muting
 * through the ref and calling play() ourselves fixes that, and gives us a
 * sound toggle for free.
 */
export default function HeroVideo({ src, poster, label }) {
    const ref = useRef(null);
    const [muted, setMuted] = useState(true);
    const [source, setSource] = useState(src || FALLBACK);

    useEffect(() => {
        const v = ref.current;
        if (!v) return;
        v.muted = true;
        v.play().catch(() => {
            /* Low power mode / data saver: the poster stays, the toggle still works. */
        });
    }, [source]);

    const toggleSound = () => {
        const v = ref.current;
        if (!v) return;
        v.muted = !v.muted;
        setMuted(v.muted);
        if (v.paused) v.play().catch(() => {});
    };

    return (
        <>
            <video
                ref={ref}
                key={source}
                className="absolute inset-0 size-full object-cover"
                src={source}
                poster={poster}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                aria-label={label}
                // An admin may point the hero at a file that no longer exists;
                // fall back to the bundled clip instead of a black box.
                onError={() => source !== FALLBACK && setSource(FALLBACK)}
            />
            <button
                type="button"
                onClick={toggleSound}
                className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-ink/70 px-3.5 py-2 text-[13px] text-paper backdrop-blur-sm transition hover:bg-ink"
                aria-pressed={!muted}
                aria-label={muted ? "Turn sound on" : "Turn sound off"}
            >
                {muted ? <VolumeX size={16} aria-hidden /> : <Volume2 size={16} aria-hidden />}
                {muted ? "Sound off" : "Sound on"}
            </button>
        </>
    );
}
