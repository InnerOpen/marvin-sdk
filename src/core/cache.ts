/**
 * Simple in-memory cache for SDK data
 *
 * Stores data with automatic expiration based on timestamp.
 * Thread-safe in single-threaded environments (browser/Node.js).
 */

interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  /** Optional tags for invalidation strategies */
  tags?: string[];
}

export class MarvinCache {
  private cache = new Map<string, CacheEntry>();

  constructor(
    private duration: number = 5 * 60 * 1000,
    private maxEntries: number = 1000
  ) {}

  /**
   * Get cached data by key
   * Returns undefined if not found or expired
   */
  get<T = unknown>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    const age = Date.now() - entry.timestamp;
    if (age > this.duration) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.data as T;
  }

  /**
   * Set cached data with optional tags for invalidation
   */
  set<T = unknown>(key: string, data: T, tags?: string[]): void {
    // Enforce max entries limit (LRU-style: delete oldest)
    if (this.cache.size >= this.maxEntries) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      tags,
    });
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Delete a specific cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate all cache entries with a specific tag
   * Useful for invalidating related data after mutations
   *
   * @example
   * ```typescript
   * // Cache entries with tags
   * cache.set('entry:1', data, ['entries', 'entry:1']);
   * cache.set('entries:list', data, ['entries']);
   *
   * // Invalidate all entries
   * cache.invalidateByTag('entries');
   * ```
   */
  invalidateByTag(tag: string): number {
    let count = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags?.includes(tag)) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxEntries: number;
    oldestEntry: number | null;
    newestEntry: number | null;
  } {
    let oldest: number | null = null;
    let newest: number | null = null;

    for (const entry of this.cache.values()) {
      if (oldest === null || entry.timestamp < oldest) {
        oldest = entry.timestamp;
      }
      if (newest === null || entry.timestamp > newest) {
        newest = entry.timestamp;
      }
    }

    return {
      size: this.cache.size,
      maxEntries: this.maxEntries,
      oldestEntry: oldest,
      newestEntry: newest,
    };
  }

  /**
   * Remove expired entries (garbage collection)
   * Returns number of entries removed
   */
  prune(): number {
    let count = 0;
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      if (age > this.duration) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }
}
