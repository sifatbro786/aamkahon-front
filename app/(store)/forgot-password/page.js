import { Suspense } from "react";

import AuthShell from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/AuthForms";

export const metadata = { title: "Reset your password", robots: { index: false } };

export default function Page() {
    return (
        <AuthShell title="Reset your password" intro="We will email you a 6 digit code.">
            <Suspense fallback={null}>
                <ForgotPasswordForm />
            </Suspense>
        </AuthShell>
    );
}
