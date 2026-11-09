import api from "./client";

// Client-side product reads (search box, quick refreshes). Server components
// use lib/data/catalog.js instead.
export const productApi = {
    list: (params) => api.get("/products", { params }), // { success, products, total, totalPages, currentPage }
    bySlug: (slug) => api.get(`/products/slug/${encodeURIComponent(slug)}`), // { success, product }
    incrementView: (id) => api.put(`/products/${id}/view`),
};
