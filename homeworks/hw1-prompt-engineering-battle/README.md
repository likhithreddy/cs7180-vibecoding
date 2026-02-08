# CS7180: Prompt Engineering Study

This repository contains a comprehensive study on prompt engineering, analyzing how prompt structure and specificity impact code quality through three implementation challenges.

## Overview

This assignment explored prompt engineering techniques by implementing the same challenges multiple times with iterative prompt improvements. Each challenge was completed three times (v1, v2, v3), with each iteration using a more refined prompt to observe the impact on code quality, test coverage, and production-readiness.

## Challenges

### [Challenge 1: Email Validation](challenge-1-email-validation/)

Implementation of an email validation function using regex with support for plus addressing and subdomains.

- **v1**: 15-word prompt → 88.5% test pass rate
- **v2**: 88-word prompt → 100% pass rate (with TypeScript errors)
- **v3**: 230-word prompt → 100% pass rate, zero TypeScript errors

### [Challenge 2: Data Table](challenge-2-data-table/)

React + TypeScript data table with sorting, filtering, and pagination capabilities.

- **v1**: 24-word prompt → Basic functional table
- **v2**: 100-word prompt → Themed Marvel characters table
- **v3**: 350-word prompt → Enterprise-grade SHIELD database with WAI-ARIA compliance

### [Challenge 3: Cache Layer](challenge-3-cache-layer/)

TypeScript caching layer with TTL expiration, LRU eviction, and file-based persistence.

- **v1**: 1-line prompt → 22/22 tests passing
- **v2**: 5-line prompt ~35 tests
- **v3**: 30-line prompt → 43/43 tests passing with atomic writes and crash recovery

## Key Learnings

### What Makes a Great Prompt

[Read the full analysis](what-makes-a-great-prompt.md) for insights on:

- **Specificity**: Direct correlation between prompt detail and output quality
- **Role Definition**: Establishing expertise level influences code quality
- **Quantification**: Exact numbers produce precise results
- **Structured Requirements**: Consistent sections ensure comprehensive coverage
- **Clarification Protocol**: Asking questions before coding reduces iterations

### Prompt Template

[View the reusable template](personal-prompt-template.md) that produced production-ready code across all three challenges.

## Running the Code

### Challenge 1 & 3 (TypeScript + Jest)

```bash
npm install

# Email Validation
npx ts-node challenge-1-email-validation/v1/code.ts
npx jest challenge-1-email-validation/v2/emailValidator.test.ts
npx jest challenge-1-email-validation/v3/emailRegexValidator.test.ts

# Cache Layer
npx ts-node challenge-3-cache-layer/v1/cache-ttl-lru.ts
npx jest challenge-3-cache-layer/v2/cache-jest.test.ts
npx jest challenge-3-cache-layer/v3/Cache.test.ts
```

### Challenge 2 (React Artifacts)

React artifacts are designed to run in Claude Artifacts or similar React environments (CodeSandbox, StackBlitz). No build steps required.

## Project Structure

```
.
├── challenge-1-email-validation/
│   ├── v1/    # Baseline implementation
│   ├── v2/    # Structured implementation
│   └── v3/    # Production-ready implementation
├── challenge-2-data-table/
│   ├── v1/    # Basic table
│   ├── v2/    # Themed table
│   └── v3/    # Enterprise-grade component
├── challenge-3-cache-layer/
│   ├── v1/    # Basic cache
│   ├── v2/    # Structured cache
│   └── v3/    # Production-ready cache
├── what-makes-a-great-prompt.md    # Analysis and insights
├── personal-prompt-template.md     # Reusable template
└── README.md                       # This file
```

## Conclusion

This study demonstrates that effective prompt engineering is fundamentally about clear communication of requirements, context, and constraints. The practices that produced the best results—specificity, quantification, role definition, structured requirements, and clarification protocols—are communication principles applied to AI interaction.

As AI tools become more integrated into development workflows, the ability to craft effective prompts will be an essential skill for software engineers.
