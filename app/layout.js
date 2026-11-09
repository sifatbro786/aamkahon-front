// Fonts are self-hosted from npm (@fontsource) rather than next/font/google:
// builds must not depend on reaching Google Fonts (VPS firewalls, CI sandboxes).
// Google Sans covers Latin and Bengali; Tiro Bangla is only for Bangla accents.
import "@fontsource-variable/google-sans/wght.css";
import "@fontsource/tiro-bangla/bengali-400.css";
import "./globals.css";

import Providers from "@/context/Providers";
import { SITE_URL } from "@/lib/config";

export const metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: "Aamkahon | Rajshahi mangoes and khejurer gur, wholesale and retail",
        template: "%s | Aamkahon",
    },
    description:
        "Aamkahon (আমকাহন) ships naturally ripened Rajshahi and Chapainawabganj mangoes and winter khejurer gur across Bangladesh. Retail, wholesale and 2027 pre-booking.",
    icons: { icon: "/images/logo.jpg" },
    openGraph: {
        type: "website",
        siteName: "Aamkahon",
        images: [{ url: "/images/team-orchard-banner.jpg", width: 2048, height: 1367 }],
    },
};

export const viewport = {
    themeColor: "#16120d",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="min-h-dvh flex flex-col" suppressHydrationWarning>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
