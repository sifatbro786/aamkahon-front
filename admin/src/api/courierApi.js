import axiosInstance from "./axiosInstance";

// /api/admin/couriers (list: admin + staff; writes: admin)
//   list   -> { success, couriers: [{ _id, key, name, codAllowed, isDefault, note, trackingUrl, isActive, sortOrder }], usage: { [key]: productCount } }
//   create -> 201 { success, courier } | 409 duplicate key
//   update -> { success, courier }   (key cannot change)
//   remove -> { success } | 409 while products use it
// /api/admin/orders/:id/courier  PATCH { courier: key | "" } -> { success, order: { _id, courier } }
export const courierApi = {
    list: () => axiosInstance.get("/admin/couriers"),
    create: (payload) => axiosInstance.post("/admin/couriers", payload),
    update: (id, payload) => axiosInstance.put(`/admin/couriers/${id}`, payload),
    remove: (id) => axiosInstance.delete(`/admin/couriers/${id}`),
    setOrderCourier: (orderId, courier) => axiosInstance.patch(`/admin/orders/${orderId}/courier`, { courier }),
};

/** Shared hook-free loader: key -> courier doc map, for labels. */
export const courierLabel = (couriers, key) => couriers.find((c) => c.key === key)?.name || key || "";
