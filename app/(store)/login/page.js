import { Suspense } from "react";

import AuthShell from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/AuthForms";

export const metadata = { title: "Sign in", robots: { index: false } };

export default function Page() {
    return (
        <AuthShell title="Sign in" intro="Track orders, reorder faster and keep your addresses.">
            <Suspense fallback={null}>
                <LoginForm />
            </Suspense>
        </AuthShell>
    );
}
