// src/layouts/admin/adminNavConfig.js
import {
    LayoutDashboard,
    Package,
    FolderTree,
    ShoppingCart,
    Ticket,
    Megaphone,
    FileText,
    ListTree,
    Users,
    ShoppingBag,
    Star,
    Truck,
    LayoutGrid,
    // Aliased: a bare `Image` import shadows the global Image constructor.
    Image as ImageIcon,
    PanelTop,
    TrendingUp,
    CalendarClock,
    Inbox,
    Contact,
    Boxes,
    SunSnow,
    UserRound,
    HelpCircle,
} from "lucide-react";

// Each `path` maps 1:1 to a backend admin route module (see server.js mounts):
// productAdminRoutes, categoryAdminRoutes, adminOrderRoutes, couponAdminRoutes,
// productCampaignAdminRoutes, promotionAdminRoutes, heroAdminRoutes,
// heroContentAdminRoutes, offerPopupAdminRoutes, aplusContentAdminRoutes,
// pageMetaAdminRoutes, navbarAdminRoutes, adminRoutes (users), adminCartRoutes,
// reviewAdminRoutes, adminShippingRoutes.
// Aamkahon: A+ Content, product Campaigns, Cart Campaigns and Hero Slides are
// hidden (nav AND routes in admin/routes.js). The pages are kept in admin/src,
// so re-enabling one for a client is a two line change.
export const adminNavGroups = [
    {
        label: "Overview",
        items: [
            { label: "Dashboard", path: "/admin", icon: LayoutDashboard, end: true },
            // Phase 9: /api/admin/analytics/sales-report existed from the start
            // and had no UI calling it.
            { label: "Sales Report", path: "/admin/sales-report", icon: TrendingUp, built: true },
        ],
    },
    {
        label: "Catalog",
        items: [
            { label: "Orders", path: "/admin/orders", icon: ShoppingCart, built: true },
            // Aamkahon
            { label: "Pre-bookings", path: "/admin/pre-bookings", icon: CalendarClock, built: true },
            { label: "Inquiries", path: "/admin/inquiries", icon: Inbox, built: true },
            { label: "Categories", path: "/admin/categories", icon: FolderTree, built: true },
            { label: "Products", path: "/admin/products", icon: Package, built: true },
            // Aamkahon: levels, stock in/out/count, ledger history.
            { label: "Stock", path: "/admin/stock", icon: Boxes, built: true },
            { label: "Shipping", path: "/admin/shipping", icon: Truck, built: true },
        ],
    },
    {
        label: "Marketing",
        items: [
            { label: "Coupons", path: "/admin/coupons", icon: Ticket, built: true },
            // Controls the storefront popup: copy, image, button, date window,
            // priority, and how often it reappears (once / daily / always).
            { label: "Offer Popups", path: "/admin/offers", icon: FileText, built: true },
        ],
    },
    {
        label: "Storefront Content",
        items: [
            // Aamkahon: season switch + per-season homepage copy and blocks.
            { label: "Homepage & Season", path: "/admin/season", icon: SunSnow, built: true },
            { label: "Navbar", path: "/admin/navbar", icon: ListTree, built: true },
            { label: "Homepage Hero", path: "/admin/hero-content", icon: PanelTop, built: true },
            { label: "Product Sections", path: "/admin/sections", icon: LayoutGrid, built: true },
            { label: "Our Story", path: "/admin/our-story", icon: UserRound, built: true },
            { label: "FAQ", path: "/admin/faq", icon: HelpCircle, built: true },
            { label: "Page Meta / SEO", path: "/admin/page-meta", icon: ListTree, built: true },
        ],
    },
    {
        label: "Customers",
        items: [
            // Aamkahon: lead book (CSV import, manual, auto from orders/inquiries).
            { label: "Customer List", path: "/admin/customers", icon: Contact, built: true },
            { label: "Users", path: "/admin/users", icon: Users, built: true },
            { label: "Reviews", path: "/admin/reviews", icon: Star, built: true },
        ],
    },
];

// Flat list — used by AppRoute.jsx to generate placeholder routes and by
// AdminLayout to resolve the current page title for the topbar.
export const adminNavFlat = adminNavGroups.flatMap((g) => g.items);
