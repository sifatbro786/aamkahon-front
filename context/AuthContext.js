"use client";
// Port of footpath-frontend/src/context/AuthContext.jsx. Token in
// localStorage, validated against /auth/me on load.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { authApi } from "@/lib/api/authApi";
import { readToken, writeToken } from "@/lib/api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadUser = useCallback(async () => {
        if (!readToken()) {
            setUser(null);
            setLoading(false);
            return;
        }
        try {
            const { data } = await authApi.getMe(); // { success, user }
            setUser(data.user);
        } catch {
            writeToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Deferred a tick: a mount effect must not set state synchronously
    // (react-hooks/set-state-in-effect).
    useEffect(() => {
        Promise.resolve().then(loadUser);
    }, [loadUser]);

    const persist = (token, userData) => {
        writeToken(token);
        setUser(userData);
    };

    // All throw on failure; pages read error.response.data.message.
    const login = useCallback(async ({ email, password, rememberMe }) => {
        const { data } = await authApi.login({ email, password, rememberMe });
        persist(data.token, data.user);
        return data;
    }, []);

    // register returns no token: OTP verification comes first.
    const register = useCallback(async (payload) => (await authApi.register(payload)).data, []);

    const verifyEmail = useCallback(async ({ email, otp }) => {
        const { data } = await authApi.verifyEmail({ email, otp });
        persist(data.token, data.user);
        return data;
    }, []);

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } catch {
            /* token may already be dead; clear locally regardless */
        } finally {
            writeToken(null);
            setUser(null);
        }
    }, []);

    const value = useMemo(
        () => ({
            user,
            loading,
            isAuthenticated: Boolean(user),
            isAdmin: user?.role === "admin" || user?.role === "executive",
            login,
            register,
            verifyEmail,
            logout,
            updateUser: setUser,
            refreshUser: loadUser,
        }),
        [user, loading, login, register, verifyEmail, logout, loadUser],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
    return ctx;
}
