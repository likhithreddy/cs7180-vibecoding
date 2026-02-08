import * as fs from 'fs';
import * as path from 'path';

interface CacheEntry<T> {
  value: T;
  expiry: number;
  lastAccessed: number;
}

interface CacheOptions {
  maxSize?: number;
  defaultTTL?: number;
  persistPath: string;
  autoSave?: boolean;
}

interface SerializedCache<T> {
  entries: [string, CacheEntry<T>][];
  timestamp: number;
}

export class Cache<T = any> {
  private cache: Map<string, CacheEntry<T>>;
  private readonly maxSize: number;
  private readonly defaultTTL: number;
  private readonly persistPath: string;
  private readonly autoSave: boolean;

  constructor(options: CacheOptions) {
    this.maxSize = options.maxSize || 100;
    this.defaultTTL = options.defaultTTL || 3600000; // 1 hour default
    this.persistPath = options.persistPath;
    this.autoSave = options.autoSave ?? true;
    this.cache = new Map();

    this.ensureDirectoryExists();
    this.load();
  }

  /**
   * Set a value in the cache with optional TTL
   */
  set(key: string, value: T, ttl?: number): void {
    // Clean expired entries before checking size
    this.cleanExpired();

    // Check if we need to evict (only if adding a new key)
    if (!this.cache.has(key) && this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    const expiryTime = ttl !== undefined ? ttl : this.defaultTTL;
    const entry: CacheEntry<T> = {
      value,
      expiry: Date.now() + expiryTime,
      lastAccessed: Date.now(),
    };

    this.cache.set(key, entry);

    if (this.autoSave) {
      this.save();
    }
  }

  /**
   * Get a value from the cache
   * Returns undefined if key doesn't exist or has expired
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    // Check if expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      if (this.autoSave) {
        this.save();
      }
      return undefined;
    }

    // Update last accessed time (LRU tracking)
    entry.lastAccessed = Date.now();
    return entry.value;
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    // Check if expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      if (this.autoSave) {
        this.save();
      }
      return false;
    }

    return true;
  }

  /**
   * Delete a key from the cache
   */
  delete(key: string): boolean {
    const result = this.cache.delete(key);
    
    if (result && this.autoSave) {
      this.save();
    }
    
    return result;
  }

  /**
   * Clear all entries from the cache
   */
  clear(): void {
    this.cache.clear();
    
    if (this.autoSave) {
      this.save();
    }
  }

  /**
   * Get the current size of the cache (excluding expired entries)
   */
  size(): number {
    this.cleanExpired();
    return this.cache.size;
  }

  /**
   * Get all keys in the cache (excluding expired entries)
   */
  keys(): string[] {
    this.cleanExpired();
    return Array.from(this.cache.keys());
  }

  /**
   * Get all values in the cache (excluding expired entries)
   */
  values(): T[] {
    this.cleanExpired();
    return Array.from(this.cache.values()).map(entry => entry.value);
  }

  /**
   * Evict the least recently used entry
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey !== null) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Remove all expired entries from the cache
   */
  private cleanExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Save the cache to disk
   */
  save(): void {
    try {
      // Clean expired entries before saving
      this.cleanExpired();

      const data: SerializedCache<T> = {
        entries: Array.from(this.cache.entries()),
        timestamp: Date.now(),
      };

      const serialized = JSON.stringify(data, null, 2);
      fs.writeFileSync(this.persistPath, serialized, 'utf-8');
    } catch (error) {
      console.error('Failed to save cache to disk:', error);
      throw error;
    }
  }

  /**
   * Load the cache from disk
   */
  load(): void {
    try {
      if (!fs.existsSync(this.persistPath)) {
        // File doesn't exist yet, start with empty cache
        return;
      }

      const fileContent = fs.readFileSync(this.persistPath, 'utf-8');
      const data: SerializedCache<T> = JSON.parse(fileContent);

      // Restore entries
      this.cache = new Map(data.entries);

      // Clean any expired entries after loading
      this.cleanExpired();
    } catch (error) {
      console.error('Failed to load cache from disk:', error);
      // Start with empty cache if load fails
      this.cache = new Map();
    }
  }

  /**
   * Ensure the directory for the persist path exists
   */
  private ensureDirectoryExists(): void {
    const dir = path.dirname(this.persistPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    this.cleanExpired();
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export default Cache;