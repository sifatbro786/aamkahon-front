"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useSyncExternalStore } from "react";
import { Toaster } from "react-hot-toast";

import { OutletContext, ParamsContext } from "@/admin/router";
import { STAFF_HOME, STAFF_ROUTES, matchAdminRoute } from "@/admin/routes";
import AdminLayout from "@/admin/src/layouts/admin/AdminLayout.jsx";
import { useAuth } from "@/context/AuthContext";
import { IS_STATIC } from "@/lib/config";

const noop = () => () => {};

function Loading() {
    return (
        <div className="flex h-64 items-center justify-center">
            <span className="text-sm text-gray-500">Loading...</span>
        </div>
    );
}

/**
 * The admin SPA. Client only: the ported pages read localStorage during
 * render, so nothing here runs on the server. Role gate mirrors the base
 * PrivateRoute (admin and staff; staff see a smaller menu, see adminNavConfig).
 */
export default function AdminApp() {
    const isClient = useSyncExternalStore(noop, () => true, () => false);
    const { user, loading, isTeam, isAdmin } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const sub = pathname.replace(/^\/admin\/?/, "");
    const match = matchAdminRoute(sub);
    // Staff: only their pages. The dashboard (money figures) sends them to Orders.
    const staffBlocked = Boolean(user) && !isAdmin && match && !STAFF_ROUTES.has(match.pattern);

    useEffect(() => {
        if (!loading && isClient && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        else if (!loading && user && !isTeam) router.replace("/");
        else if (!loading && user && staffBlocked && match.pattern === "") router.replace(STAFF_HOME);
    }, [loading, isClient, user, isTeam, staffBlocked, match, pathname, router]);

    if (!isClient || loading || !user || !isTeam) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <span className="text-sm text-gray-500">Loading...</span>
            </div>
        );
    }

    const page = staffBlocked ? (
        <div className="rounded-lg border border-gray-200 bg-white p-10 text-center">
            <p className="font-semibold text-gray-900">Only the store admin can open this page</p>
            <Link href={STAFF_HOME} className="mt-3 inline-block text-sm text-gray-600 underline">
                Go to orders
            </Link>
        </div>
    ) : match ? (
        <ParamsContext.Provider value={match.params}>
            <Suspense fallback={<Loading />}>
                <match.Component />
            </Suspense>
        </ParamsContext.Provider>
    ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-10 text-center">
            <p className="font-semibold text-gray-900">Page not found</p>
            <Link href="/admin" className="mt-3 inline-block text-sm text-gray-600 underline">
                Back to dashboard
            </Link>
        </div>
    );

    return (
        <div className="admin-root flex h-dvh flex-col">
            {IS_STATIC && (
                <div className="bg-mango px-4 py-1.5 text-center text-[13px] text-ink">
                    Demo dashboard with sample data. Changes are disabled on this site.
                </div>
            )}
            <OutletContext.Provider value={page}>
                <AdminLayout />
            </OutletContext.Provider>
            <Toaster position="top-right" />
        </div>
    );
}
