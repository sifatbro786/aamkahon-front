import axiosInstance from "./axiosInstance";

// /api/admin/stock (protect + admin)
//   list      -> { success, items:[{_id,name,nameBn,unit,image,availability,priceVisibility,price,
//                 minOrderQty,lowStockAlert,hasVariants,stock,variants:[{options,label,sku,stock,price}]}],
//                 total, totalPages, currentPage, summary:{products,lowStock,outOfStock} }
//   adjust    -> { success, before, after, movement }  body { productId, options?, mode: in|out|set, quantity, type, note? }
//   movements -> { success, movements, total, totalPages, currentPage }
export const stockApi = {
    list: (params) => axiosInstance.get("/admin/stock", { params }),
    adjust: (payload) => axiosInstance.post("/admin/stock/adjust", payload),
    movements: (params) => axiosInstance.get("/admin/stock/movements", { params }),
};
