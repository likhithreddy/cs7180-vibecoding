# Challenge 3 — Cache Layer

Goal: build a production-ready caching layer in TypeScript with comprehensive features:
- time-to-live (TTL) expiration with automatic cleanup
- least-recently-used (LRU) eviction when cache reaches maximum size
- file-based persistence with atomic writes and crash recovery
- includes Jest tests and test results for each prompt iteration (v1, v2, v3)

## How to run (from repo root)

1) Install dependencies
```bash
npm install
```

2) Run tests for each version
```bash
# v1 runs with ts-node (simple test runner)
npx ts-node challenge-3-cache-layer/v1/cache-ttl-lru.ts

# v2 runs with Jest
npx jest challenge-3-cache-layer/v2/cache-jest.test.ts

# v3 runs with Jest
npx jest challenge-3-cache-layer/v3/Cache.test.ts
```

Test results are captured in `test-results.txt` for each version folder.

## What changed across iterations

### v1 - The Baseline Attempt

I started with a minimal single-line prompt asking for a caching layer with TTL, LRU eviction, and browser compatibility. The AI produced a single mixed file with implementation and tests combined, using a simple custom test runner instead of Jest. The code supported both file and localStorage persistence with automatic environment detection.

The results were surprisingly solid: 22 out of 22 tests passed (100%). The implementation included basic TTL with timestamp checking, LRU eviction using `Date.now()` for recency tracking, and dual persistence modes. However, it lacked auto-save on mutations, used a basic timestamp-based LRU that could have race conditions, and the custom test runner wasn't as robust as a proper testing framework.

### v2 - Structured Jest Implementation

For the second iteration, I wrote a more detailed prompt explicitly requesting separate implementation and test files, plus a Jest test suite. The AI correctly separated concerns into distinct files and introduced auto-save functionality. The test suite grew to approximately 35 comprehensive tests covering all major features.

The implementation added several improvements: a `values()` method for retrieving all cached values, JSDoc comments for documentation, stronger typing with explicit interfaces, and auto-save triggered on mutations. However, the test-results.txt file was empty, suggesting the tests may not have been run or captured properly. The LRU still used `Date.now()` timestamps rather than a monotonic counter, and file persistence wasn't atomic.

### v3 - Production-Ready Implementation

The third iteration used a comprehensive 30-line prompt with explicit requirements, edge case handling, and an instruction to ask clarifying questions before coding. The AI asked about TTL=0 behavior, Infinity serialization, and atomic write guarantees before generating any code. This upfront clarification resulted in a genuinely production-ready implementation.

The results are comprehensive: 43 out of 43 tests passed (100%) with zero TypeScript errors. Key production features include: monotonic LRU counter for precise ordering, atomic file writes using temp file + rename, TTL=0 support for immediate expiration, Infinity serialization for non-expiring entries, graceful handling of corrupted JSON, and validation of unserializable values. This is the version I'd trust in a real application.

## Key Takeaways

Working through these three iterations demonstrated that prompt specificity has a direct impact on production-readiness. In v1, the AI delivered a functional prototype because that's all I asked for. By v3, after providing explicit requirements about error handling, atomic operations, and edge cases, I got a solution that handles real-world failure scenarios gracefully.

The most valuable insight was the power of requiring clarifying questions before code generation. In v3, the AI asked about TTL=0 semantics, Infinity handling in JSON, and atomic write guarantees before writing a single line. That upfront clarification prevented multiple rounds of fixes and resulted in comprehensive test coverage that included corrupted JSON handling, unserializable value detection, and crash recovery.

The progression tells a clear story: from a single-file prototype with a custom test runner, to a structured solution with proper separation of concerns, to a production-ready implementation with atomic persistence, graceful degradation, and comprehensive error handling. Each iteration improved because the prompt became more explicit about what production-ready actually means.

## Claude Conversation

You can view the actual conversations with Claude Web for all three versions here:
https://claude.ai/share/f3907b5e-5368-4d4c-a26a-bb25dfa58797

This shared conversation shows the prompts I used, the AI's responses, and how the interaction evolved across iterations.

## Code Quality Comparison

Version 1 delivered a functional caching layer in a single file with a custom test runner. All 22 tests passed (100%), covering basic operations, TTL expiration, LRU eviction, and persistence to both file and localStorage. However, it used `Date.now()` for LRU tracking (susceptible to clock changes), lacked auto-save on mutations, and the custom test runner wasn't as robust as Jest. It worked as a prototype but wouldn't handle production failure scenarios.

Version 2 improved significantly with proper file separation and Jest integration. The test suite expanded to approximately 35 tests, and the implementation added auto-save, JSDoc documentation, and a `values()` method. However, the test results weren't properly captured, and the core LRU implementation still used timestamp-based tracking rather than a monotonic counter. File writes weren't atomic, creating potential for data loss on crashes.

Version 3 is the production-ready implementation. All 43 tests pass (100%) with zero TypeScript errors. The code uses a monotonic access counter for precise LRU ordering, implements atomic file writes with temp file + rename, handles TTL=0 for immediate expiration, serializes Infinity for non-expiring entries, validates unserializable values before caching, and gracefully recovers from corrupted JSON files. This is the version I'd trust in a real application.
