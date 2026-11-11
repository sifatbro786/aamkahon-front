import Image from "next/image";
import Link from "next/link";

import { FacebookIcon, WhatsAppIcon } from "@/components/ui/BrandIcons";
import { SITE } from "@/lib/site";

const COLUMNS = [
    {
        title: "Shop",
        links: [
            { label: "Pre-book 2027 mangoes", href: "/shop?availability=pre_order" },
            { label: "Mango", href: "/shop?category=mango" },
            { label: "Khejurer gur", href: "/shop?category=khejurer-gur" },
            { label: "Farm pantry", href: "/shop?category=farm-pantry" },
        ],
    },
    {
        title: "Buying",
        links: [
            { label: "Wholesale and export", href: "/wholesale" },
            { label: "Delivery and shipping", href: "/delivery" },
            { label: "Track an order", href: "/track-order" },
            { label: "Questions and answers", href: "/faq" },
            { label: "Our story", href: "/story" },
        ],
    },
];

export default function SiteFooter() {
    return (
        <footer className="bg-ink text-paper">
            <div className="wrap grid gap-12 py-16 md:grid-cols-12 md:py-20">
                <div className="md:col-span-5">
                    <Image src="/images/logo-lockup.png" alt="Aamkahon, the story of mangoes" width={747} height={160} className="h-10 w-auto" />
                    <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-paper/70">
                        Naturally ripened mangoes from Rajshahi and Chapainawabganj, and winter khejurer gur. Retail, wholesale
                        and export, since {SITE.since}.
                    </p>
                </div>

                {COLUMNS.map((col) => (
                    <div key={col.title} className="md:col-span-2">
                        <h2 className="label text-paper/45">{col.title}</h2>
                        <ul className="mt-4 space-y-3">
                            {col.links.map((l) => (
                                <li key={l.href}>
                                    <Link href={l.href} className="text-paper/80 hover:text-paper">
                                        {l.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}

                <div className="md:col-span-3">
                    <h2 className="label text-paper/45">Talk to us</h2>
                    <a href={SITE.phoneHref} className="num mt-4 block text-xl text-mango hover:text-paper">
                        {SITE.phone}
                    </a>
                    <p className="mt-2 text-paper/60">{SITE.location}</p>
                    <div className="mt-6 flex gap-3">
                        <a
                            href={SITE.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Aamkahon on Facebook"
                            className="grid size-11 place-items-center rounded-full border border-line-dark text-paper/80 transition-colors hover:border-mango hover:text-mango"
                        >
                            <FacebookIcon size={20} />
                        </a>
                        <a
                            href={SITE.whatsapp}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Message Aamkahon on WhatsApp"
                            className="grid size-11 place-items-center rounded-full border border-line-dark text-paper/80 transition-colors hover:border-leaf hover:text-leaf"
                        >
                            <WhatsAppIcon size={20} />
                        </a>
                    </div>
                </div>
            </div>
            <div className="border-t border-line-dark">
                <div className="wrap flex flex-col gap-3 py-6 text-sm text-paper/45 md:flex-row md:items-center md:justify-between">
                    <p>© {SITE.copyrightYear} {SITE.legalName}. All rights reserved.</p>
                    <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Legal">
                        <Link href="/privacy" className="hover:text-paper">
                            Privacy policy
                        </Link>
                        <Link href="/terms" className="hover:text-paper">
                            Terms and conditions
                        </Link>
                    </nav>
                    <p>
                        Developed by{" "}
                        <a href="https://strsltd.com" target="_blank" rel="noopener" className="text-paper/70 underline-offset-4 hover:text-mango hover:underline">
                            STR Solutions LTD
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
