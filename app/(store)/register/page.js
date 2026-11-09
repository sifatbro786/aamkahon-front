import { Suspense } from "react";

import AuthShell from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/AuthForms";

export const metadata = { title: "Create an account", robots: { index: false } };

export default function Page() {
    return (
        <AuthShell title="Create an account" intro="Keep your orders and pre-bookings in one place.">
            <Suspense fallback={null}>
                <RegisterForm />
            </Suspense>
        </AuthShell>
    );
}
