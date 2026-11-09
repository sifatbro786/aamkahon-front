import LegalPage from "@/components/ui/LegalPage";
import { SITE } from "@/lib/site";

export const metadata = {
    title: "Privacy policy",
    description: "How Aamkahon collects, uses and protects your personal information.",
    alternates: { canonical: "/privacy" },
};

const SECTIONS = [
    {
        id: "what",
        title: "What we collect",
        body: [
            "We collect only what we need to take, deliver and support your order:",
            [
                "Your name, mobile number and email address.",
                "Your delivery address, district and upazila, or the courier branch you choose.",
                "Your order history, pre-bookings and any inquiries you send us.",
                "Your account password, stored only as a one way hash. We cannot read it.",
            ],
            "We do not collect card, bKash or Nagad details. Payments happen on the SSLCommerz page and those details never reach our servers.",
        ],
    },
    {
        id: "use",
        title: "How we use it",
        body: [
            [
                "To confirm, pack and deliver your order, and to call you about delivery.",
                "To tell you when a pre-booked variety is harvested and ready to ship.",
                "To answer price, wholesale and export inquiries.",
                "To send order emails such as verification codes and receipts.",
                "To keep the site secure, for example by limiting repeated login attempts.",
            ],
            "We do not sell or rent your information, and we do not send marketing messages unless you ask us to.",
        ],
    },
    {
        id: "sharing",
        title: "Who we share it with",
        body: [
            "Only with the people needed to complete your order:",
            [
                "Courier and delivery partners receive your name, phone and address.",
                "SSLCommerz processes your online payment under its own privacy policy.",
                "Our hosting and email providers store data on our behalf.",
            ],
            "We may share information if Bangladeshi law requires it.",
        ],
    },
    {
        id: "storage",
        title: "Cookies and local storage",
        body: [
            "We do not use advertising cookies. Your browser stores your shopping bag and your sign in session locally so they survive a refresh. Clearing your browser data removes them.",
        ],
    },
    {
        id: "keep",
        title: "How long we keep it",
        body: [
            "Order records are kept for as long as accounting and tax rules require. Inquiries are kept for up to two years. You can ask us to delete your account at any time; order records we must keep by law are retained but no longer linked to a login.",
        ],
    },
    {
        id: "rights",
        title: "Your choices",
        body: [
            "You can view and update your details from your account, ask for a copy of what we hold about you, or ask us to correct or delete it. Contact us using the details below and we will reply within seven working days.",
        ],
    },
    {
        id: "contact",
        title: "Contact",
        body: [`${SITE.legalName}, ${SITE.location}. Phone or WhatsApp ${SITE.phone}. Facebook: facebook.com/AAMKAHON.`],
    },
];

export default function PrivacyPage() {
    return (
        <LegalPage
            eyebrow="Legal"
            title="Privacy policy"
            updated="9 November 2026"
            intro="Aamkahon is a small family business. We treat your details the way we would want ours treated: we collect little, keep it safe, and use it only to get your order to you."
            sections={SECTIONS}
        />
    );
}
