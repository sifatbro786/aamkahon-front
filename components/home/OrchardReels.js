"use client";
import { Pause, Play } from "lucide-react";
import { useRef, useState } from "react";

// The client's own Facebook clips, re-encoded for the web (see HANDOVER.md).
// Vertical phone footage, so they are shown as vertical cards.
const REELS = [
    {
        src: "/videos/langra-harvest.mp4",
        poster: "/videos/langra-harvest.jpg",
        bn: "আমকাহনের ল্যাংড়া",
        caption: "Checking Langra on the tree before picking",
    },
    {
        src: "/videos/gur-making.mp4",
        poster: "/videos/gur-making.jpg",
        bn: "খেজুরের গুড়",
        caption: "Date palm sap reduced over a wood fire",
    },
    {
        src: "/videos/harvest-pile.mp4",
        poster: "/videos/harvest-pile.jpg",
        bn: "সংগ্রহের দিন",
        caption: "A morning's harvest, sorted before packing",
    },
];

function Reel({ reel }) {
    const ref = useRef(null);
    const [playing, setPlaying] = useState(false);

    const toggle = () => {
        const v = ref.current;
        if (!v) return;
        if (v.paused) {
            // Only one reel plays at a time.
            document.querySelectorAll("video[data-reel]").forEach((other) => other !== v && other.pause());
            v.play();
        } else v.pause();
    };

    return (
        <figure className="min-w-0">
            <div className="relative aspect-[9/16] overflow-hidden rounded-card bg-ink-2">
                <video
                    ref={ref}
                    data-reel
                    src={reel.src}
                    poster={reel.poster}
                    preload="none"
                    playsInline
                    controls={playing}
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                    className="absolute inset-0 size-full object-cover"
                />
                {!playing && (
                    <button
                        type="button"
                        onClick={toggle}
                        className="absolute inset-0 flex items-end bg-gradient-to-t from-ink/70 via-transparent to-transparent p-5 text-left"
                        aria-label={`Play: ${reel.caption}`}
                    >
                        <span className="grid size-12 place-items-center rounded-full bg-paper text-ink">
                            <Play size={20} fill="currentColor" aria-hidden />
                        </span>
                    </button>
                )}
                {playing && (
                    <button type="button" onClick={toggle} className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-ink/60 text-paper" aria-label="Pause">
                        <Pause size={16} aria-hidden />
                    </button>
                )}
            </div>
            <figcaption className="mt-3">
                <span lang="bn" className="font-bangla text-[16px] text-mango-deep">
                    {reel.bn}
                </span>
                <span className="mt-0.5 block text-[14px] text-muted">{reel.caption}</span>
            </figcaption>
        </figure>
    );
}

export default function OrchardReels() {
    return (
        <section className="py-16 md:py-24" aria-labelledby="reels-title">
            <div className="wrap grid gap-10 lg:grid-cols-12">
                <div className="lg:col-span-4">
                    <p className="label text-leaf-deep">From the orchard</p>
                    <h2 id="reels-title" className="mt-3 text-h2 font-medium">
                        Filmed on our phones, not in a studio
                    </h2>
                    <p className="mt-5 text-[16px] leading-relaxed text-muted">
                        No formalin, no carbide, no hydros in the gur. The easiest way to show that is to show the work: the
                        trees, the fire, the sorting floor.
                    </p>
                </div>
                <div className="lg:col-span-8">
                    <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
                        {REELS.map((r) => (
                            <div key={r.src} className="w-[62%] shrink-0 snap-start sm:w-auto">
                                <Reel reel={r} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
