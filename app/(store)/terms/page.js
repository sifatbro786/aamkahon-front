import LegalPage from "@/components/ui/LegalPage";
import { SITE } from "@/lib/site";

export const metadata = {
    title: "Terms and conditions",
    description: "Ordering, pre-booking, wholesale, delivery and refund terms for Aamkahon.",
    alternates: { canonical: "/terms" },
};

const SECTIONS = [
    {
        id: "orders",
        title: "Orders and prices",
        body: [
            "All prices are in Bangladeshi Taka. The price you pay is the one shown at checkout, which is calculated on our server from the live product price, any wholesale tier, your coupon and delivery charge.",
            "Some products show Price on request or Price TBA. Those cannot be ordered online; send us an inquiry and we will quote.",
            "We may cancel an order if a price or stock error is found, and refund anything you paid in full.",
        ],
    },
    {
        id: "wholesale",
        title: "Wholesale pricing",
        body: [
            "Where a product lists a wholesale price, it applies automatically when the quantity of that item reaches the stated minimum. Volumes above our listed tiers, including export grade orders, are quoted separately and confirmed in writing before payment.",
        ],
    },
    {
        id: "prebooking",
        title: "Pre-booking",
        body: [
            [
                "Pre-booking reserves fruit from the coming harvest at the listed price.",
                "You pay the advance shown at checkout online. The balance and delivery charge are paid on delivery.",
                "Harvest dates follow the Aamkahon mango calendar and may move by a few days with the weather. We call before dispatch.",
                "If you cancel more than 15 days before the expected harvest date, the advance is refunded in full. Later cancellations are refunded less any packing costs already incurred.",
                "If we cannot supply your variety because of crop failure, we refund the advance in full or offer another variety, your choice.",
            ],
        ],
    },
    {
        id: "payment",
        title: "Payment",
        body: [
            "Online payments are processed by SSLCommerz (cards, bKash, Nagad and others). For cash on delivery orders, the delivery charge and COD fee are paid online when you order and the product price is paid to the courier.",
        ],
    },
    {
        id: "delivery",
        title: "Delivery",
        body: [
            "Delivery is charged by weight and zone, shown at checkout before you pay. Please check the box in front of the delivery person where possible.",
        ],
    },
    {
        id: "returns",
        title: "Quality, returns and refunds",
        body: [
            "Mangoes and gur are fresh produce, so we cannot accept returns of opened products. If anything arrives damaged, rotten or short, tell us within 24 hours of delivery with photos of the box and fruit. We will replace the affected quantity or refund it.",
            "Refunds go back through the original payment method within 7 to 10 working days.",
        ],
    },
    {
        id: "accounts",
        title: "Accounts",
        body: ["Keep your password private. You are responsible for orders placed from your account. We may suspend accounts used for fraud or abuse."],
    },
    {
        id: "law",
        title: "Governing law",
        body: [`These terms are governed by the laws of Bangladesh. Questions: call ${SITE.phone}.`],
    },
];

export default function TermsPage() {
    return (
        <LegalPage
            eyebrow="Legal"
            title="Terms and conditions"
            updated="9 November 2026"
            intro="These terms cover buying from Aamkahon online, including retail, wholesale and pre-booking. Placing an order means you accept them."
            sections={SECTIONS}
        />
    );
}
