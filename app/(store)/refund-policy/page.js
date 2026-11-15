import { notFound } from "next/navigation";

import LegalPage, { policyMetadata } from "@/components/ui/LegalPage";
import { getPolicyPage } from "@/lib/data/catalog";

// Content: Admin > Policy Pages (GET /api/pages/refund), bundled copy as fallback.
export async function generateMetadata() {
    return policyMetadata(await getPolicyPage("refund"), "/refund-policy");
}

export default async function Page() {
    const page = await getPolicyPage("refund");
    if (!page) notFound();
    return <LegalPage page={page} />;
}
