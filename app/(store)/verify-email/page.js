import { Suspense } from "react";

import AuthShell from "@/components/auth/AuthShell";
import { VerifyEmailForm } from "@/components/auth/AuthForms";

export const metadata = { title: "Check your email", robots: { index: false } };

export default function Page() {
    return (
        <AuthShell title="Check your email">
            <Suspense fallback={null}>
                <VerifyEmailForm />
            </Suspense>
        </AuthShell>
    );
}
