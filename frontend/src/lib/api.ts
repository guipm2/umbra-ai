/**
 * Shared API utilities — URL validation and authenticated fetch wrapper.
 */

import { supabase } from "./supabase";

function createRequestId(): string {
    const withCrypto = globalThis.crypto?.randomUUID;
    if (withCrypto) {
        return withCrypto.call(globalThis.crypto);
    }
    return `rid-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

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

    if (!headers.has("X-Request-ID")) {
        headers.set("X-Request-ID", createRequestId());
    }

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
        const responseRequestId = response.headers.get("X-Request-ID");
        const baseMessage = text || `API error: ${response.status}`;
        const fullMessage = responseRequestId
            ? `${baseMessage} | request_id=${responseRequestId}`
            : baseMessage;
        throw new Error(fullMessage);
    }

    return response.json() as Promise<T>;
}
