"use client";
// Port of footpath-frontend/src/context/CartContext.jsx (dual mode cart).
//
//   guest      localStorage (CART_STORAGE_KEY), sent as guestItems at checkout
//   signed in  server /api/cart, which createOrder reads (body items ignored)
//
// On login the local basket is merged server side (POST /api/cart/merge) and
// only then cleared. Do not collapse this to one mode: Cart.user is required
// and unique on the backend, so a server guest cart cannot exist.
//
// Aamkahon additions:
//   - lines carry unit, wholesale tier, pre-booking flag (lib/store/cartLine.js)
//   - pre-booking and in-season items cannot share a bag (the backend refuses
//     to price a mixed cart, so we stop it at add time with an explanation)
//   - the static demo build always stays in guest mode
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { cartApi } from "@/lib/api/cartApi";
import { errorMessage } from "@/lib/api/client";
import { CART_STORAGE_KEY, IS_STATIC } from "@/lib/config";
import { lineUnitPrice } from "@/lib/store/cartLine";
import { variantCartKey } from "@/lib/store/variants";
import { useAuth } from "@/context/AuthContext";
import { mediaUrl } from "@/lib/media";

const CartContext = createContext(null);

const readStored = () => {
    try {
        const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "null");
        if (!Array.isArray(parsed?.items)) return [];
        return parsed.items.filter((i) => i && typeof i.key === "string" && Number(i.quantity) > 0);
    } catch {
        return [];
    }
};
const writeStored = (items) => {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ version: 1, items }));
    } catch {
        /* quota / private mode: in-memory cart still works */
    }
};
const clearStored = () => {
    try {
        localStorage.removeItem(CART_STORAGE_KEY);
    } catch {
        /* nothing to do */
    }
};

/** Server cart line -> the guest line shape. itemId marks a server line. */
function fromServerItem(item) {
    const product = item.product ?? {};
    const options = item.variant?.options ?? [];
    const variant = product.hasVariants
        ? (product.variants || []).find(
              (v) =>
                  v.options?.length === options.length &&
                  options.every((o) => v.options.some((vo) => vo.name === o.name && vo.value === o.value)),
          )
        : null;
    const groups = product.imageGroups ?? [];
    const main = groups.find((g) => g.name === "Main") ?? groups[0];
    const isPre = product.availability === "pre_order";

    return {
        key: variantCartKey(product._id ?? item.product, options),
        itemId: item._id,
        productId: product._id ?? item.product,
        name: product.name ?? "",
        nameBn: product.nameBn ?? "",
        slug: product.slug ?? "",
        image: mediaUrl(main?.images?.[0]?.url),
        unit: product.unit || "kg",
        // Server stored the tiered price; keep the retail price for the label.
        price: Number(variant ? variant.price : product.price) || Number(item.priceAtPurchase) || 0,
        wholesale:
            product.wholesale?.enabled && product.wholesale.minQty
                ? { minQty: product.wholesale.minQty, price: Number(variant ? variant.wholesalePrice : product.wholesale.price) || null }
                : null,
        quantity: Number(item.quantity) || 1,
        variant: options.length ? { options, displayName: item.variant?.displayName } : undefined,
        variantLabel: options.map((o) => o.value).join(" / "),
        minQty: product.minOrderQty || 1,
        isPreOrder: isPre,
        expectedDate: isPre ? product.preOrder?.expectedDate || null : null,
        stock: isPre ? product.preOrder?.maxQtyPerOrder || Infinity : Number(variant ? variant.stock : product.stock) || 0,
    };
}

export function CartProvider({ children }) {
    const { isAuthenticated: authed, loading: authLoading } = useAuth();
    // The demo has no server cart to talk to.
    const isAuthenticated = authed && !IS_STATIC;

    const [isOpen, setIsOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [notice, setNotice] = useState(null);

    const modeRef = useRef("guest");
    const hydrated = useRef(false);
    const mergedForSession = useRef(false);

    // Read localStorage after mount: the server render has no storage, and
    // reading it during render would mismatch hydration.
    useEffect(() => {
        let alive = true;
        Promise.resolve().then(() => {
            if (!alive) return;
            setItems(readStored());
            hydrated.current = true;
        });
        return () => {
            alive = false;
        };
    }, []);

    useEffect(() => {
        if (hydrated.current && modeRef.current === "guest") writeStored(items);
    }, [items]);

    const loadServerCart = useCallback(async () => {
        const { data } = await cartApi.get();
        modeRef.current = "server";
        setItems((data?.cart?.items ?? []).map(fromServerItem));
    }, []);

    useEffect(() => {
        if (authLoading) return;
        let cancelled = false;

        (async () => {
            if (isAuthenticated) {
                if (mergedForSession.current) return;
                mergedForSession.current = true;
                setIsSyncing(true);
                try {
                    const guest = readStored();
                    if (guest.length) {
                        const { data } = await cartApi.merge(
                            guest.map((i) => ({ productId: i.productId, quantity: i.quantity, variant: i.variant })),
                        );
                        clearStored(); // only after the server confirmed
                        const skipped = data?.skipped ?? [];
                        if (!cancelled && skipped.length) {
                            setNotice(
                                skipped.length === 1
                                    ? skipped[0].message || "One item in your bag is no longer available and was removed."
                                    : `${skipped.length} items in your bag are no longer available and were removed.`,
                            );
                        }
                    }
                    if (!cancelled) await loadServerCart();
                } catch {
                    if (!cancelled) mergedForSession.current = false;
                } finally {
                    if (!cancelled) setIsSyncing(false);
                }
            } else if (modeRef.current === "server") {
                mergedForSession.current = false;
                modeRef.current = "guest";
                setItems(readStored());
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [isAuthenticated, authLoading, loadServerCart]);

    const openCart = useCallback(() => setIsOpen(true), []);
    const closeCart = useCallback(() => setIsOpen(false), []);
    const dismissNotice = useCallback(() => setNotice(null), []);

    /** @param line from lib/store/cartLine.makeLine */
    const addItem = useCallback(
        async (line, qty = line.quantity || 1) => {
            const mixed = items.length > 0 && items.some((i) => i.isPreOrder !== line.isPreOrder);
            if (mixed) {
                setNotice(
                    line.isPreOrder
                        ? "Pre-bookings check out on their own. Finish or clear the in-season items in your bag first."
                        : "Your bag holds a pre-booking. Check that out first, then add in-season items.",
                );
                setIsOpen(true);
                return false;
            }

            setItems((prev) => {
                const existing = prev.find((i) => i.key === line.key);
                const ceiling = Number.isFinite(line.stock) ? line.stock : Infinity;
                if (existing) {
                    return prev.map((i) => (i.key === line.key ? { ...i, quantity: Math.min(i.quantity + qty, ceiling) } : i));
                }
                return [...prev, { ...line, quantity: Math.min(Math.max(qty, line.minQty || 1), ceiling) }];
            });
            setIsOpen(true);

            if (!isAuthenticated) return true;
            try {
                await cartApi.add({ productId: line.productId, quantity: qty, variant: line.variant });
                await loadServerCart();
                return true;
            } catch (error) {
                setNotice(errorMessage(error, "Could not add that to your bag."));
                await loadServerCart().catch(() => {});
                return false;
            }
        },
        [items, isAuthenticated, loadServerCart],
    );

    const updateQty = useCallback(
        async (key, qty) => {
            const line = items.find((i) => i.key === key);
            if (!line) return;
            const ceiling = Number.isFinite(line.stock) ? line.stock : Infinity;
            let target = qty <= 0 ? 0 : Math.min(qty, ceiling);
            if (target > 0 && target < (line.minQty || 1)) {
                setNotice(`Minimum order for ${line.name} is ${line.minQty} ${line.unit}.`);
                target = line.minQty;
            }
            if (target > 0 && target === line.quantity) {
                if (qty > ceiling) setNotice(`Only ${ceiling} ${line.unit} of ${line.name} available.`);
                return;
            }

            setItems((prev) =>
                target <= 0 ? prev.filter((i) => i.key !== key) : prev.map((i) => (i.key === key ? { ...i, quantity: target } : i)),
            );

            if (!isAuthenticated || !line.itemId) return;
            try {
                if (target <= 0) await cartApi.removeItem(line.itemId);
                else await cartApi.updateItem(line.itemId, target);
                await loadServerCart();
            } catch (error) {
                setNotice(errorMessage(error, "Could not update your bag."));
                await loadServerCart().catch(() => {});
            }
        },
        [items, isAuthenticated, loadServerCart],
    );

    const removeItem = useCallback((key) => updateQty(key, 0), [updateQty]);

    const resetAfterOrder = useCallback(() => {
        setItems([]);
        clearStored();
    }, []);

    const totals = useMemo(
        () => ({
            itemCount: items.length,
            // Display only; checkout shows the server's figure.
            subtotal: items.reduce((s, i) => s + lineUnitPrice(i) * i.quantity, 0),
            isPreOrderBag: items.length > 0 && items.every((i) => i.isPreOrder),
        }),
        [items],
    );

    const value = useMemo(
        () => ({
            isOpen,
            openCart,
            closeCart,
            items,
            ...totals,
            addItem,
            updateQty,
            removeItem,
            resetAfterOrder,
            refreshCart: loadServerCart,
            isSyncing,
            notice,
            dismissNotice,
            isGuestCart: !isAuthenticated,
        }),
        [isOpen, openCart, closeCart, items, totals, addItem, updateQty, removeItem, resetAfterOrder, loadServerCart, isSyncing, notice, dismissNotice, isAuthenticated],
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
    return ctx;
}
