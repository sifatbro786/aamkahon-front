"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";

export default function Providers({ children }) {
    // One client per browser session (useState so it survives re-renders but
    // is never shared between server requests).
    const [queryClient] = useState(
        () => new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: false, retry: 1 } } }),
    );
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <CartProvider>{children}</CartProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
}
