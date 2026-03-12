/**
 * Safe localStorage wrapper with TTL support and LRU eviction.
 *
 * Prevents unhandled QuotaExceededError and JSON.parse crashes
 * that cause components to get stuck in infinite loading states.
 */

const CACHE_META_KEY = "_umbra_cache_meta";
const DEFAULT_MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface CacheMeta {
  [key: string]: number; // key -> last access timestamp
}

// ─── Internal Helpers ────────────────────────────────────────

function getCacheMeta(): CacheMeta {
  try {
    const raw = localStorage.getItem(CACHE_META_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Corrupted meta — reset it
    try {
      localStorage.removeItem(CACHE_META_KEY);
    } catch {
      // Silently fail
    }
  }
  return {};
}

function setCacheMeta(meta: CacheMeta): void {
  try {
    localStorage.setItem(CACHE_META_KEY, JSON.stringify(meta));
  } catch {
    // If we can't even store meta, we silently skip
  }
}

function touchKey(key: string): void {
  const meta = getCacheMeta();
  meta[key] = Date.now();
  setCacheMeta(meta);
}

function removeKeyFromMeta(key: string): void {
  const meta = getCacheMeta();
  delete meta[key];
  setCacheMeta(meta);
}

/**
 * Evicts the least-recently-used cache entry (excluding the meta key).
 * Returns true if something was evicted.
 */
function evictOldest(): boolean {
  const meta = getCacheMeta();
  const entries = Object.entries(meta);
  if (entries.length === 0) return false;

  // Sort by timestamp ascending (oldest first)
  entries.sort((a, b) => a[1] - b[1]);
  const [oldestKey] = entries[0];

  try {
    localStorage.removeItem(oldestKey);
    removeKeyFromMeta(oldestKey);
    console.warn(`[storage] Evicted oldest cache entry: "${oldestKey}"`);
    return true;
  } catch {
    return false;
  }
}

// ─── Public API ──────────────────────────────────────────────

/**
 * Safely reads and parses a value from localStorage.
 * Returns `null` if the key doesn't exist, is corrupted, or is expired.
 *
 * @param key - The localStorage key
 * @param maxAge - Maximum age in ms. Defaults to 30 min. Pass `Infinity` to disable TTL.
 */
export function safeGetItem<T>(key: string, maxAge: number = DEFAULT_MAX_AGE_MS): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    // Support both envelope format { data, timestamp } and legacy raw format
    if (parsed && typeof parsed === "object" && "data" in parsed && "timestamp" in parsed) {
      const entry = parsed as CacheEntry<T>;

      // Check TTL
      if (maxAge !== Infinity && Date.now() - entry.timestamp > maxAge) {
        // Expired — remove it
        localStorage.removeItem(key);
        removeKeyFromMeta(key);
        return null;
      }

      touchKey(key);
      return entry.data;
    }

    // Legacy format: raw data without envelope (backwards compatibility)
    touchKey(key);
    return parsed as T;
  } catch (error) {
    console.warn(`[storage] Failed to read "${key}", clearing corrupted entry:`, error);
    try {
      localStorage.removeItem(key);
      removeKeyFromMeta(key);
    } catch {
      // Silently fail
    }
    return null;
  }
}

/**
 * Checks if a cached item exists and is within its TTL.
 */
export function isCacheStale(key: string, maxAge: number = DEFAULT_MAX_AGE_MS): boolean {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return true;

    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && "data" in parsed && "timestamp" in parsed) {
      return maxAge !== Infinity && Date.now() - parsed.timestamp > maxAge;
    }

    // Legacy format — always considered stale (no timestamp info)
    return true;
  } catch {
    return true;
  }
}

/**
 * Safely writes a value to localStorage with a timestamp envelope.
 * On QuotaExceededError, evicts the oldest entry and retries once.
 *
 * @param key - The localStorage key
 * @param value - The value to store (will be JSON-serialized)
 */
export function safeSetItem<T>(key: string, value: T): boolean {
  const entry: CacheEntry<T> = {
    data: value,
    timestamp: Date.now(),
  };

  const serialized = JSON.stringify(entry);

  try {
    localStorage.setItem(key, serialized);
    touchKey(key);
    return true;
  } catch (firstError) {
    console.warn(`[storage] Write failed for "${key}", attempting eviction...`, firstError);

    // Try to evict oldest and retry once
    if (evictOldest()) {
      try {
        localStorage.setItem(key, serialized);
        touchKey(key);
        return true;
      } catch (retryError) {
        console.warn(`[storage] Write failed after eviction for "${key}":`, retryError);
      }
    }

    return false;
  }
}

/**
 * Safely removes a key from localStorage and its metadata.
 */
export function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
    removeKeyFromMeta(key);
  } catch (error) {
    console.warn(`[storage] Failed to remove "${key}":`, error);
  }
}

/**
 * Clears all Umbra cache entries (keys tracked in meta).
 * Does NOT clear non-Umbra localStorage entries.
 */
export function clearAllCache(): void {
  const meta = getCacheMeta();
  for (const key of Object.keys(meta)) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Continue clearing other entries
    }
  }
  try {
    localStorage.removeItem(CACHE_META_KEY);
  } catch {
    // Silently fail
  }
}
