# Version 3 Prompt
You are a senior TypeScript engineer and test author. You produce production-ready, fully typed, zero-error TypeScript code. All output must compile cleanly with no TypeScript type errors.
Prepare to implement a fully persistent caching layer in TypeScript using file-based persistence (JSON file on disk).  
Do not output any code yet.

Below are all the requirements that must be satisfied. I repeat: “ALL REQUIREMENTS SHOULD BE SATISFIED.”

- Supported Operations: The cache must support the following strongly typed operations:  
  - `set(key, value, ttl?)` — store a value with optional TTL (in milliseconds)  
  - `get(key)` — retrieve a value and update its recency  
  - `delete(key)` — remove a key  
  - `clear()` — remove all keys  
  - `keys()` — list all active, non-expired keys  
- TTL Enforcement: TTL must be enforced using timestamp checks. No background timers. Expired entries must be removed automatically on any read/write.
- LRU Eviction: When the cache exceeds the maximum allowed size, the least-recently-used entry must be evicted.  
  Accessing an item must update its recency ordering.
- Persistence to File: Persistence must save the full cache state (values, TTLs, expiration timestamps, and LRU ordering) into a `.json` file. On startup, the cache must reload and restore state from the file. Expired entries must be removed immediately after loading. Corrupted or invalid JSON files must be handled gracefully with automatic reset. File writes must be atomic (write temp file → replace original).  

About handling errors, you must correctly handle corrupted or partially written JSON persistence files, invalid TTL values, missing directories, read/write errors using graceful fallbacks, attempts to store unserializable values. The final implementation must contain zero TypeScript type errors, no implicit `any`, no unused variables, an explicit and strongly typed `CacheEntry` type, a generic class definition: `class Cache<K extends string, V>`, properly typed return values for all methods, descriptive comments for each public method  

Write a comprehensive Jest test suite (TypeScript) covering all of the following setting, retrieving, and deleting keys, TTL expiration (before and after reload), LRU eviction logic under various access patterns, persistence across multiple reloads, behavior with corrupted JSON persistence files, behavior with maximum size = 1, behavior with TTL = 0 or extremely short, clearing the cache removes the file contents. Tests must be robust and realistic, not superficial.

When I say “begin coding”, return exactly TWO FILES with no explanation or extra commentary:

1. `Cache.ts` — the complete implementation  
2. `Cache.test.ts` — the complete Jest test suite  

Both must be strict, clean, self-contained, and production-ready.

Before writing any code, you must ask all clarifying questions if ANY requirement is ambiguous. Ask until you are absolutely certain. Do NOT produce any code until I explicitly respond “begin coding.”