"use client";
// Browser API client. Same contract as footpath-frontend/src/api/axiosInstance.js:
// the backend's `protect` reads ONLY the Bearer header, so the token is
// attached on every request.
//
// In the static build a custom axios adapter answers from the demo emulator,
// so every component and the admin run unchanged with no backend.
import axios from "axios";

import { API_URL, IS_STATIC } from "@/lib/config";

export const TOKEN_KEY = "aamkahon.token";

export const readToken = () => {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
};
export const writeToken = (t) => {
    try {
        if (t) localStorage.setItem(TOKEN_KEY, t);
        else localStorage.removeItem(TOKEN_KEY);
    } catch {
        /* private mode: session lives in memory only */
    }
};

const staticAdapter = async (config) => {
    const { handle } = await import("@/lib/demo/emulator");
    const url = (config.url || "").replace(API_URL, "");
    let body = config.data;
    if (typeof body === "string") {
        try {
            body = JSON.parse(body);
        } catch {
            body = {};
        }
    }
    const auth = config.headers?.Authorization || config.headers?.get?.("Authorization");
    const token = auth ? String(auth).replace(/^Bearer\s+/i, "") : null;
    const res = handle(config.method || "get", url, config.params || {}, body || {}, token);
    const response = { data: res.data, status: res.status, statusText: String(res.status), headers: {}, config, request: {} };
    if (res.status >= 400) {
        const error = new axios.AxiosError(res.data?.message || "Request failed", String(res.status), config, {}, response);
        throw error;
    }
    return response;
};

const api = axios.create({
    baseURL: API_URL,
    ...(IS_STATIC ? { adapter: staticAdapter } : {}),
});

api.interceptors.request.use((config) => {
    const token = readToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// 401: drop a dead token. Unlike the Vite base we do not hard redirect here;
// AuthContext and the admin guard decide where to send the user.
api.interceptors.response.use(
    (r) => r,
    (error) => {
        if (error.response?.status === 401 && readToken()) writeToken(null);
        return Promise.reject(error);
    },
);

export const errorMessage = (error, fallback = "Something went wrong. Please try again.") =>
    error?.response?.data?.message || error?.response?.data?.errors?.[0]?.msg || fallback;

export default api;
