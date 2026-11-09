"use client";
// admin/router.js
//
// The admin is the Footpath (Vite + react-router) dashboard, ported file for
// file. Instead of rewriting ~15k lines of routing calls, the few react-router
// APIs it uses are implemented here on top of next/navigation, and every
// admin file imports from "@/admin/router" instead of "react-router-dom".
// Navigation stays Next navigation, so Back/Forward, prefetch and scroll work.
import NextLink from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, forwardRef, useContext, useEffect } from "react";

export const ParamsContext = createContext({});
export const OutletContext = createContext(null);

export const Link = forwardRef(function Link({ to, replace, state: _state, ...rest }, ref) {
    return <NextLink ref={ref} href={to} replace={replace} {...rest} />;
});

export function NavLink({ to, end, className, style, children, ...rest }) {
    const pathname = usePathname();
    const isActive = end ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);
    const cls = typeof className === "function" ? className({ isActive }) : className;
    const sty = typeof style === "function" ? style({ isActive }) : style;
    const kids = typeof children === "function" ? children({ isActive }) : children;
    return (
        <NextLink href={to} className={cls} style={sty} aria-current={isActive ? "page" : undefined} {...rest}>
            {kids}
        </NextLink>
    );
}

export function useNavigate() {
    const router = useRouter();
    return (to, opts = {}) => {
        if (typeof to === "number") return to < 0 ? router.back() : router.forward();
        return opts.replace ? router.replace(to) : router.push(to);
    };
}

export const useParams = () => useContext(ParamsContext);

export function useLocation() {
    const pathname = usePathname();
    const sp = useSearchParams();
    const search = sp?.toString() ? `?${sp.toString()}` : "";
    return { pathname, search, hash: "", state: null, key: pathname + search };
}

export function Outlet() {
    return useContext(OutletContext);
}

export function Navigate({ to, replace }) {
    const router = useRouter();
    useEffect(() => {
        if (replace) router.replace(to);
        else router.push(to);
    }, [to, replace, router]);
    return null;
}
