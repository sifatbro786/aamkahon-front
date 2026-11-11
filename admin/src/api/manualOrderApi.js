import axiosInstance from "./axiosInstance";

// Phone orders (controllers/admin/manualOrderController.js). Totals are always
// computed server side: preview to show them, create to save.
//   preview -> { success, totals:{itemsSubtotal, discountAmount, shippingPrice, totalPrice,
//               paidAmount, dueAmount, totalWeightKg, paymentStatus, locationType, deliveryType}, lines, warnings }
//   create  -> 201 { success, order, warnings }
export const manualOrderApi = {
    preview: (payload) => axiosInstance.post("/admin/orders/manual/preview", payload),
    create: (payload) => axiosInstance.post("/admin/orders/manual", payload),
};
