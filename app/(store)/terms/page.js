import { notFound } from "next/navigation";

import LegalPage, { policyMetadata } from "@/components/ui/LegalPage";
import { getPolicyPage } from "@/lib/data/catalog";

// Content: Admin > Policy Pages (GET /api/pages/terms), bundled copy as fallback.
export async function generateMetadata() {
    return policyMetadata(await getPolicyPage("terms"), "/terms");
}

export default async function Page() {
    const page = await getPolicyPage("terms");
    if (!page) notFound();
    return <LegalPage page={page} />;
}
