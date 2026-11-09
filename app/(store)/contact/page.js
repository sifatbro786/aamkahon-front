import { Phone } from "lucide-react";

import InquiryForm from "@/components/product/InquiryForm";
import { FacebookIcon, WhatsAppIcon } from "@/components/ui/BrandIcons";
import { SITE } from "@/lib/site";

export const metadata = { title: "Contact", description: "Call, WhatsApp or message Aamkahon in Rajshahi.", alternates: { canonical: "/contact" } };

export default function ContactPage() {
    const channels = [
        { icon: <Phone size={20} />, label: "Call", value: SITE.phone, href: SITE.phoneHref },
        { icon: <WhatsAppIcon size={20} />, label: "WhatsApp", value: SITE.phone, href: SITE.whatsapp },
        { icon: <FacebookIcon size={20} />, label: "Facebook", value: "Message the page", href: SITE.facebook },
    ];
    return (
        <div className="wrap grid gap-12 py-14 md:py-20 lg:grid-cols-12">
            <div className="lg:col-span-5">
                <p className="label text-mango-deep">Contact</p>
                <h1 className="mt-3 text-h2 font-medium">Talk to a person, not a ticket</h1>
                <p className="mt-4 text-[16px] leading-relaxed text-muted">We answer calls and WhatsApp every day, including Fridays in season. {SITE.location}.</p>
                <ul className="mt-10 divide-y divide-line border-y border-line">
                    {channels.map((c) => (
                        <li key={c.label}>
                            <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="flex items-center gap-4 py-5 hover:text-mango-deep">
                                <span className="grid size-11 place-items-center rounded-full bg-paper-2">{c.icon}</span>
                                <span>
                                    <span className="block text-[13px] text-muted">{c.label}</span>
                                    <span className="num text-lg">{c.value}</span>
                                </span>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="lg:col-span-7">
                <InquiryForm type="general" title="Send us a message" intro="We reply by phone, usually the same day." />
            </div>
        </div>
    );
}
