import { Suspense } from "react";

import AuthShell from "@/components/auth/AuthShell";
import { ResetPasswordForm } from "@/components/auth/AuthForms";

export const metadata = { title: "Set a new password", robots: { index: false } };

export default function Page() {
    return (
        <AuthShell title="Set a new password">
            <Suspense fallback={null}>
                <ResetPasswordForm />
            </Suspense>
        </AuthShell>
    );
}
