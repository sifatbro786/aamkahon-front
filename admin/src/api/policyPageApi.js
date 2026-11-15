import axiosInstance from "./axiosInstance";

// /api/admin/pages (admin only)
//   list -> { success, pages: [{ slug, title, metaDescription, intro, sections:[{_id,title,body}], isPublished, updatedAt, updatedBy:{name} }], slugs }
//   save -> PUT /:slug { title, metaDescription?, intro?, sections?, isPublished? } -> { success, page }
export const policyPageApi = {
    list: () => axiosInstance.get("/admin/pages"),
    save: (slug, payload) => axiosInstance.put(`/admin/pages/${slug}`, payload),
};
