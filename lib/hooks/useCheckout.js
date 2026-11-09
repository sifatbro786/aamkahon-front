"use client";
// Port of footpath-frontend/src/hooks/store/useCheckout.js.
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { checkoutApi } from "@/lib/api/checkoutApi";
import { IS_STATIC } from "@/lib/config";

const HOUR = 60 * 60 * 1000;

export const useDistricts = () =>
    useQuery({
        queryKey: ["checkout", "districts"],
        queryFn: () => checkoutApi.getDistricts().then((r) => r.data?.districts ?? []),
        staleTime: HOUR,
        enabled: !IS_STATIC,
    });

export const useUpazilas = (district) =>
    useQuery({
        queryKey: ["checkout", "upazilas", district],
        queryFn: () => checkoutApi.getUpazilas(district).then((r) => r.data?.upazilas ?? []),
        enabled: Boolean(district) && !IS_STATIC,
        staleTime: HOUR,
        retry: false,
    });

export const useCourierBranches = (district, enabled) =>
    useQuery({
        queryKey: ["checkout", "branches", district],
        queryFn: () => checkoutApi.getCourierBranches(district).then((r) => r.data?.branches ?? []),
        enabled: Boolean(district) && enabled && !IS_STATIC,
        staleTime: HOUR,
        retry: false,
    });

/** locationType is derived server side from the upazila, never chosen. */
export const useLocation = (district, upazila) =>
    useQuery({
        queryKey: ["checkout", "location", district, upazila],
        queryFn: () => checkoutApi.validateLocation({ district, upazila }).then((r) => r.data),
        enabled: Boolean(district && upazila) && !IS_STATIC,
        staleTime: HOUR,
        retry: false,
    });

/**
 * Live totals from POST /api/checkout/calculate. A query (not a mutation) so
 * identical payloads are deduped; previous totals stay visible while new ones load.
 */
export const useCalculation = (payload, enabled) => {
    const q = useQuery({
        queryKey: ["checkout", "calc", payload],
        queryFn: () => checkoutApi.calculate(payload).then((r) => r.data?.data ?? null),
        enabled: enabled && !IS_STATIC && Boolean(payload?.locationType && payload?.paymentMethod),
        placeholderData: (prev) => prev,
        retry: false,
    });
    return {
        totals: q.data ?? null,
        isCalculating: q.isFetching,
        needsAddress: Boolean(q.data?.message),
        error: q.error?.response?.data?.message ?? null,
    };
};

export const usePlaceOrder = () => useMutation({ mutationFn: (payload) => checkoutApi.createOrder(payload).then((r) => r.data) });

/** Guest lines for calculate / createOrder. No prices: the server reprices. */
export const useGuestItems = (items) =>
    useMemo(() => items.map((i) => ({ productId: i.productId, quantity: i.quantity, variant: i.variant })), [items]);
