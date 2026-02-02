import { Cache } from './Cache';
import * as fs from 'fs';
import * as path from 'path';

describe('Cache', () => {
  const testDir = path.join(__dirname, 'test-cache-data');
  const testFilePath = path.join(testDir, 'cache.json');

  beforeEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    // Clean up after each test
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('Basic Operations', () => {
    test('set and get a value', () => {
      const cache = new Cache<string, string>(testFilePath, 10);
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    test('get returns undefined for non-existent key', () => {
      const cache = new Cache<string, string>(testFilePath, 10);
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    test('set overwrites existing key', () => {
      const cache = new Cache<string, string>(testFilePath, 10);
      cache.set('key1', 'value1');
      cache.set('key1', 'value2');
      expect(cache.get('key1')).toBe('value2');
    });

    test('delete removes a key', () => {
      const cache = new Cache<string, string>(testFilePath, 10);
      cache.set('key1', 'value1');
      expect(cache.delete('key1')).toBe(true);
      expect(cache.get('key1')).toBeUndefined();
    });

    test('delete returns false for non-existent key', () => {
      const cache = new Cache<string, string>(testFilePath, 10);
      expect(cache.delete('nonexistent')).toBe(false);
    });

    test('clear removes all entries', () => {
      const cache = new Cache<string, string>(testFilePath, 10);
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.clear();
      expect(cache.keys()).toEqual([]);
      expect(cache.get('key1')).toBeUndefined();
    });

    test('keys returns all active keys', () => {
      const cache = new Cache<string, string>(testFilePath, 10);
      cache.set('a', 'A');
      cache.set('b', 'B');
      cache.set('c', 'C');
      expect(cache.keys().sort()).toEqual(['a', 'b', 'c']);
    });

    test('handles different value types', () => {
      const cache = new Cache<string, unknown>(testFilePath, 10);
      cache.set('string', 'hello');
      cache.set('number', 42);
      cache.set('boolean', true);
      cache.set('object', { name: 'John', age: 30 });
      cache.set('array', [1, 2, 3]);
      cache.set('null', null);

      expect(cache.get('string')).toBe('hello');
      expect(cache.get('number')).toBe(42);
      expect(cache.get('boolean')).toBe(true);
      expect(cache.get('object')).toEqual({ name: 'John', age: 30 });
      expect(cache.get('array')).toEqual([1, 2, 3]);
      expect(cache.get('null')).toBeNull();
    });
  });

  describe('TTL Expiration', () => {
    test('entry with TTL=0 expires immediately', () => {
      const cache = new Cache<string, string>(testFilePath, 10);
      cache.set('key1', 'value1', 0);
      expect(cache.get('key1')).toBeUndefined();
    });

    test('entry expires after TTL', async () => {
      const cache = new Cache<string, string>(testFilePath, 10);
      cache.set('key1', 'value1', 50); // 50ms TTL

      expect(cache.get('key1')).toBe('value1');

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(cache.get('key1')).toBeUndefined();
    });

    test('entry without TTL and no default never expires', async () => {
      const cache = new Cache<string, string>(testFilePath, 10);
      cache.set('key1', 'value1'); // No TTL

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(cache.get('key1')).toBe('value1');
    });

    test('entry uses default TTL when not specified', async () => {
      const cache = new Cache<string, string>(testFilePath, 10, 50); // 50ms default
      cache.set('key1', 'value1'); // Uses default TTL

      expect(cache.get('key1')).toBe('value1');

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(cache.get('key1')).toBeUndefined();
    });

    test('explicit TTL overrides default TTL', async () => {
      const cache = new Cache<string, string>(testFilePath, 10, 50); // 50ms default
      cache.set('key1', 'value1', 200); // Override with 200ms

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(cache.get('key1')).toBe('value1'); // Still alive
    });

    test('expired entries are removed from keys()', async () => {
      const cache = new Cache<string, string>(testFilePath, 10);
      cache.set('key1', 'value1', 50);
      cache.set('key2', 'value2'); // No expiry

      expect(cache.keys().sort()).toEqual(['key1', 'key2']);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(cache.keys()).toEqual(['key2']);
    });

    test('set operation removes expired entries', async () => {
      const cache = new Cache<string, string>(testFilePath, 10);
      cache.set('key1', 'value1', 50);
      cache.set('key2', 'value2', 50);

      await new Promise(resolve => setTimeout(resolve, 100));

      cache.set('key3', 'value3');

      expect(cache.keys()).toEqual(['key3']);
    });
  });

  describe('LRU Eviction', () => {
    test('evicts least recently used when max size reached', () => {
      const cache = new Cache<string, string>(testFilePath, 3);
      cache.set('a', 'A');
      cache.set('b', 'B');
      cache.set('c', 'C');
      cache.set('d', 'D'); // Should evict 'a'

      expect(cache.get('a')).toBeUndefined();
      expect(cache.keys().sort()).toEqual(['b', 'c', 'd']);
    });

    test('get updates recency and prevents eviction', () => {
      const cache = new Cache<string, string>(testFilePath, 3);
      cache.set('a', 'A');
      cache.set('b', 'B');
      cache.set('c', 'C');

      cache.get('a'); // Make 'a' most recently used

      cache.set('d', 'D'); // Should evict 'b'

      expect(cache.get('a')).toBe('A');
      expect(cache.get('b')).toBeUndefined();
      expect(cache.keys().sort()).toEqual(['a', 'c', 'd']);
    });

    test('set updates recency and prevents eviction', () => {
      const cache = new Cache<string, string>(testFilePath, 3);
      cache.set('a', 'A');
      cache.set('b', 'B');
      cache.set('c', 'C');

      cache.set('a', 'A-updated'); // Update 'a', making it most recent

      cache.set('d', 'D'); // Should evict 'b'

      expect(cache.get('a')).toBe('A-updated');
      expect(cache.get('b')).toBeUndefined();
      expect(cache.keys().sort()).toEqual(['a', 'c', 'd']);
    });

    test('complex access pattern maintains correct LRU order', () => {
      const cache = new Cache<string, number>(testFilePath, 3);
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      cache.get('b'); // b is now most recent
      cache.get('a'); // a is now most recent
      // Order: c (oldest), b, a (newest)

      cache.set('d', 4); // Should evict 'c'

      expect(cache.get('c')).toBeUndefined();
      expect(cache.keys().sort()).toEqual(['a', 'b', 'd']);
    });

    test('overwriting key does not trigger eviction', () => {
      const cache = new Cache<string, string>(testFilePath, 3);
      cache.set('a', 'A');
      cache.set('b', 'B');
      cache.set('c', 'C');

      cache.set('b', 'B-updated'); // Overwrite, should not evict

      expect(cache.keys().sort()).toEqual(['a', 'b', 'c']);
      expect(cache.get('b')).toBe('B-updated');
    });

    test('maxSize=1 only keeps one entry', () => {
      const cache = new Cache<string, string>(testFilePath, 1);
      cache.set('a', 'A');
      expect(cache.keys()).toEqual(['a']);

      cache.set('b', 'B');
      expect(cache.keys()).toEqual(['b']);
      expect(cache.get('a')).toBeUndefined();

      cache.set('c', 'C');
      expect(cache.keys()).toEqual(['c']);
      expect(cache.get('b')).toBeUndefined();
    });

    test('eviction prefers expired entries over LRU', async () => {
      const cache = new Cache<string, string>(testFilePath, 3);
      cache.set('a', 'A', 50); // Will expire
      cache.set('b', 'B');
      cache.set('c', 'C');

      await new Promise(resolve => setTimeout(resolve, 100));

      cache.set('d', 'D'); // Should clean expired 'a' instead of LRU eviction

      expect(cache.get('a')).toBeUndefined();
      expect(cache.keys().sort()).toEqual(['b', 'c', 'd']);
    });
  });

  describe('File Persistence', () => {
    test('creates directory if missing', () => {
      const nestedPath = path.join(testDir, 'nested', 'deep', 'cache.json');
      const cache = new Cache<string, string>(nestedPath, 10);
      cache.set('key1', 'value1');

      expect(fs.existsSync(path.dirname(nestedPath))).toBe(true);
    });

    test('missing file on startup is not an error', () => {
      expect(() => {
        const cache = new Cache<string, string>(testFilePath, 10);
        expect(cache.keys()).toEqual([]);
      }).not.toThrow();
    });

    test('persists data across instances', () => {
      const cache1 = new Cache<string, string>(testFilePath, 10);
      cache1.set('key1', 'value1');
      cache1.set('key2', 'value2');

      const cache2 = new Cache<string, string>(testFilePath, 10);
      expect(cache2.get('key1')).toBe('value1');
      expect(cache2.get('key2')).toBe('value2');
    });

    test('persists complex objects', () => {
      interface User {
        name: string;
        age: number;
        roles: string[];
      }

      const cache1 = new Cache<string, User>(testFilePath, 10);
      cache1.set('user1', { name: 'Alice', age: 30, roles: ['admin'] });

      const cache2 = new Cache<string, User>(testFilePath, 10);
      expect(cache2.get('user1')).toEqual({
        name: 'Alice',
        age: 30,
        roles: ['admin'],
      });
    });

    test('does not load expired entries on startup', async () => {
      const cache1 = new Cache<string, string>(testFilePath, 10);
      cache1.set('key1', 'value1', 50); // 50ms TTL

      await new Promise(resolve => setTimeout(resolve, 100));

      const cache2 = new Cache<string, string>(testFilePath, 10);
      expect(cache2.get('key1')).toBeUndefined();
      expect(cache2.keys()).toEqual([]);
    });

    test('handles corrupted JSON gracefully', () => {
      fs.mkdirSync(testDir, { recursive: true });
      fs.writeFileSync(testFilePath, 'invalid json {{{', 'utf-8');

      const cache = new Cache<string, string>(testFilePath, 10);
      expect(cache.keys()).toEqual([]);

      // Cache should still work after recovery
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    test('handles partially written JSON gracefully', () => {
      fs.mkdirSync(testDir, { recursive: true });
      fs.writeFileSync(testFilePath, '{"entries": {"key1":', 'utf-8');

      const cache = new Cache<string, string>(testFilePath, 10);
      expect(cache.keys()).toEqual([]);
    });

    test('handles invalid cache structure gracefully', () => {
      fs.mkdirSync(testDir, { recursive: true });
      fs.writeFileSync(
        testFilePath,
        JSON.stringify({ wrongField: 'value' }),
        'utf-8'
      );

      const cache = new Cache<string, string>(testFilePath, 10);
      expect(cache.keys()).toEqual([]);
    });

    test('clear writes empty object to file', () => {
      const cache = new Cache<string, string>(testFilePath, 10);
      cache.set('key1', 'value1');
      cache.clear();

      expect(fs.existsSync(testFilePath)).toBe(true);

      const content = JSON.parse(fs.readFileSync(testFilePath, 'utf-8'));
      expect(content).toEqual({ entries: {} });
    });

    test('delete persists immediately', () => {
      const cache1 = new Cache<string, string>(testFilePath, 10);
      cache1.set('key1', 'value1');
      cache1.set('key2', 'value2');
      cache1.delete('key1');

      const cache2 = new Cache<string, string>(testFilePath, 10);
      expect(cache2.get('key1')).toBeUndefined();
      expect(cache2.get('key2')).toBe('value2');
    });

    test('set persists immediately', () => {
      const cache1 = new Cache<string, string>(testFilePath, 10);
      cache1.set('key1', 'value1');

      const cache2 = new Cache<string, string>(testFilePath, 10);
      expect(cache2.get('key1')).toBe('value1');
    });

    test('multiple reloads maintain consistency', () => {
      const cache1 = new Cache<string, number>(testFilePath, 10);
      cache1.set('x', 100);

      const cache2 = new Cache<string, number>(testFilePath, 10);
      cache2.set('y', 200);

      const cache3 = new Cache<string, number>(testFilePath, 10);
      expect(cache3.get('x')).toBe(100);
      expect(cache3.get('y')).toBe(200);

      cache3.set('z', 300);

      const cache4 = new Cache<string, number>(testFilePath, 10);
      expect(cache4.keys().sort()).toEqual(['x', 'y', 'z']);
    });
  });

  describe('Error Handling', () => {
    test('throws error for unserializable values', () => {
      const cache = new Cache<string, unknown>(testFilePath, 10);

      const circular: Record<string, unknown> = {};
      circular.self = circular;

      expect(() => cache.set('circular', circular)).toThrow();
    });

    test('throws error for function values', () => {
      const cache = new Cache<string, unknown>(testFilePath, 10);

      expect(() => cache.set('func', () => 'hello')).toThrow();
    });

    test('cache remains usable after serialization error', () => {
      const cache = new Cache<string, unknown>(testFilePath, 10);
      cache.set('valid', 'value1');

      const circular: Record<string, unknown> = {};
      circular.self = circular;

      expect(() => cache.set('circular', circular)).toThrow();

      expect(cache.get('valid')).toBe('value1');
      cache.set('valid2', 'value2');
      expect(cache.get('valid2')).toBe('value2');
    });
  });

  describe('Edge Cases', () => {
    test('handles very short TTL correctly', async () => {
      const cache = new Cache<string, string>(testFilePath, 10);
      cache.set('key1', 'value1', 1); // 1ms TTL

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(cache.get('key1')).toBeUndefined();
    });

    test('maxSize=1 with overwrite works correctly', () => {
      const cache = new Cache<string, string>(testFilePath, 1);
      cache.set('key1', 'value1');
      cache.set('key1', 'value2'); // Overwrite

      expect(cache.keys()).toEqual(['key1']);
      expect(cache.get('key1')).toBe('value2');
    });

    test('empty key string is valid', () => {
      const cache = new Cache<string, string>(testFilePath, 10);
      cache.set('', 'empty-key-value');
      expect(cache.get('')).toBe('empty-key-value');
      expect(cache.keys()).toContain('');
    });

    test('special characters in keys', () => {
      const cache = new Cache<string, string>(testFilePath, 10);
      const specialKeys = [
        'key with spaces',
        'key/with/slashes',
        'key.with.dots',
        'key-with-dashes',
        'key_with_underscores',
      ];

      specialKeys.forEach(key => {
        cache.set(key, `value-${key}`);
      });

      specialKeys.forEach(key => {
        expect(cache.get(key)).toBe(`value-${key}`);
      });
    });

    test('large number of entries', () => {
      const cache = new Cache<string, number>(testFilePath, 1000);

      for (let i = 0; i < 1000; i++) {
        cache.set(`key${i}`, i);
      }

      expect(cache.keys().length).toBe(1000);

      const cache2 = new Cache<string, number>(testFilePath, 1000);
      expect(cache2.keys().length).toBe(1000);

      for (let i = 0; i < 1000; i++) {
        expect(cache2.get(`key${i}`)).toBe(i);
      }
    });

    test('get does not trigger save', () => {
      const cache = new Cache<string, string>(testFilePath, 10);
      cache.set('key1', 'value1');

      const statBefore = fs.statSync(testFilePath);
      
      // Small delay to ensure timestamp would change
      const start = Date.now();
      while (Date.now() - start < 10) {
        // busy wait
      }

      cache.get('key1'); // Should not save

      const statAfter = fs.statSync(testFilePath);
      expect(statAfter.mtimeMs).toBe(statBefore.mtimeMs);
    });
  });
});