import axiosInstance from "./axiosInstance";

// /api/admin/inquiries (protect + admin)
//   list   -> { success, inquiries, total, totalPages, currentPage, statusCounts }
//   update -> { success, inquiry }   body { status?, quotedPrice?, note? }
export const inquiryAdminApi = {
    list: (params) => axiosInstance.get("/admin/inquiries", { params }),
    update: (id, payload) => axiosInstance.patch(`/admin/inquiries/${id}`, payload),
    remove: (id) => axiosInstance.delete(`/admin/inquiries/${id}`),
};
