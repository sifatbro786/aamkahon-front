import { Suspense } from "react";

import AuthShell from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/AuthForms";

// Store team sign in (admin and staff). Not linked from the storefront:
// customers have no accounts, they order as guests and track by order number.
export const metadata = { title: "Team sign in", robots: { index: false, follow: false } };

export default function Page() {
    return (
        <AuthShell title="Team sign in" intro="For the Aamkahon team. Customers do not need an account: order as a guest and track your order with its number and your phone.">
            <Suspense fallback={null}>
                <LoginForm />
            </Suspense>
        </AuthShell>
    );
}
