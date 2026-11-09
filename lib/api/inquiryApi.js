import api from "./client";

// POST /api/inquiries (rate limited 5 / 15 min per IP)
// body { type?, productId?, variantLabel?, quantity?, name, phone, email?, district?, message? }
// -> 201 { success, message, inquiry: { _id, type, createdAt } }
export const inquiryApi = {
    create: (payload) => api.post("/inquiries", payload),
};
