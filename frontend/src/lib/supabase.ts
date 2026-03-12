
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Erro na URL ou na chave do banco de dados')
}

/**
 * In-memory promise-based lock that replaces navigator.locks.
 *
 * navigator.locks is shared across ALL tabs of the same origin.
 * When the browser fires visibilitychange and Supabase tries to refresh the
 * token, the lock is held.  Every subsequent getSession() call — including
 * those made implicitly by supabase.from().select() — queues behind the
 * same lock, causing queries to hang until the lock is released.
 *
 * This simple per-tab lock avoids cross-tab contention while still
 * serialising auth operations within the same tab.
 */
const locks: Record<string, Promise<any>> = {}

async function inMemoryLock<R>(
    name: string,
    acquireTimeout: number,
    fn: () => Promise<R>,
): Promise<R> {
    const prev = locks[name]
    if (prev) {
        const timeout = Math.max(acquireTimeout > 0 ? acquireTimeout : 5000, 10000)
        await Promise.race([
            prev.catch(() => { /* ignore */ }),
            new Promise((r) => setTimeout(r, timeout)),
        ])
    }

    const result = fn()
    locks[name] = result

    try {
        return await result
    } finally {
        if (locks[name] === result) {
            delete locks[name]
        }
    }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        lock: inMemoryLock,
    },
})
