import { Suspense } from "react";

import AdminApp from "@/admin/AdminApp";

export const metadata = { title: "Admin", robots: { index: false, follow: false } };

// One catch-all route hosts the whole admin SPA (see admin/router.js).
export async function generateStaticParams() {
    return [{ slug: [] }];
}

export default function AdminPage() {
    return (
        <Suspense fallback={null}>
            <AdminApp />
        </Suspense>
    );
}
