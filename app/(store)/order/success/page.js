import { Suspense } from "react";

import OrderSuccess from "@/components/order/OrderSuccess";

export const metadata = { title: "Order confirmed", robots: { index: false } };

export default function Page() {
    return (
        <Suspense fallback={<div className="wrap py-20" />}>
            <OrderSuccess />
        </Suspense>
    );
}
