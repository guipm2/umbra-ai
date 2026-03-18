"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { safeGetItem, safeSetItem } from "@/lib/storage";

const QUERY_TIMEOUT_MS = 15_000;          // abort individual fetch after 15s
const LOADING_TIMEOUT_MS = 20_000;        // safety net: force loading=false after 20s
const RETRY_DELAY_MS = 2_000;             // wait before automatic retry
const REFETCH_ON_FOCUS_DELAY_MS = 1_500;  // delay after tab focus to let Supabase refresh token

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
    const [data, setDataState] = useState<T>(initialData as T);
    const [loading, setLoading] = useState(enabled);
    const [error, setError] = useState<any>(null);
    const [isRefetching, setIsRefetching] = useState(false);

    // Stable user id to avoid re-running effect on object reference changes
    const userId = user?.id ?? null;

    // Ref to track whether we have real data (not just initialData).
    // Provides synchronous access inside callbacks without adding state deps.
    const dataRef = useRef<T>(initialData as T);
    const hasRealData = useRef(false);

    const setData = useCallback((value: T) => {
        dataRef.current = value;
        hasRealData.current = true;
        setDataState(value);
    }, []);

    // Use ref to keep the latest fetcher without triggering effect re-runs
    const fetcherRef = useRef(fetcher);
    useEffect(() => {
        fetcherRef.current = fetcher;
    }, [fetcher]);

    // AbortController ref so cleanup can cancel in-flight requests
    const abortRef = useRef<AbortController | null>(null);

    // Retry tracking per fetch cycle
    const retryRef = useRef(0);

    const refresh = useCallback(async (signal?: AbortSignal, opts?: { _isRetry?: boolean }) => {
        const isRetry = opts?._isRetry ?? false;
        if (!isRetry) retryRef.current = 0;

        try {
            // Only show the full loading spinner when there is no data to display.
            // If we already have data (from cache or previous fetch), refresh silently.
            if (!hasRealData.current) {
                setLoading(true);
            }
            setIsRefetching(true);
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
            console.error(`[useCachedQuery] Error fetching "${key}":`, err);

            // Automatic retry: one attempt after a short delay
            if (retryRef.current < 1) {
                retryRef.current += 1;
                console.warn(`[useCachedQuery] Retrying "${key}" in ${RETRY_DELAY_MS}ms...`);
                await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
                if (!signal?.aborted) {
                    return refresh(signal, { _isRetry: true });
                }
                return;
            }

            // After retry exhausted: only show error if there's no stale data to display
            if (hasRealData.current) {
                console.warn(`[useCachedQuery] Background refresh failed for "${key}", keeping stale data.`);
            } else {
                setError(err);
            }
        } finally {
            if (!signal?.aborted) {
                setLoading(false);
                setIsRefetching(false);
            }
        }
    }, [key, setData]);

    // Main effect: runs on mount and when key/user/auth changes
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
                setIsRefetching(false);
                if (!hasRealData.current) {
                    setError(new Error("Loading timeout"));
                }
                console.warn(`[useCachedQuery] Safety timeout for "${key}"`);
            }
        }, LOADING_TIMEOUT_MS);

        return () => {
            controller.abort();
            clearTimeout(safetyTimer);
        };
    }, [key, userId, authLoading, enabled, refresh, maxAge, setData]);

    // Refetch when tab becomes visible again (after Supabase finishes token refresh)
    useEffect(() => {
        if (!enabled || !userId || authLoading) return;

        let focusTimer: ReturnType<typeof setTimeout>;

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                // Delay to let Supabase finish its own token refresh first
                focusTimer = setTimeout(() => {
                    refresh();
                }, REFETCH_ON_FOCUS_DELAY_MS);
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            clearTimeout(focusTimer);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [enabled, userId, authLoading, refresh]);

    return { data, loading, error, isRefetching, refresh: () => refresh(), setData };
}
