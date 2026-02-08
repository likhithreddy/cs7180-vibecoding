import { Cache } from './cache-ttl-lru';
import * as fs from 'fs';
import * as path from 'path';

// Test utility functions
function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEquals<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}\nExpected: ${expected}\nActual: ${actual}`);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test Suite
class CacheTestSuite {
  private testsPassed = 0;
  private testsFailed = 0;
  private testPath = path.join(__dirname, 'test-cache.json');

  async runAll(): Promise<void> {
    console.log('🧪 Running Cache Test Suite\n');

    // Basic operations
    await this.runTest('Basic set and get', () => this.testBasicSetGet());
    await this.runTest('Get non-existent key', () => this.testGetNonExistent());
    await this.runTest('Has method', () => this.testHasMethod());
    await this.runTest('Delete method', () => this.testDelete());
    await this.runTest('Clear method', () => this.testClear());
    await this.runTest('Size method', () => this.testSize());
    await this.runTest('Keys method', () => this.testKeys());

    // TTL tests
    await this.runTest('TTL expiration', () => this.testTTLExpiration());
    await this.runTest('Custom TTL per entry', () => this.testCustomTTL());
    await this.runTest('Expired entry cleanup', () => this.testExpiredCleanup());

    // LRU tests
    await this.runTest('LRU eviction on max size', () => this.testLRUEviction());
    await this.runTest('LRU updates on access', () => this.testLRUAccess());
    await this.runTest('LRU with mixed access patterns', () => this.testLRUMixed());

    // Persistence tests
    await this.runTest('File persistence save', () => this.testFileSave());
    await this.runTest('File persistence load', () => this.testFileLoad());
    await this.runTest('Persistence with expired entries', () => this.testPersistenceExpired());

    // Edge cases
    await this.runTest('Empty cache operations', () => this.testEmptyCache());
    await this.runTest('Overwrite existing key', () => this.testOverwrite());
    await this.runTest('Large values', () => this.testLargeValues());
    await this.runTest('Special characters in keys', () => this.testSpecialKeys());

    // Complex scenarios
    await this.runTest('Mixed operations', () => this.testMixedOperations());
    await this.runTest('Concurrent access simulation', () => this.testConcurrentAccess());

    this.printSummary();
    this.cleanup();
  }

  private async runTest(name: string, testFn: () => void | Promise<void>): Promise<void> {
    try {
      await testFn();
      console.log(`✅ ${name}`);
      this.testsPassed++;
    } catch (error) {
      console.log(`❌ ${name}`);
      console.log(`   Error: ${(error as Error).message}\n`);
      this.testsFailed++;
    }
  }

  // Basic Operations Tests
  testBasicSetGet(): void {
    const cache = new Cache<string>({ useLocalStorage: false });
    cache.set('key1', 'value1');
    assertEquals(cache.get('key1'), 'value1', 'Should get the correct value');
  }

  testGetNonExistent(): void {
    const cache = new Cache<string>({ useLocalStorage: false });
    assertEquals(cache.get('nonexistent'), undefined, 'Should return undefined for non-existent key');
  }

  testHasMethod(): void {
    const cache = new Cache<string>({ useLocalStorage: false });
    cache.set('key1', 'value1');
    assert(cache.has('key1'), 'Should return true for existing key');
    assert(!cache.has('key2'), 'Should return false for non-existent key');
  }

  testDelete(): void {
    const cache = new Cache<string>({ useLocalStorage: false });
    cache.set('key1', 'value1');
    assert(cache.delete('key1'), 'Delete should return true');
    assertEquals(cache.get('key1'), undefined, 'Deleted key should not exist');
    assert(!cache.delete('key1'), 'Delete should return false for non-existent key');
  }

  testClear(): void {
    const cache = new Cache<string>({ useLocalStorage: false });
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.clear();
    assertEquals(cache.size(), 0, 'Cache should be empty after clear');
  }

  testSize(): void {
    const cache = new Cache<string>({ useLocalStorage: false });
    assertEquals(cache.size(), 0, 'Initial size should be 0');
    cache.set('key1', 'value1');
    assertEquals(cache.size(), 1, 'Size should be 1 after adding one item');
    cache.set('key2', 'value2');
    assertEquals(cache.size(), 2, 'Size should be 2 after adding two items');
  }

  testKeys(): void {
    const cache = new Cache<string>({ useLocalStorage: false });
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    const keys = cache.keys();
    assert(keys.includes('key1'), 'Keys should include key1');
    assert(keys.includes('key2'), 'Keys should include key2');
    assertEquals(keys.length, 2, 'Should have 2 keys');
  }

  // TTL Tests
  async testTTLExpiration(): Promise<void> {
    const cache = new Cache<string>({ defaultTTL: 100, useLocalStorage: false });
    cache.set('key1', 'value1');
    assertEquals(cache.get('key1'), 'value1', 'Should get value before expiration');
    
    await sleep(150);
    
    assertEquals(cache.get('key1'), undefined, 'Should return undefined after expiration');
  }

  async testCustomTTL(): Promise<void> {
    const cache = new Cache<string>({ defaultTTL: 1000, useLocalStorage: false });
    cache.set('key1', 'value1', 100); // 100ms TTL
    cache.set('key2', 'value2', 500); // 500ms TTL
    
    await sleep(150);
    
    assertEquals(cache.get('key1'), undefined, 'key1 should be expired');
    assertEquals(cache.get('key2'), 'value2', 'key2 should still exist');
    
    await sleep(400);
    
    assertEquals(cache.get('key2'), undefined, 'key2 should now be expired');
  }

  async testExpiredCleanup(): Promise<void> {
    const cache = new Cache<string>({ defaultTTL: 100, useLocalStorage: false });
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    
    await sleep(150);
    
    assertEquals(cache.size(), 0, 'Size should be 0 after all entries expired');
  }

  // LRU Tests
  testLRUEviction(): void {
    const cache = new Cache<string>({ maxSize: 3, useLocalStorage: false });
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.set('key3', 'value3');
    
    // key1 is the oldest, should be evicted
    cache.set('key4', 'value4');
    
    assertEquals(cache.get('key1'), undefined, 'Oldest key should be evicted');
    assertEquals(cache.get('key4'), 'value4', 'Newest key should exist');
    assertEquals(cache.size(), 3, 'Size should remain at max');
  }

  async testLRUAccess(): Promise<void> {
    const cache = new Cache<string>({ maxSize: 3, useLocalStorage: false });
    cache.set('key1', 'value1');
    await sleep(10);
    cache.set('key2', 'value2');
    await sleep(10);
    cache.set('key3', 'value3');
    await sleep(10);
    
    // Access key1, making it recently used
    cache.get('key1');
    await sleep(10);
    
    // Add key4, should evict key2 (least recently used)
    cache.set('key4', 'value4');
    
    assertEquals(cache.get('key1'), 'value1', 'Recently accessed key should not be evicted');
    assertEquals(cache.get('key2'), undefined, 'Least recently used key should be evicted');
  }

  async testLRUMixed(): Promise<void> {
    const cache = new Cache<string>({ maxSize: 3, useLocalStorage: false });
    cache.set('a', '1');
    await sleep(10);
    cache.set('b', '2');
    await sleep(10);
    cache.set('c', '3');
    await sleep(10);
    
    cache.get('a'); // Access 'a'
    await sleep(10);
    cache.get('b'); // Access 'b'
    await sleep(10);
    
    cache.set('d', '4'); // Should evict 'c'
    
    assert(cache.has('a'), 'a should exist');
    assert(cache.has('b'), 'b should exist');
    assert(!cache.has('c'), 'c should be evicted');
    assert(cache.has('d'), 'd should exist');
  }

  // Persistence Tests
  testFileSave(): void {
    const cache = new Cache<string>({ 
      persistPath: this.testPath,
      useLocalStorage: false 
    });
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.save();
    
    assert(fs.existsSync(this.testPath), 'Cache file should be created');
  }

  testFileLoad(): void {
    const cache1 = new Cache<string>({ 
      persistPath: this.testPath,
      useLocalStorage: false 
    });
    cache1.set('key1', 'value1');
    cache1.set('key2', 'value2');
    cache1.save();
    
    const cache2 = new Cache<string>({ 
      persistPath: this.testPath,
      useLocalStorage: false 
    });
    
    assertEquals(cache2.get('key1'), 'value1', 'Should load key1');
    assertEquals(cache2.get('key2'), 'value2', 'Should load key2');
  }

  async testPersistenceExpired(): Promise<void> {
    const cache1 = new Cache<string>({ 
      persistPath: this.testPath,
      defaultTTL: 100,
      useLocalStorage: false 
    });
    cache1.set('key1', 'value1');
    cache1.save();
    
    await sleep(150);
    
    const cache2 = new Cache<string>({ 
      persistPath: this.testPath,
      useLocalStorage: false 
    });
    
    assertEquals(cache2.get('key1'), undefined, 'Expired entries should not be loaded');
  }

  // Edge Cases
  testEmptyCache(): void {
    const cache = new Cache<string>({ useLocalStorage: false });
    assertEquals(cache.size(), 0, 'Empty cache size should be 0');
    assertEquals(cache.keys().length, 0, 'Empty cache should have no keys');
    cache.clear(); // Should not throw
    cache.save(); // Should not throw
  }

  testOverwrite(): void {
    const cache = new Cache<string>({ useLocalStorage: false });
    cache.set('key1', 'value1');
    cache.set('key1', 'value2');
    assertEquals(cache.get('key1'), 'value2', 'Value should be overwritten');
    assertEquals(cache.size(), 1, 'Size should remain 1');
  }

  testLargeValues(): void {
    const cache = new Cache<object>({ useLocalStorage: false });
    const largeValue = { data: 'x'.repeat(10000) };
    cache.set('large', largeValue);
    assertEquals(cache.get('large'), largeValue, 'Should handle large values');
  }

  testSpecialKeys(): void {
    const cache = new Cache<string>({ useLocalStorage: false });
    const specialKeys = ['key with spaces', 'key/with/slashes', 'key.with.dots', ''];
    
    specialKeys.forEach(key => {
      cache.set(key, 'value');
      assertEquals(cache.get(key), 'value', `Should handle key: "${key}"`);
    });
  }

  // Complex Scenarios
  async testMixedOperations(): Promise<void> {
    const cache = new Cache<number>({ 
      maxSize: 5, 
      defaultTTL: 200,
      useLocalStorage: false 
    });
    
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);
    
    assertEquals(cache.get('a'), 1, 'Initial set should work');
    
    cache.delete('b');
    assert(!cache.has('b'), 'Deleted key should not exist');
    
    cache.set('d', 4);
    cache.set('e', 5);
    cache.set('f', 6);
    
    // Should trigger LRU eviction
    assertEquals(cache.size(), 5, 'Size should be at max');
    
    await sleep(250);
    
    assertEquals(cache.size(), 0, 'All entries should be expired');
  }

  async testConcurrentAccess(): Promise<void> {
    const cache = new Cache<number>({ 
      maxSize: 10,
      useLocalStorage: false 
    });
    
    // Simulate concurrent operations
    const operations = [];
    for (let i = 0; i < 20; i++) {
      operations.push(
        (async () => {
          cache.set(`key${i}`, i);
          await sleep(Math.random() * 10);
          cache.get(`key${i % 10}`);
        })()
      );
    }
    
    await Promise.all(operations);
    
    assert(cache.size() <= 10, 'Size should not exceed max');
  }

  private printSummary(): void {
    console.log('\n' + '='.repeat(50));
    console.log('Test Summary:');
    console.log(`  Passed: ${this.testsPassed}`);
    console.log(`  Failed: ${this.testsFailed}`);
    console.log(`  Total:  ${this.testsPassed + this.testsFailed}`);
    console.log('='.repeat(50));
    
    if (this.testsFailed === 0) {
      console.log('\n🎉 All tests passed!');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the output above.');
    }
  }

  private cleanup(): void {
    try {
      if (fs.existsSync(this.testPath)) {
        fs.unlinkSync(this.testPath);
      }
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }
}

// Run tests
const suite = new CacheTestSuite();
suite.runAll().catch(console.error);