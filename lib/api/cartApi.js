import api from "./client";

// Server cart (signed in only; Cart.user is required + unique).
//   get    -> { success, cart, ... }    add -> { success, message, cart }
//   update -> { success, cart }         remove -> { success, cart }
//   merge  -> { success, cart, merged, skipped: [{ productId, reason, message? }] }
// update/remove address a line by cart.items[]._id. Nothing price related is
// sent; the server prices from the product (wholesale tier included).
export const cartApi = {
    get: () => api.get("/cart"),
    add: ({ productId, quantity, variant }) => api.post("/cart", { productId, quantity, variant }),
    updateItem: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }),
    removeItem: (itemId) => api.delete(`/cart/${itemId}`),
    merge: (items) => api.post("/cart/merge", { items }),
};
