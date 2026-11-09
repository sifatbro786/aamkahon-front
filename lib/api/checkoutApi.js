import api from "./client";

// THE rule: nothing price related is ever sent. createOrder reprices every
// line from the DB (services/lineItemPricing.js) and recomputes shipping, COD,
// advance and tax. calculate exists so the UI can DISPLAY those numbers.
export const checkoutApi = {
    // -> { success, rates: [{ locationType, deliveryType, baseCharge, baseWeightKg, perKgCharge, ... }], lowestFreeShippingThreshold }
    getShippingRates: () => api.get("/checkout/shipping-rates"),
    // -> { success, districts: [name] }
    getDistricts: () => api.get("/checkout/districts"),
    // -> { success, upazilas: [{ name, shippingZone }] }
    getUpazilas: (district) => api.get(`/checkout/upazilas/${encodeURIComponent(district)}`),
    // -> { success, branches: [name] }
    getCourierBranches: (district) => api.get(`/checkout/courier-branches/${encodeURIComponent(district)}`),
    // -> { success, locationType, shippingZone, availableDeliveryTypes }
    validateLocation: ({ district, upazila }) => api.post("/checkout/validate-location", { district, upazila }),
    // -> { success, data: { itemsSubtotal, discountAmount, shippingPrice, taxPrice, codCharge,
    //      codOnlinePaymentAmount, advanceAmount, remainingAmount, finalTotal, isPreOrder,
    //      expectedDate, totalWeightKg, lines[], shippingBreakdown, couponMessage, ... } }
    calculate: (payload) => api.post("/checkout/calculate", payload),
    // -> 201 { success, order, guestAccessToken?, redirectUrl, ... }  redirectUrl for COD too.
    createOrder: (payload) => api.post("/orders", payload),
    // Guests present the capability token as a header (stays out of logs/referrers).
    getOrder: (id, token) =>
        api.get(`/orders/${encodeURIComponent(id)}`, { headers: token ? { "x-order-token": token } : undefined }),
    // POST, so the phone number never lands in a URL. -> { success, order }
    trackOrder: ({ orderNumber, phone }) => api.post("/orders/track", { orderNumber, phone }),
};

// GET /api/orders (signed in) -> { success, count, orders }
export const myOrders = () => api.get("/orders");
