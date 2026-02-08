import { Cache } from './cache-ttl-lru';
import * as fs from 'fs';
import * as path from 'path';

describe('Cache', () => {
  const testCachePath = path.join(__dirname, 'test-cache.json');

  // Clean up test file before and after each test
  beforeEach(() => {
    if (fs.existsSync(testCachePath)) {
      fs.unlinkSync(testCachePath);
    }
  });

  afterEach(() => {
    if (fs.existsSync(testCachePath)) {
      fs.unlinkSync(testCachePath);
    }
  });

  describe('Basic Set & Get', () => {
    test('should set and get a value', () => {
      const cache = new Cache<string>({
        persistPath: testCachePath,
        autoSave: false,
      });

      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    test('should return undefined for non-existent key', () => {
      const cache = new Cache<string>({
        persistPath: testCachePath,
        autoSave: false,
      });

      expect(cache.get('nonexistent')).toBeUndefined();
    });

    test('should overwrite existing key', () => {
      const cache = new Cache<string>({
        persistPath: testCachePath,
        autoSave: false,
      });

      cache.set('key1', 'value1');
      cache.set('key1', 'value2');
      expect(cache.get('key1')).toBe('value2');
    });

    test('should handle different data types', () => {
      const cache = new Cache<any>({
        persistPath: testCachePath,
        autoSave: false,
      });

      cache.set('string', 'hello');
      cache.set('number', 42);
      cache.set('boolean', true);
      cache.set('object', { name: 'John' });
      cache.set('array', [1, 2, 3]);

      expect(cache.get('string')).toBe('hello');
      expect(cache.get('number')).toBe(42);
      expect(cache.get('boolean')).toBe(true);
      expect(cache.get('object')).toEqual({ name: 'John' });
      expect(cache.get('array')).toEqual([1, 2, 3]);
    });

    test('should check if key exists with has()', () => {
      const cache = new Cache<string>({
        persistPath: testCachePath,
        autoSave: false,
      });

      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('key2')).toBe(false);
    });

    test('should delete a key', () => {
      const cache = new Cache<string>({
        persistPath: testCachePath,
        autoSave: false,
      });

      cache.set('key1', 'value1');
      expect(cache.delete('key1')).toBe(true);
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.delete('key1')).toBe(false);
    });

    test('should clear all entries', () => {
      const cache = new Cache<string>({
        persistPath: testCachePath,
        autoSave: false,
      });

      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.clear();

      expect(cache.size()).toBe(0);
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBeUndefined();
    });

    test('should return correct size', () => {
      const cache = new Cache<string>({
        persistPath: testCachePath,
        autoSave: false,
      });

      expect(cache.size()).toBe(0);

      cache.set('key1', 'value1');
      expect(cache.size()).toBe(1);

      cache.set('key2', 'value2');
      expect(cache.size()).toBe(2);

      cache.delete('key1');
      expect(cache.size()).toBe(1);
    });

    test('should return all keys', () => {
      const cache = new Cache<string>({
        persistPath: testCachePath,
        autoSave: false,
      });

      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      const keys = cache.keys();
      expect(keys).toHaveLength(3);
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
    });

    test('should return all values', () => {
      const cache = new Cache<string>({
        persistPath: testCachePath,
        autoSave: false,
      });

      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      const values = cache.values();
      expect(values).toHaveLength(3);
      expect(values).toContain('value1');
      expect(values).toContain('value2');
      expect(values).toContain('value3');
    });
  });

  describe('TTL Expiration', () => {
    test('should expire entry after TTL', async () => {
      const cache = new Cache<string>({
        persistPath: testCachePath,
        defaultTTL: 100, // 100ms
        autoSave: false,
      });

      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(cache.get('key1')).toBeUndefined();
      expect(cache.has('key1')).toBe(false);
    });

    test('should respect custom TTL per entry', async () => {
      const cache = new Cache<string>({
        persistPath: testCachePath,
        defaultTTL: 1000,
        autoSave: false,
      });

      cache.set('short', 'value1', 100); // 100ms TTL
      cache.set('long', 'value2', 500);  // 500ms TTL

      // After 150ms, short should be expired but long should exist
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(cache.get('short')).toBeUndefined();
      expect(cache.get('long')).toBe('value2');

      // After another 400ms, long should also be expired
      await new Promise(resolve => setTimeout(resolve, 400));

      expect(cache.get('long')).toBeUndefined();
    });

    test('should clean expired entries from size calculation', async () => {
      const cache = new Cache<string>({
        persistPath: testCachePath,
        defaultTTL: 100,
        autoSave: false,
      });

      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      expect(cache.size()).toBe(2);

      await new Promise(resolve => setTimeout(resolve, 150));

      expect(cache.size()).toBe(0);
    });

    test('should clean expired entries from keys()', async () => {
      const cache = new Cache<string>({
        persistPath: testCachePath,
        defaultTTL: 100,
        autoSave: false,
      });

      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      expect(cache.keys()).toHaveLength(2);

      await new Promise(resolve => setTimeout(resolve, 150));

      expect(cache.keys()).toHaveLength(0);
    });
  });

  describe('LRU Eviction', () => {
    test('should evict least recently used entry when max size reached', () => {
      const cache = new Cache<string>({
        persistPath: testCachePath,
        maxSize: 3,
        autoSave: false,
      });

      cache.set('a', 'value-a');
      cache.set('b', 'value-b');
      cache.set('c', 'value-c');

      // Cache is full, adding 'd' should evict 'a' (least recently used)
      cache.set('d', 'value-d');

      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBe('value-b');
      expect(cache.get('c')).toBe('value-c');
      expect(cache.get('d')).toBe('value-d');
      expect(cache.size()).toBe(3);
    });

    test('should update LRU order on get access', async () => {
      const cache = new Cache<string>({
        persistPath: testCachePath,
        maxSize: 3,
        autoSave: false,
      });

      cache.set('a', 'value-a');
      await new Promise(resolve => setTimeout(resolve, 10));
      
      cache.set('b', 'value-b');
      await new Promise(resolve => setTimeout(resolve, 10));
      
      cache.set('c', 'value-c');
      await new Promise(resolve => setTimeout(resolve, 10));

      // Access 'a' to make it recently used
      cache.get('a');
      await new Promise(resolve => setTimeout(resolve, 10));

      // Add 'd', should evict 'b' now (least recently used)
      cache.set('d', 'value-d');

      expect(cache.get('a')).toBe('value-a');
      expect(cache.get('b')).toBeUndefined();
      expect(cache.get('c')).toBe('value-c');
      expect(cache.get('d')).toBe('value-d');
    });

    test('should handle multiple evictions', () => {
      const cache = new Cache<number>({
        persistPath: testCachePath,
        maxSize: 3,
        autoSave: false,
      });

      // Fill cache
      cache.set('1', 1);
      cache.set('2', 2);
      cache.set('3', 3);

      // Add more items, triggering evictions
      cache.set('4', 4); // evicts '1'
      cache.set('5', 5); // evicts '2'
      cache.set('6', 6); // evicts '3'

      expect(cache.size()).toBe(3);
      expect(cache.keys().sort()).toEqual(['4', '5', '6']);
    });

    test('should not evict when overwriting existing key', () => {
      const cache = new Cache<string>({
        persistPath: testCachePath,
        maxSize: 3,
        autoSave: false,
      });

      cache.set('a', 'value-a');
      cache.set('b', 'value-b');
      cache.set('c', 'value-c');

      // Overwrite 'a', should not trigger eviction
      cache.set('a', 'new-value-a');

      expect(cache.size()).toBe(3);
      expect(cache.get('a')).toBe('new-value-a');
      expect(cache.get('b')).toBe('value-b');
      expect(cache.get('c')).toBe('value-c');
    });

    test('should evict expired entries before LRU', async () => {
      const cache = new Cache<string>({
        persistPath: testCachePath,
        maxSize: 3,
        defaultTTL: 100,
        autoSave: false,
      });

      cache.set('a', 'value-a');
      cache.set('b', 'value-b');
      cache.set('c', 'value-c');

      // Wait for entries to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      // Add new entry - should not trigger LRU eviction because expired entries are cleaned first
      cache.set('d', 'value-d');

      expect(cache.size()).toBe(1);
      expect(cache.get('d')).toBe('value-d');
    });
  });

  describe('File Persistence', () => {
    test('should save cache to file', () => {
      const cache = new Cache<string>({
        persistPath: testCachePath,
        autoSave: false,
      });

      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.save();

      expect(fs.existsSync(testCachePath)).toBe(true);

      const fileContent = fs.readFileSync(testCachePath, 'utf-8');
      const parsed = JSON.parse(fileContent);

      expect(parsed).toHaveProperty('entries');
      expect(parsed).toHaveProperty('timestamp');
      expect(parsed.entries).toHaveLength(2);
    });

    test('should load cache from file on initialization', () => {
      // Create and save cache
      const cache1 = new Cache<string>({
        persistPath: testCachePath,
        autoSave: false,
      });

      cache1.set('key1', 'value1');
      cache1.set('key2', 'value2');
      cache1.save();

      // Create new cache instance, should load from file
      const cache2 = new Cache<string>({
        persistPath: testCachePath,
        autoSave: false,
      });

      expect(cache2.get('key1')).toBe('value1');
      expect(cache2.get('key2')).toBe('value2');
      expect(cache2.size()).toBe(2);
    });

    test('should not load expired entries from file', async () => {
      // Create cache with short TTL
      const cache1 = new Cache<string>({
        persistPath: testCachePath,
        defaultTTL: 100,
        autoSave: false,
      });

      cache1.set('key1', 'value1');
      cache1.save();

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));

      // Load in new cache instance
      const cache2 = new Cache<string>({
        persistPath: testCachePath,
        autoSave: false,
      });

      expect(cache2.get('key1')).toBeUndefined();
      expect(cache2.size()).toBe(0);
    });

    test('should handle missing file gracefully', () => {
      const cache = new Cache<string>({
        persistPath: testCachePath,
        autoSave: false,
      });

      expect(cache.size()).toBe(0);
      expect(() => cache.get('key1')).not.toThrow();
    });

    test('should handle corrupted file gracefully', () => {
      // Write corrupted JSON
      fs.writeFileSync(testCachePath, 'invalid json content', 'utf-8');

      const cache = new Cache<string>({
        persistPath: testCachePath,
        autoSave: false,
      });

      // Should start with empty cache instead of crashing
      expect(cache.size()).toBe(0);
    });

    test('should auto-save when autoSave is enabled', () => {
      const cache = new Cache<string>({
        persistPath: testCachePath,
        autoSave: true,
      });

      cache.set('key1', 'value1');

      // File should exist immediately
      expect(fs.existsSync(testCachePath)).toBe(true);

      // Load in new instance to verify
      const cache2 = new Cache<string>({
        persistPath: testCachePath,
        autoSave: false,
      });

      expect(cache2.get('key1')).toBe('value1');
    });

    test('should persist after delete when autoSave is enabled', () => {
      const cache = new Cache<string>({
        persistPath: testCachePath,
        autoSave: true,
      });

      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.delete('key1');

      // Load in new instance to verify deletion persisted
      const cache2 = new Cache<string>({
        persistPath: testCachePath,
        autoSave: false,
      });

      expect(cache2.get('key1')).toBeUndefined();
      expect(cache2.get('key2')).toBe('value2');
    });

    test('should persist after clear when autoSave is enabled', () => {
      const cache = new Cache<string>({
        persistPath: testCachePath,
        autoSave: true,
      });

      cache.set('key1', 'value1');
      cache.clear();

      // Load in new instance to verify clear persisted
      const cache2 = new Cache<string>({
        persistPath: testCachePath,
        autoSave: false,
      });

      expect(cache2.size()).toBe(0);
    });

    test('should create directory if it does not exist', () => {
      const nestedPath = path.join(__dirname, 'test-dir', 'nested', 'cache.json');

      const cache = new Cache<string>({
        persistPath: nestedPath,
        autoSave: false,
      });

      cache.set('key1', 'value1');
      cache.save();

      expect(fs.existsSync(nestedPath)).toBe(true);

      // Cleanup
      fs.unlinkSync(nestedPath);
      fs.rmdirSync(path.dirname(nestedPath));
      fs.rmdirSync(path.join(__dirname, 'test-dir'));
    });
  });

  describe('Complex Scenarios', () => {
    test('should handle mixed operations correctly', async () => {
      const cache = new Cache<number>({
        persistPath: testCachePath,
        maxSize: 5,
        defaultTTL: 200,
        autoSave: false,
      });

      // Add entries
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      // Access 'a'
      expect(cache.get('a')).toBe(1);

      // Delete 'b'
      cache.delete('b');

      // Add more
      cache.set('d', 4);
      cache.set('e', 5);
      cache.set('f', 6); // Should trigger LRU

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 250));

      // All should be expired
      expect(cache.size()).toBe(0);
    });

    test('should maintain consistency across save/load cycles', () => {
      const data = {
        key1: 'value1',
        key2: { nested: 'object' },
        key3: [1, 2, 3],
        key4: true,
        key5: 42,
      };

      // First cache instance
      const cache1 = new Cache<any>({
        persistPath: testCachePath,
        autoSave: false,
      });

      Object.entries(data).forEach(([key, value]) => {
        cache1.set(key, value);
      });
      cache1.save();

      // Second cache instance
      const cache2 = new Cache<any>({
        persistPath: testCachePath,
        autoSave: false,
      });

      Object.entries(data).forEach(([key, expectedValue]) => {
        expect(cache2.get(key)).toEqual(expectedValue);
      });
    });

    test('should get correct stats', () => {
      const cache = new Cache<string>({
        persistPath: testCachePath,
        maxSize: 10,
        autoSave: false,
      });

      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      const stats = cache.getStats();

      expect(stats.size).toBe(2);
      expect(stats.maxSize).toBe(10);
      expect(stats.keys).toEqual(['key1', 'key2']);
    });
  });
});