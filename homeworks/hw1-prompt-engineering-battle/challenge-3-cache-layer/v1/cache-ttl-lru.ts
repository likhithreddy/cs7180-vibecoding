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
  persistPath?: string;
  useLocalStorage?: boolean;
}

export class Cache<T = any> {
  private cache: Map<string, CacheEntry<T>>;
  private maxSize: number;
  private defaultTTL: number;
  private persistPath?: string;
  private useLocalStorage: boolean;
  private readonly STORAGE_KEY = 'ts-cache-data';

  constructor(options: CacheOptions = {}) {
    this.cache = new Map();
    this.maxSize = options.maxSize || 100;
    this.defaultTTL = options.defaultTTL || 3600000; // 1 hour default
    this.persistPath = options.persistPath;
    this.useLocalStorage = options.useLocalStorage ?? this.isBrowser();
    
    // Auto-load on initialization
    this.load();
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  set(key: string, value: T, ttl?: number): void {
    // Check if we need to evict
    if (!this.cache.has(key) && this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    const expiryTime = ttl || this.defaultTTL;
    const entry: CacheEntry<T> = {
      value,
      expiry: Date.now() + expiryTime,
      lastAccessed: Date.now(),
    };

    this.cache.set(key, entry);
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }

    // Check if expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return undefined;
    }

    // Update last accessed time (LRU)
    entry.lastAccessed = Date.now();
    return entry.value;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    // Check if expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    this.cleanExpired();
    return this.cache.size;
  }

  keys(): string[] {
    this.cleanExpired();
    return Array.from(this.cache.keys());
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

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

  save(): void {
    this.cleanExpired();
    
    const data = Array.from(this.cache.entries());
    const serialized = JSON.stringify(data);

    if (this.useLocalStorage && this.isBrowser()) {
      try {
        localStorage.setItem(this.STORAGE_KEY, serialized);
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
    } else if (this.persistPath) {
      try {
        const dir = path.dirname(this.persistPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(this.persistPath, serialized, 'utf-8');
      } catch (error) {
        console.error('Failed to save to file:', error);
      }
    }
  }

  load(): void {
    let serialized: string | null = null;

    if (this.useLocalStorage && this.isBrowser()) {
      try {
        serialized = localStorage.getItem(this.STORAGE_KEY);
      } catch (error) {
        console.error('Failed to load from localStorage:', error);
      }
    } else if (this.persistPath) {
      try {
        if (fs.existsSync(this.persistPath)) {
          serialized = fs.readFileSync(this.persistPath, 'utf-8');
        }
      } catch (error) {
        console.error('Failed to load from file:', error);
      }
    }

    if (serialized) {
      try {
        const data = JSON.parse(serialized) as [string, CacheEntry<T>][];
        this.cache = new Map(data);
        this.cleanExpired();
      } catch (error) {
        console.error('Failed to parse cache data:', error);
      }
    }
  }

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