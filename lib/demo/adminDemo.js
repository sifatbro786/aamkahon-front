// lib/demo/adminDemo.js
//
// Sample admin data for the static (Vercel) demo dashboard ONLY. Fictional
// customers and orders, built at runtime from the catalogue fixtures so
// products, prices and ids match the storefront. Never used in api mode.
import categories from "@/data/demo/categories.json";
import hero from "@/data/demo/hero.json";
import heroItems from "@/data/demo/hero-items.json";
import sectionsFx from "@/data/demo/homepage-sections.json";
import products from "@/data/demo/products.json";
import shippingRates from "@/data/demo/shipping-rates.json";

const DAY = 86_400_000;
const pid = (n) => `d3a0000000000000000000${String(n).padStart(2, "0")}`;
const bySlug = (slug) => products.find((p) => p.slug === slug);

const line = (slug, packIdx, qty) => {
    const p = bySlug(slug);
    const v = p.hasVariants ? p.variants[packIdx] : null;
    const retail = v ? v.price : p.price;
    const ws = p.wholesale?.enabled && qty >= p.wholesale.minQty ? (v ? v.wholesalePrice : p.wholesale.price) : null;
    const price = ws && ws < retail ? ws : retail;
    return {
        name: v ? `${p.name} (${v.options.map((o) => o.value).join(" / ")})` : p.name,
        product: p._id,
        quantity: qty,
        price,
        retailPrice: retail,
        wholesaleApplied: price < retail,
        unit: p.unit,
        weightKg: Math.round((v?.weight || p.weight || 1) * qty * 100) / 100,
        image: p.imageGroups?.[0]?.images?.[0]?.url,
        variant: v ? { options: v.options, displayName: v.options.map((o) => o.value).join(" / ") } : undefined,
    };
};

// [daysAgo, name, phone, district, upazila, status, payment, type, lines]
const SAMPLE = [
    [0, "Nusrat Jahan", "01711000101", "Dhaka", "Dhanmondi", "Pre-booked", "SSLCommerz", "pre_order", [["gopalbhog-mango", 0, 2]]],
    [0, "Rafiqul Islam", "01812000202", "Chattogram", "Panchlaish", "Pending", "COD", "regular", [["khejurer-patali-gur", 0, 3]]],
    [1, "Shahana Akter", "01913000303", "Dhaka", "Gulshan", "Pre-booked", "SSLCommerz", "pre_order", [["khirsapat-mango", 1, 6]]],
    [1, "Mehedi Hasan", "01614000404", "Rajshahi", "Boalia", "Confirmed", "COD", "regular", [["khejurer-jhola-gur", 1, 2], ["premium-gawa-ghee", 0, 1]]],
    [2, "Tanvir Ahmed", "01515000505", "Sylhet", "Sylhet Sadar", "Shipped", "SSLCommerz", "regular", [["nolen-gur-premium", -1, 12]]],
    [3, "Farhana Rahman", "01716000606", "Dhaka", "Mirpur", "Delivered", "COD", "regular", [["khejurer-patali-gur", 1, 2]]],
    [4, "Sweet Corner Bakery", "01817000707", "Khulna", "Khulna Sadar", "Pre-booked", "SSLCommerz", "pre_order", [["surma-fazli-mango", 1, 10]]],
    [5, "Arif Chowdhury", "01918000808", "Dhaka", "Uttara", "Delivered", "SSLCommerz", "regular", [["premium-gawa-ghee", 1, 2]]],
    [6, "Sadia Islam", "01619000909", "Gazipur", "Tongi", "Delivered", "COD", "regular", [["khejurer-jhola-gur", 0, 4]]],
    [6, "Kamal Uddin", "01520001010", "Bogura", "Bogura Sadar", "Cancelled", "COD", "regular", [["khejurer-patali-gur", 2, 1]]],
];

let cache = null;
function build() {
    if (cache) return cache;
    const now = Date.now();
    const orders = SAMPLE.map(([ago, name, phone, district, upazila, status, method, type, items], i) => {
        const orderItems = items.map(([slug, idx, q]) => line(slug, Math.max(0, idx), q));
        const sub = orderItems.reduce((s, l) => s + l.price * l.quantity, 0);
        const kg = orderItems.reduce((s, l) => s + l.weightKg, 0);
        const inDhaka = district === "Dhaka";
        const ship = (inDhaka ? 120 : 160) + Math.ceil(Math.max(0, kg - 5)) * (inDhaka ? 15 : 18);
        const cod = method === "COD" && type === "regular" ? Math.round(sub * 0.01) : 0;
        const total = sub + ship + cod;
        const advance = type === "pre_order" ? Math.ceil(sub * 0.25) : method === "COD" ? ship + cod : 0;
        const created = new Date(now - ago * DAY - i * 3_600_000).toISOString();
        const date = new Date(created);
        const p = bySlug(items[0][0]);
        return {
            _id: pid(i + 1),
            orderNumber: `ORD${date.toISOString().slice(2, 10).replace(/-/g, "")}${String(i + 1).padStart(4, "0")}`,
            createdAt: created,
            updatedAt: created,
            isGuest: i % 3 === 0,
            shippingAddress: {
                name,
                phone,
                email: `${name.split(" ")[0].toLowerCase()}@example.com`,
                district,
                upazila,
                addressLine1: "House 12, Road 4",
                country: "Bangladesh",
                locationType: inDhaka ? "dhaka_inside" : "outside_dhaka",
                deliveryType: inDhaka ? "Home Delivery" : "Courier",
                courierBranch: inDhaka ? undefined : `${district} Sadar branch`,
            },
            orderItems,
            paymentMethod: method,
            paymentStatus: status === "Cancelled" ? "Failed" : status === "Delivered" || (method === "SSLCommerz" && type === "regular") ? "Paid" : "Pending",
            orderStatus: status,
            orderType: type,
            preOrder: type === "pre_order" ? { expectedDate: p.preOrder?.expectedDate } : undefined,
            totalWeightKg: Math.round(kg * 100) / 100,
            shippingPrice: ship,
            taxPrice: 0,
            discountAmount: 0,
            codCharge: cod,
            codOnlinePaymentAmount: advance,
            remainingAmount: advance ? total - advance : 0,
            totalPrice: total,
            shippingBreakdown: { flatCharge: inDhaka ? 120 : 160, totalWeightKg: kg, totalShipping: ship },
            statusHistory: [{ status: "Pending", note: "Order placed", updatedAt: created }, ...(status !== "Pending" ? [{ status, note: `Order ${status.toLowerCase()}`, updatedAt: created }] : [])],
            adminNotes: [],
        };
    });

    const inquiries = [
        ["Agora Supershop (procurement)", "01722000111", "wholesale", "export-grade-khirsapat", 2000, "Need Khirsapat for 12 outlets, weekly delivery in June. Please quote per kg delivered Dhaka.", "new", 0],
        ["Hasib Mahmud", "01833000222", "pre_booking", "gourmoti-mango", 4, "Please call me when Gourmoti price is announced.", "new", 1],
        ["Dubai importer (via WhatsApp)", "01944000333", "price", "export-grade-khirsapat", 5000, "Air freight to Dubai, hot water treated. Need phytosanitary certificate.", "contacted", 2],
        ["Rumana Begum", "01655000444", "general", null, null, "Do you deliver to Cox's Bazar? How many days?", "closed", 4],
        ["Mishti Mukh Sweets", "01566000555", "wholesale", "nolen-gur-premium", 60, "Monthly nolen gur for our sweet shop, December to January.", "quoted", 5],
    ].map(([name, phone, type, slug, qty, message, status, ago], i) => {
        const p = slug ? bySlug(slug) : null;
        const at = new Date(now - ago * DAY - i * 5_400_000).toISOString();
        return {
            _id: pid(40 + i),
            name,
            phone,
            type,
            product: p ? { _id: p._id, name: p.name, slug: p.slug } : null,
            productName: p?.name,
            unit: p?.unit,
            quantity: qty,
            message,
            status,
            quotedPrice: status === "quoted" ? 640 : null,
            adminNotes: status === "contacted" ? [{ note: "Called, sending export spec sheet.", addedAt: at, addedBy: { name: "Demo Admin" } }] : [],
            createdAt: at,
        };
    });

    const users = [
        ["Demo Admin", "demo@aamkahon.com", "admin"],
        ["Nusrat Jahan", "nusrat@example.com", "user"],
        ["Shahana Akter", "shahana@example.com", "user"],
        ["Mehedi Hasan", "mehedi@example.com", "user"],
        ["Arif Chowdhury", "arif@example.com", "user"],
    ].map(([name, email, role], i) => ({ _id: pid(60 + i), name, email, role, isEmailVerified: true, status: "active", createdAt: new Date(now - (30 + i * 9) * DAY).toISOString() }));

    // Customer book: built from the demo orders and inquiries plus a few
    // "imported" rows, the same way the backend fills it.
    const seen = new Set();
    const customers = [];
    const addCustomer = (c) => {
        if (seen.has(c.phone)) return;
        seen.add(c.phone);
        customers.push({ _id: pid(100 + customers.length), tags: [], marketingOptIn: true, ordersPlaced: 0, ...c });
    };
    orders.forEach((o) =>
        addCustomer({ name: o.shippingAddress.name, phone: o.shippingAddress.phone, district: o.shippingAddress.district, source: "order", ordersPlaced: 1, lastOrderAt: o.createdAt, createdAt: o.createdAt }),
    );
    inquiries.forEach((q) => addCustomer({ name: q.name, phone: q.phone, source: "inquiry", tags: q.type === "wholesale" ? ["wholesale"] : [], createdAt: q.createdAt }));
    [
        ["Abdul Karim", "01711222333", "Dhaka", ["mango-2025", "office"]],
        ["Farzana Haque", "01811444555", "Chattogram", ["mango-2025"]],
        ["Tanvir Alam", "01911666777", "Sylhet", ["gur-2025"]],
        ["Shirin Akter", "01611888999", "Khulna", ["mango-2025", "gur-2025"]],
    ].forEach(([name, phone, district, tags], i) =>
        addCustomer({ name, phone, district, tags, source: "import", importBatch: "old-customers.csv", createdAt: new Date(now - (60 + i) * DAY).toISOString() }),
    );
    customers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    cache = { orders, inquiries, users, customers };
    return cache;
}

const catsWithChildren = () => {
    const all = categories.data.map((c) => ({ ...c, children: [] }));
    const byId = new Map(all.map((c) => [c._id, c]));
    const roots = [];
    for (const c of all) {
        const parentId = c.parentCategory?._id;
        if (parentId && byId.has(parentId)) byId.get(parentId).children.push(c);
        else roots.push(c);
    }
    return roots;
};

const paginate = (rows, params, key, pagesKey = "totalPages") => {
    const page = Math.max(1, parseInt(params.page, 10) || 1);
    const limit = Math.max(1, parseInt(params.limit, 10) || 10);
    return { success: true, [key]: rows.slice((page - 1) * limit, page * limit), total: rows.length, [pagesKey]: Math.max(1, Math.ceil(rows.length / limit)), currentPage: page, count: rows.length };
};

/** GET handler for /admin/* and admin-only reads. Returns data or null. */
export function adminGet(path, params = {}) {
    const { orders, inquiries, users, customers } = build();

    if (path === "/admin/analytics/dashboard") {
        const live = orders.filter((o) => o.orderStatus !== "Cancelled");
        const byDay = new Map();
        for (const o of live) {
            const k = o.createdAt.slice(0, 10);
            const d = byDay.get(k) || { _id: k, dailySales: 0, orderCount: 0 };
            d.dailySales += o.totalPrice;
            d.orderCount += 1;
            byDay.set(k, d);
        }
        const top = new Map();
        for (const o of live)
            for (const l of o.orderItems) {
                const t = top.get(l.product) || { _id: l.product, productName: l.name.replace(/ \(.*\)$/, ""), totalSold: 0, totalRevenue: 0 };
                t.totalSold += l.quantity;
                t.totalRevenue += l.price * l.quantity;
                top.set(l.product, t);
            }
        const pay = ["COD", "SSLCommerz"].map((m) => ({ _id: m, count: orders.filter((o) => o.paymentMethod === m).length, totalAmount: orders.filter((o) => o.paymentMethod === m).reduce((s, o) => s + o.totalPrice, 0) }));
        const mangoSales = live.filter((o) => o.orderType === "pre_order").reduce((s, o) => s + o.totalPrice, 0);
        const otherSales = live.filter((o) => o.orderType !== "pre_order").reduce((s, o) => s + o.totalPrice, 0);
        return {
            success: true,
            data: {
                overview: {
                    totalOrders: orders.length,
                    pendingOrders: orders.filter((o) => o.orderStatus === "Pending").length,
                    deliveredOrders: orders.filter((o) => o.orderStatus === "Delivered").length,
                    totalProducts: products.length,
                    totalUsers: users.length,
                    totalRevenue: orders.filter((o) => o.orderStatus === "Delivered").reduce((s, o) => s + o.totalPrice, 0),
                },
                categorySales: [
                    { _id: "mango", categoryName: "Mango", totalSales: mangoSales, totalItems: 18, orderCount: 3 },
                    { _id: "gur", categoryName: "Khejurer Gur", totalSales: otherSales * 0.8, totalItems: 22, orderCount: 5 },
                    { _id: "pantry", categoryName: "Farm Pantry", totalSales: otherSales * 0.2, totalItems: 3, orderCount: 2 },
                ],
                topProducts: [...top.values()].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5),
                salesTrend: [...byDay.values()],
                paymentMethods: pay,
                period: params.period || "month",
            },
        };
    }
    if (path === "/admin/orders/stats") {
        return {
            success: true,
            stats: {
                totalOrders: orders.length,
                pendingOrders: orders.filter((o) => o.orderStatus === "Pending").length,
                deliveredOrders: orders.filter((o) => o.orderStatus === "Delivered").length,
                preBookedOrders: orders.filter((o) => o.orderStatus === "Pre-booked").length,
                totalRevenue: orders.filter((o) => o.orderStatus === "Delivered").reduce((s, o) => s + o.totalPrice, 0),
            },
        };
    }
    if (path === "/admin/orders") {
        let rows = orders;
        if (params.status && params.status !== "all") rows = rows.filter((o) => o.orderStatus === params.status);
        if (params.orderType) rows = rows.filter((o) => o.orderType === params.orderType);
        if (params.paymentMethod && params.paymentMethod !== "all") rows = rows.filter((o) => o.paymentMethod === params.paymentMethod);
        if (params.search) {
            const q = String(params.search).toLowerCase();
            rows = rows.filter((o) => `${o.orderNumber} ${o.shippingAddress.name} ${o.shippingAddress.phone}`.toLowerCase().includes(q));
        }
        return paginate(rows, params, "orders", "pages");
    }
    if (path.startsWith("/admin/orders/")) {
        const order = orders.find((o) => o._id === path.split("/")[3] || o.orderNumber === path.split("/")[3]);
        return order ? { success: true, order } : null;
    }
    if (path === "/admin/inquiries") {
        let rows = inquiries;
        if (params.status) rows = rows.filter((r) => r.status === params.status);
        const counts = {};
        inquiries.forEach((r) => (counts[r.status] = (counts[r.status] || 0) + 1));
        return { ...paginate(rows, params, "inquiries"), statusCounts: counts };
    }
    if (path === "/admin/customers") {
        let rows = customers;
        if (params.source) rows = rows.filter((c) => c.source === params.source);
        if (params.tag) rows = rows.filter((c) => c.tags.includes(params.tag));
        if (params.search) {
            const q = String(params.search).toLowerCase();
            rows = rows.filter((c) => `${c.name} ${c.phone} ${c.district || ""}`.toLowerCase().includes(q));
        }
        const counts = {};
        customers.forEach((c) => (counts[c.source] = (counts[c.source] || 0) + 1));
        return { ...paginate(rows, params, "customers"), tags: [...new Set(customers.flatMap((c) => c.tags))].sort(), sourceCounts: counts };
    }
    if (path === "/admin/products/dashboard" || path === "/admin/products/search") {
        let rows = products;
        if (params.search || params.q) {
            const q = String(params.search || params.q).toLowerCase();
            rows = rows.filter((p) => p.name.toLowerCase().includes(q));
        }
        return paginate(rows, { ...params, limit: params.limit || 20 }, "products");
    }
    if (path === "/admin/products/low-stock") {
        const rows = products
            .filter((p) => p.availability === "in_stock")
            .map((p) => ({ ...p, effectiveStock: p.hasVariants ? p.variants.reduce((n, v) => n + v.stock, 0) : p.stock, threshold: p.lowStockAlert }))
            .filter((p) => p.effectiveStock <= 60);
        return { success: true, count: rows.length, products: rows };
    }
    if (path === "/admin/users") return paginate(users, params, "users", "pages");
    if (path === "/categories/tree") return { success: true, count: categories.data.length, data: catsWithChildren() };
    if (path === "/admin/shipping/rates") return { success: true, rates: shippingRates.rates.map((r, i) => ({ _id: pid(80 + i), codChargeType: "percentage", codChargeValue: 1, isActive: true, ...r })) };
    if (path === "/admin/hero-content") return hero.items.map((h) => ({ ...h, isActive: true }));
    if (path === "/admin/hero-items") return heroItems;
    if (path === "/admin/products/sections") return { ...paginate(sectionsFx.sections, params, "sections"), sections: sectionsFx.sections.map(({ products: _p, ...s }) => s) };
    return null;
}

/** Well formed empty answer for admin lists the demo has no sample data for. */
export const adminEmpty = () => ({
    success: true,
    data: [],
    products: [],
    orders: [],
    users: [],
    customers: [],
    tags: [],
    coupons: [],
    campaigns: [],
    reviews: [],
    sections: [],
    rates: [],
    districts: [],
    branches: [],
    offers: [],
    pageMetas: [],
    aplusContents: [],
    carts: [],
    items: [],
    total: 0,
    count: 0,
    pages: 1,
    totalPages: 1,
    currentPage: 1,
    pagination: { page: 1, pages: 1, total: 0 },
    stats: {},
});
