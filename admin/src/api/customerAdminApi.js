import axiosInstance from "./axiosInstance";

// /api/admin/customers (protect + admin)
//   list   -> { success, customers, total, totalPages, currentPage, tags, sourceCounts }
//   create -> 201 { success, customer } | 409 { success:false, message, customer }
//   update -> { success, customer }
//   import -> { success, batch, received, inserted, updated, unchanged, invalid, duplicatesInFile, errors:[{row, phone, reason}] }
//   export -> text/csv (opted-out numbers excluded unless optIn is passed)
export const customerAdminApi = {
    list: (params) => axiosInstance.get("/admin/customers", { params }),
    create: (payload) => axiosInstance.post("/admin/customers", payload),
    update: (id, payload) => axiosInstance.patch(`/admin/customers/${id}`, payload),
    remove: (id) => axiosInstance.delete(`/admin/customers/${id}`),
    importRows: (payload) => axiosInstance.post("/admin/customers/import", payload),
    exportCsv: (params) => axiosInstance.get("/admin/customers/export", { params, responseType: "blob" }),
};
