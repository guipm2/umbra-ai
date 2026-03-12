"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { safeGetItem, safeSetItem } from "@/lib/storage";

const QUERY_TIMEOUT_MS = 15_000;   // abort individual fetch after 15s
const LOADING_TIMEOUT_MS = 20_000; // safety net: force loading=false after 20s

interface UseCachedQueryOptions<T> {
    key: string;
    fetcher: () => Promise<T>;
    initialData?: T;
    enabled?: boolean;
    /** Max age in ms before cache is considered expired. Default: 30 min. */
    maxAge?: number;
}

export function useCachedQuery<T>({ key, fetcher, initialData, enabled = true, maxAge }: UseCachedQueryOptions<T>) {
    const { user, loading: authLoading } = useAuth();
    const [data, setData] = useState<T>(initialData as T);
    const [loading, setLoading] = useState(enabled);
    const [error, setError] = useState<any>(null);

    // Stable user id to avoid re-running effect on object reference changes
    const userId = user?.id ?? null;

    // Use ref to keep the latest fetcher without triggering effect re-runs
    const fetcherRef = useRef(fetcher);
    useEffect(() => {
        fetcherRef.current = fetcher;
    }, [fetcher]);

    // AbortController ref so cleanup can cancel in-flight requests
    const abortRef = useRef<AbortController | null>(null);

    const refresh = useCallback(async (signal?: AbortSignal) => {
        try {
            setLoading(true);
            setError(null);

            // Race the fetcher against a timeout
            const result = await Promise.race([
                fetcherRef.current(),
                new Promise<never>((_, reject) => {
                    const timer = setTimeout(() => reject(new Error("Query timeout")), QUERY_TIMEOUT_MS);
                    signal?.addEventListener("abort", () => { clearTimeout(timer); reject(new Error("Aborted")); });
                }),
            ]);

            // If this effect was cleaned up, discard the result
            if (signal?.aborted) return;

            setData(result);
            safeSetItem(key, result);
            setError(null);
        } catch (err: any) {
            if (signal?.aborted || err?.message === "Aborted") return;
            console.error(`Error fetching ${key}:`, err);
            setError(err);
        } finally {
            if (!signal?.aborted) {
                setLoading(false);
            }
        }
    }, [key]);

    useEffect(() => {
        // If auth is still loading, wait.
        if (authLoading) return;

        // If not enabled or no user, clear loading so UI doesn't hang.
        if (!enabled || !userId) {
            setLoading(false);
            return;
        }

        // Cancel any previous in-flight request
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        // 1. Try to load from cache synchronously
        const cached = safeGetItem<T>(key, maxAge);
        if (cached !== null) {
            setData(cached);
            setLoading(false);
        }

        // 2. Trigger background fetch (always, to keep data fresh)
        refresh(controller.signal);

        // Safety net: if loading stays true for too long, force it off
        const safetyTimer = setTimeout(() => {
            if (!controller.signal.aborted) {
                setLoading(false);
                setError(new Error("Loading timeout"));
                console.warn(`[useCachedQuery] Safety timeout for "${key}"`);
            }
        }, LOADING_TIMEOUT_MS);

        return () => {
            controller.abort();
            clearTimeout(safetyTimer);
        };
    }, [key, userId, authLoading, enabled, refresh, maxAge]);

    return { data, loading, error, refresh: () => refresh(), setData };
}
