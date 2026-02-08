# Version 2 Prompt
Write a reliable TypeScript caching layer with time-to-live (TTL) expiration, least-recently-used (LRU) eviction when the cache reaches a maximum size, and persistence to a JSON file on disk.
The cache should support storing key–value pairs, automatically remove expired items based on TTL, and evict the least recently used entries when full. It should reload the cache from the file at startup and save updates back to the file whenever the cache changes.
Add a simple test suite using Jest that covers basic set & get behavior, TTL expiration, LRU eviction when max size is reached, file persistence across reloads
Just return the TypeScript implementation and the Jest tests in separate files.