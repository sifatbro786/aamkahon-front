import { Suspense } from "react";

import OrderProblem from "@/components/order/OrderProblem";

export const metadata = { title: "Payment failed", robots: { index: false } };

export default function Page() {
    return (
        <Suspense fallback={<div className="wrap py-20" />}>
            <OrderProblem kind="fail" />
        </Suspense>
    );
}
