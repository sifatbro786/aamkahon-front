"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

const KEY = "aamkahon.intro.seen";
const MIN_MS = 3200; // long enough to read, short enough not to annoy
const MAX_MS = 5000; // never hold the page longer than this

/**
 * First-visit intro for the homepage (once per browser session).
 *
 * It is server rendered so it covers the page from the first paint. A tiny
 * inline script marks <html data-intro-seen> before paint on repeat visits,
 * and CSS hides the overlay, so returning visitors never see a flash of it.
 * The page underneath renders and loads normally the whole time; the overlay
 * only lifts once the window has loaded (min 3.2 s, max 5 s).
 */
export default function IntroLoader() {
    const [phase, setPhase] = useState("show"); // show -> leave -> gone

    useEffect(() => {
        let seen = false;
        try {
            seen = sessionStorage.getItem(KEY) === "1";
            sessionStorage.setItem(KEY, "1");
        } catch {
            /* storage blocked: show once per page load */
        }
        if (seen) {
            const t = setTimeout(() => setPhase("gone"), 0);
            return () => clearTimeout(t);
        }

        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const start = performance.now();
        document.documentElement.style.overflow = "hidden";

        let leaveTimer;
        const finish = () => {
            const wait = Math.max(0, (reduced ? 900 : MIN_MS) - (performance.now() - start));
            leaveTimer = setTimeout(() => setPhase("leave"), wait);
        };
        const hardStop = setTimeout(() => setPhase("leave"), MAX_MS);
        if (document.readyState === "complete") finish();
        else window.addEventListener("load", finish, { once: true });

        return () => {
            clearTimeout(leaveTimer);
            clearTimeout(hardStop);
            window.removeEventListener("load", finish);
            document.documentElement.style.overflow = "";
        };
    }, []);

    useEffect(() => {
        if (phase === "leave") {
            document.documentElement.style.overflow = "";
            const t = setTimeout(() => setPhase("gone"), 900);
            return () => clearTimeout(t);
        }
    }, [phase]);

    if (phase === "gone") return null;

    return (
        <>
            <script
                // Runs during HTML parse, before first paint.
                dangerouslySetInnerHTML={{
                    __html: `try{if(sessionStorage.getItem("${KEY}")==="1")document.documentElement.setAttribute("data-intro-seen","")}catch(e){}`,
                }}
            />
            <div id="ak-intro" className={`ak-intro ${phase === "leave" ? "ak-intro--leave" : ""}`} role="status" aria-label="Loading Aamkahon">
                <div className="ak-intro__inner">
                    <div className="ak-intro__fruit">
                        <Image src="/images/logo-icon.png" alt="" width={421} height={320} priority className="ak-intro__ghost" />
                        <Image src="/images/logo-icon.png" alt="" width={421} height={320} priority className="ak-intro__fill" />
                    </div>
                    <p lang="bn" className="ak-intro__word font-bangla">
                        আমকাহন
                    </p>
                    <p className="ak-intro__tag">The story of mangoes</p>
                    <div className="ak-intro__bar" aria-hidden>
                        <span />
                    </div>
                    <p className="ak-intro__note">Rajshahi · picked late, on purpose</p>
                </div>
            </div>
        </>
    );
}
