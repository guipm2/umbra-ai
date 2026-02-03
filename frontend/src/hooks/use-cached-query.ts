"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/components/auth/auth-context";

interface UseCachedQueryOptions<T> {
    key: string;
    fetcher: () => Promise<T>;
    initialData?: T;
    enabled?: boolean;
}

export function useCachedQuery<T>({ key, fetcher, initialData, enabled = true }: UseCachedQueryOptions<T>) {
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
            localStorage.setItem(key, JSON.stringify(result));
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

        // 1. Try Load Cache synchronously (or close to it)
        try {
            const cached = localStorage.getItem(key);
            if (cached) {
                const parsed = JSON.parse(cached);
                setData(parsed);
                // If we found cache, we are not "loading" in the blocking sense anymore
                setLoading(false);
            }
        } catch (e) {
            console.warn(`Failed to parse cache for ${key}`, e);
        }

        // 2. Trigger Background Fetch
        refresh();

    }, [key, user, enabled, refresh]);

    return { data, loading, error, refresh, setData };
}
