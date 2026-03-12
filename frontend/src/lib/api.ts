/**
 * Shared API utilities — URL validation and authenticated fetch wrapper.
 */

import { supabase } from "./supabase";

function getApiBaseUrl(): string {
    const url = process.env.NEXT_PUBLIC_API_URL;
    if (!url) {
        throw new Error("NEXT_PUBLIC_API_URL is not configured");
    }
    return url;
}

/**
 * Fetch wrapper that attaches the Supabase access token to the request.
 * Falls back to unauthenticated request if no session is available.
 */
export async function apiFetch(
    path: string,
    init?: RequestInit,
): Promise<Response> {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}${path}`;

    const headers = new Headers(init?.headers);

    // Attach auth token if available
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
        headers.set("Authorization", `Bearer ${session.access_token}`);
    }

    // Auto-set JSON content type unless body is FormData (browser sets multipart boundary)
    if (!headers.has("Content-Type") && !(init?.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
    }

    return fetch(url, { ...init, headers });
}

/**
 * Fetch + JSON parse with basic response validation.
 * Throws on non-ok responses with the server error message.
 */
export async function apiJson<T = unknown>(
    path: string,
    init?: RequestInit,
): Promise<T> {
    const response = await apiFetch(path, init);

    if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(text || `API error: ${response.status}`);
    }

    return response.json() as Promise<T>;
}
