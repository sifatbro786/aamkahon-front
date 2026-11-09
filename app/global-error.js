"use client";
// Last resort when the root layout itself fails: no fonts, no providers, so
// everything here is inline and self-contained.
export default function GlobalError({ reset }) {
    return (
        <html lang="en">
            <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", background: "#16120d", color: "#faf5ea", fontFamily: "system-ui, sans-serif", textAlign: "center", padding: 24 }}>
                <div>
                    <p style={{ color: "#f29a1f", letterSpacing: "0.08em", fontSize: 12, textTransform: "uppercase" }}>Aamkahon</p>
                    <h1 style={{ fontWeight: 500, fontSize: 32, margin: "12px 0" }}>The site is having a moment</h1>
                    <p style={{ opacity: 0.7, maxWidth: 420 }}>Please try again. To order now, call or WhatsApp 01301-377225.</p>
                    <button type="button" onClick={() => reset()} style={{ marginTop: 24, background: "#f29a1f", color: "#16120d", border: 0, borderRadius: 999, padding: "12px 22px", fontSize: 15, cursor: "pointer" }}>
                        Try again
                    </button>
                </div>
            </body>
        </html>
    );
}
