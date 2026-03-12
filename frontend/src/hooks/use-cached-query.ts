"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { safeGetItem, safeSetItem } from "@/lib/storage";

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
    // Only start as true if we are enabled. If not enabled, we shouldn't be loading.
    const [loading, setLoading] = useState(enabled);
    const [error, setError] = useState<any>(null);

    // Use ref to keep the latest fetcher without triggering effect re-runs
    const fetcherRef = useRef(fetcher);

    useEffect(() => {
        fetcherRef.current = fetcher;
    }, [fetcher]);

    const refresh = useCallback(async () => {
        try {
            setLoading(true);
            const result = await fetcherRef.current();
            setData(result);
            safeSetItem(key, result);
            setError(null);
        } catch (err) {
            console.error(`Error fetching ${key}:`, err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [key]);

    useEffect(() => {
        // If auth is still loading, wait.
        if (authLoading) return;

        // If enabled but no user (e.g., logged out or momentary tab switch drop), 
        // we must clear the loading state so the UI doesn't hang forever.
        if (!enabled || !user) {
            setLoading(false);
            return;
        }

        // 1. Try to load from cache synchronously
        const cached = safeGetItem<T>(key, maxAge);
        if (cached !== null) {
            setData(cached);
            // If we have cache, we immediately stop the loading spinner
            // while we fetch fresh data in the background
            setLoading(false);
        }

        // 2. Trigger background fetch (always, to keep data fresh)
        refresh();

    }, [key, user, authLoading, enabled, refresh, maxAge]);

    return { data, loading, error, refresh, setData };
}
