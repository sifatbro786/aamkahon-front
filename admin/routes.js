// Admin route table (from footpath-frontend/src/router/AppRoute.jsx).
// Order matters: literal segments before :params.
import { lazy } from "react";

const p = (loader) => lazy(loader);

export const ADMIN_ROUTES = [
    ["", p(() => import("./src/pages/admin/dashboard/AdminDashboardPage.jsx"))],
    ["sales-report", p(() => import("./src/pages/admin/analytics/SalesReportPage.jsx"))],
    ["categories", p(() => import("./src/pages/admin/category/CategoriesManagement.jsx"))],
    ["categories/new", p(() => import("./src/pages/admin/category/CategoryForm.jsx"))],
    ["categories/:id/edit", p(() => import("./src/pages/admin/category/CategoryForm.jsx"))],
    ["products", p(() => import("./src/pages/admin/products/ProductManagement.jsx"))],
    ["products/new", p(() => import("./src/pages/admin/products/ProductForm.jsx"))],
    ["products/:id/edit", p(() => import("./src/pages/admin/products/ProductForm.jsx"))],
    ["products/:id", p(() => import("./src/pages/admin/products/ProductView.jsx"))],
    ["orders", p(() => import("./src/pages/admin/orders/OrdersManagement.jsx"))],
    ["pre-bookings", p(() => import("./src/pages/admin/orders/PreBookings.jsx"))],
    ["orders/new", p(() => import("./src/pages/admin/orders/PhoneOrderForm.jsx"))],
    ["orders/:id/invoice", p(() => import("./src/pages/admin/orders/OrderInvoice.jsx"))],
    ["orders/:id", p(() => import("./src/pages/admin/orders/OrderDetail.jsx"))],
    ["inquiries", p(() => import("./src/pages/admin/inquiries/InquiriesManagement.jsx"))],
    ["customers", p(() => import("./src/pages/admin/customers/CustomersManagement.jsx"))],
    ["coupons", p(() => import("./src/pages/admin/coupons/CouponManagement.jsx"))],
    ["coupons/new", p(() => import("./src/pages/admin/coupons/CouponForm.jsx"))],
    ["coupons/:id/edit", p(() => import("./src/pages/admin/coupons/CouponForm.jsx"))],
    ["stock", p(() => import("./src/pages/admin/stock/StockManagement.jsx"))],
    ["shipping", p(() => import("./src/pages/admin/shipping/ShippingManagement.jsx"))],
    ["users", p(() => import("./src/pages/admin/users/UserManagement.jsx"))],
    ["reviews", p(() => import("./src/pages/admin/reviews/ReviewManagement.jsx"))],
    ["sections", p(() => import("./src/pages/admin/sections/SectionManagement.jsx"))],
    ["offers", p(() => import("./src/pages/admin/offers/OfferManagement.jsx"))],
    ["page-meta", p(() => import("./src/pages/admin/pageMeta/PageMetaManagement.jsx"))],
    ["navbar", p(() => import("./src/pages/admin/navbar/NavbarConfiguration.jsx"))],
    ["hero-content", p(() => import("./src/pages/admin/hero/HeroContentManagement.jsx"))],
];

/** Match "products/abc/edit" -> { Component, params: { id: "abc" } } */
export function matchAdminRoute(path) {
    const segs = path.split("/").filter(Boolean);
    for (const [pattern, Component] of ADMIN_ROUTES) {
        const ps = pattern.split("/").filter(Boolean);
        if (ps.length !== segs.length) continue;
        const params = {};
        const ok = ps.every((s, i) => {
            if (s.startsWith(":")) {
                params[s.slice(1)] = decodeURIComponent(segs[i]);
                return true;
            }
            return s === segs[i];
        });
        if (ok) return { Component, params };
    }
    return null;
}
