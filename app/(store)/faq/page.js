import FaqBlock from "@/components/home/FaqBlock";
import { getFaqs } from "@/lib/data/catalog";

export const metadata = {
    title: "Questions and answers",
    description: "Pre-booking, delivery charges, cash on delivery, wholesale and how Aamkahon mangoes and gur are made.",
    alternates: { canonical: "/faq" },
};

export default async function FaqPage() {
    const faqs = await getFaqs();
    return (
        <div className="py-16 md:py-24">
            {faqs.length ? (
                <FaqBlock faqs={faqs} full title="Questions and answers" />
            ) : (
                <div className="wrap">
                    <h1 className="text-display font-medium">Questions and answers</h1>
                    <p className="mt-4 text-ink/70">Nothing here yet. Call or WhatsApp us and we will help.</p>
                </div>
            )}
        </div>
    );
}
