import { notFound } from "next/navigation";

import LegalPage, { policyMetadata } from "@/components/ui/LegalPage";
import { getPolicyPage } from "@/lib/data/catalog";

// Content: Admin > Policy Pages (GET /api/pages/privacy), bundled copy as fallback.
export async function generateMetadata() {
    return policyMetadata(await getPolicyPage("privacy"), "/privacy");
}

export default async function Page() {
    const page = await getPolicyPage("privacy");
    if (!page) notFound();
    return <LegalPage page={page} />;
}
