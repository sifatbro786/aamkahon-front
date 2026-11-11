import axiosInstance from "./axiosInstance";

// /api/admin/storefront (settings singleton) and /api/admin/faqs
//   get    -> { success, settings: { activeSeason, seasons: {mango,winter,all}, story } }
//   save   -> { success, settings }  body: any subset of { activeSeason, seasons, story }
//   faqs   -> { success, faqs }, create -> 201 { success, faq }, update -> { success, faq }
export const storefrontApi = {
    get: () => axiosInstance.get("/admin/storefront"),
    save: (payload) => axiosInstance.put("/admin/storefront", payload),
    listFaqs: () => axiosInstance.get("/admin/faqs"),
    createFaq: (payload) => axiosInstance.post("/admin/faqs", payload),
    updateFaq: (id, payload) => axiosInstance.put(`/admin/faqs/${id}`, payload),
    reorderFaqs: (ids) => axiosInstance.put("/admin/faqs/reorder", { ids }),
    deleteFaq: (id) => axiosInstance.delete(`/admin/faqs/${id}`),
};
