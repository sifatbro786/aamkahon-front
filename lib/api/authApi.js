import api from "./client";

// Maps 1:1 to amkahon-back routes/authRoutes.js.
export const authApi = {
    register: (payload) => api.post("/auth/register", payload),
    verifyEmail: (payload) => api.post("/auth/verify-email", payload),
    resendVerification: (payload) => api.post("/auth/resend-verification", payload),
    login: (payload) => api.post("/auth/login", payload),
    forgotPassword: (payload) => api.post("/auth/forgot-password", payload),
    resetPassword: (payload) => api.put("/auth/reset-password", payload),
    getMe: () => api.get("/auth/me"),
    logout: () => api.get("/auth/logout"),
    updateProfile: (payload) => api.put("/auth/profile", payload),
};
