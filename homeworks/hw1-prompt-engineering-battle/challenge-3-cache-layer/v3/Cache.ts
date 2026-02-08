import * as fs from 'fs';
import * as path from 'path';

/**
 * Cache entry structure storing value, expiration time, and LRU tracking
 */
interface CacheEntry<V> {
  value: V;
  expiresAt: number;
  lastAccessed: number;
}

/**
 * Serialized cache state for persistence
 */
interface SerializedCache<V> {
  entries: Record<string, CacheEntry<V>>;
  accessCounter?: number;
}

/**
 * Production-ready caching layer with TTL expiration, LRU eviction, and file persistence.
 * 
 * Features:
 * - TTL-based expiration with timestamp checking
 * - LRU eviction when cache exceeds maximum size
 * - Atomic file persistence with automatic recovery
 * - Type-safe generic implementation
 */
export class Cache<K extends string, V> {
  private cache: Map<K, CacheEntry<V>>;
  private readonly filePath: string;
  private readonly maxSize: number;
  private readonly defaultTTL?: number;
  private accessCounter: number;

  /**
   * Creates a new cache instance with file-based persistence
   * 
   * @param filePath - Path to the JSON persistence file
   * @param maxSize - Maximum number of entries (triggers LRU eviction)
   * @param defaultTTL - Optional default TTL in milliseconds for entries without explicit TTL
   */
  constructor(filePath: string, maxSize: number, defaultTTL?: number) {
    this.filePath = filePath;
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
    this.cache = new Map<K, CacheEntry<V>>();
    this.accessCounter = 0;

    this.ensureDirectoryExists();
    this.load();
  }

  /**
   * Stores a value in the cache with optional TTL
   * Updates recency and triggers auto-save
   * Evicts LRU entry if cache is full
   * 
   * @param key - Cache key
   * @param value - Value to store (must be JSON-serializable)
   * @param ttl - Optional TTL in milliseconds (overrides default)
   * @throws Error if value is not JSON-serializable
   */
  set(key: K, value: V, ttl?: number): void {
    // Validate serializability immediately
    try {
      const testSerialized = JSON.stringify({ value });
      const testParsed = JSON.parse(testSerialized);
      if (!('value' in testParsed)) {
        throw new Error('Value is not serializable (e.g., function, undefined)');
      }
    } catch (error) {
      throw new Error(`Cannot cache unserializable value for key "${key}": ${error}`);
    }

    this.removeExpired();

    const isNewKey = !this.cache.has(key);

    // Evict LRU entry if adding new key would exceed max size
    if (isNewKey && this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    const now = Date.now();
    const effectiveTTL = ttl !== undefined ? ttl : this.defaultTTL;
    const expiresAt = effectiveTTL !== undefined ? now + effectiveTTL : Infinity;

    // Use monotonic counter for precise LRU ordering
    this.accessCounter++;

    const entry: CacheEntry<V> = {
      value,
      expiresAt,
      lastAccessed: this.accessCounter,
    };

    this.cache.set(key, entry);
    this.save();
  }

  /**
   * Retrieves a value from the cache
   * Updates recency in memory only (does NOT save to disk)
   * 
   * @param key - Cache key
   * @returns The cached value or undefined if not found or expired
   */
  get(key: K): V | undefined {
    this.removeExpired();

    const entry = this.cache.get(key);
    if (!entry) {
      return undefined;
    }

    const now = Date.now();
    if (now >= entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    // Update recency (LRU tracking) using monotonic counter
    // Updated state will be saved on next mutating operation
    this.accessCounter++;
    entry.lastAccessed = this.accessCounter;
    
    return entry.value;
  }

  /**
   * Removes a key from the cache
   * Triggers auto-save
   * 
   * @param key - Cache key to remove
   * @returns true if the key existed and was removed, false otherwise
   */
  delete(key: K): boolean {
    this.removeExpired();

    const existed = this.cache.delete(key);
    if (existed) {
      this.save();
    }
    return existed;
  }

  /**
   * Removes all entries from the cache
   * Writes empty state to persistence file
   */
  clear(): void {
    this.cache.clear();
    this.accessCounter = 0;
    this.save();
  }

  /**
   * Returns all active (non-expired) cache keys
   * 
   * @returns Array of cache keys
   */
  keys(): K[] {
    this.removeExpired();
    return Array.from(this.cache.keys());
  }

  /**
   * Removes all expired entries from the cache
   */
  private removeExpired(): void {
    const now = Date.now();
    const keysToDelete: K[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now >= entry.expiresAt) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }
  }

  /**
   * Evicts the least recently used entry from the cache
   */
  private evictLRU(): void {
    let lruKey: K | null = null;
    let lruTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < lruTime) {
        lruTime = entry.lastAccessed;
        lruKey = key;
      }
    }

    if (lruKey !== null) {
      this.cache.delete(lruKey);
    }
  }

  /**
   * Atomically saves cache state to disk
   * Uses temp file + rename for atomicity
   */
  private save(): void {
    try {
      const entries: Record<string, CacheEntry<V>> = {};
      
      for (const [key, entry] of this.cache.entries()) {
        entries[key] = entry;
      }

      const state: SerializedCache<V> = { entries };
      
      // Only include accessCounter if cache is not empty
      if (this.cache.size > 0) {
        state.accessCounter = this.accessCounter;
      }
      
      // Custom serialization to handle Infinity
      const json = JSON.stringify(state, (key, value) => {
        if (value === Infinity) {
          return 'Infinity';
        }
        return value;
      }, 2);

      const tempPath = `${this.filePath}.tmp`;
      fs.writeFileSync(tempPath, json, 'utf-8');
      fs.renameSync(tempPath, this.filePath);
    } catch (error) {
      throw new Error(`Failed to save cache to ${this.filePath}: ${error}`);
    }
  }

  /**
   * Loads cache state from disk
   * Handles missing files and corrupted JSON gracefully
   * Removes expired entries after loading
   * Restores access counter for LRU ordering
   */
  private load(): void {
    try {
      if (!fs.existsSync(this.filePath)) {
        // Missing file is not an error - start with empty cache
        return;
      }

      const json = fs.readFileSync(this.filePath, 'utf-8');
      
      // Custom deserialization to handle Infinity
      const state = JSON.parse(json, (key, value) => {
        if (value === 'Infinity') {
          return Infinity;
        }
        return value;
      }) as SerializedCache<V>;

      if (!state.entries || typeof state.entries !== 'object') {
        // Corrupted structure - reset cache
        this.cache.clear();
        return;
      }

      // Restore access counter for LRU ordering
      if (typeof state.accessCounter === 'number') {
        this.accessCounter = state.accessCounter;
      }

      // Restore entries directly to the Map
      for (const [key, entry] of Object.entries(state.entries)) {
        if (this.isValidEntry(entry)) {
          this.cache.set(key as K, entry as CacheEntry<V>);
        }
      }

      // Remove expired entries immediately after loading
      this.removeExpired();
    } catch (error) {
      // Corrupted JSON or read error - start with empty cache
      this.cache.clear();
    }
  }

  /**
   * Validates cache entry structure
   */
  private isValidEntry(entry: unknown): entry is CacheEntry<V> {
    if (!entry || typeof entry !== 'object') {
      return false;
    }

    const e = entry as Record<string, unknown>;
    return (
      'value' in e &&
      typeof e.expiresAt === 'number' &&
      typeof e.lastAccessed === 'number'
    );
  }

  /**
   * Ensures the directory for the persistence file exists
   * Creates it recursively if missing
   */
  private ensureDirectoryExists(): void {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}