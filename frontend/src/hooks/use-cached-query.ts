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
    const { user } = useAuth();
    const [data, setData] = useState<T>(initialData as T);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    // Use ref to keep the latest fetcher without triggering effect re-runs
    const fetcherRef = useRef(fetcher);

    useEffect(() => {
        fetcherRef.current = fetcher;
    }, [fetcher]);

    const refresh = useCallback(async () => {
        try {
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
        if (!enabled || !user) return;

        // 1. Try to load from cache synchronously
        const cached = safeGetItem<T>(key, maxAge);
        if (cached !== null) {
            setData(cached);
            setLoading(false);
        }

        // 2. Trigger background fetch (always, to keep data fresh)
        refresh();

    }, [key, user, enabled, refresh, maxAge]);

    return { data, loading, error, refresh, setData };
}
