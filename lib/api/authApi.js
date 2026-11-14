import api from "./client";

// Maps 1:1 to amkahon-back routes/authRoutes.js (team sign in only; no
// register / email verification: customers have no accounts).
export const authApi = {
    login: (payload) => api.post("/auth/login", payload),
    forgotPassword: (payload) => api.post("/auth/forgot-password", payload),
    resetPassword: (payload) => api.put("/auth/reset-password", payload),
    getMe: () => api.get("/auth/me"),
    logout: () => api.get("/auth/logout"),
    updateProfile: (payload) => api.put("/auth/profile", payload),
};
