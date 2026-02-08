# Challenge 1 — Email Validation

Goal: build an email validation function using regex that supports common real-world cases:
- plus addressing (e.g., name+tag@gmail.com)
- subdomains (e.g., user@mail.company.co.uk)
- rejects obvious invalid formats
- includes Jest tests and test results for each prompt iteration (v1, v2, v3)

## How to run (from repo root)

1) Install dependencies
```bash
npm install
```

2) Run tests for each version
```bash
# v1 runs with ts-node (simple test runner)
npx ts-node challenge-1-email-validation/v1/code.ts

# v2 and v3 run with Jest
npx jest challenge-1-email-validation/v2/emailValidator.test.ts
npx jest challenge-1-email-validation/v3/emailRegexValidator.test.ts
```

Test results are captured in `test-results.txt` for each version folder.

## What changed across iterations

### v1 - The Baseline Attempt

I started with a simple prompt asking for a TypeScript function with regex and basic test cases. The AI produced everything in a single file (`code.ts`) with code and tests mixed together. The tests were inline using a simple custom runner rather than a proper test framework.

The results were functional but not production-ready: 23 out of 26 tests passed (88.5%). The three failures revealed gaps in the regex logic—it couldn't handle multiple plus signs in the local part, didn't catch consecutive dots, and allowed domains starting with dots. Looking back, the AI gave me the bare minimum. It worked for the happy path but missed the edge cases that matter in real-world validation.

### v2 - Adding Structure and Detail

For the second iteration, I wrote a more explicit prompt asking for separate files and specific edge cases. The AI correctly separated code and tests into different files and used Jest for testing. The test suite grew to 85 cases, and all of them passed initially.

But there was a catch—TypeScript type errors surfaced that required manual iteration to fix. The prompt was clearer about structure but not explicit enough about type safety and comprehensive edge case handling. I still had to go back and forth with the AI to resolve the type issues. It was better than v1, but not the polished result I was aiming for.

### v3 - Getting It Right

The third time around, I used a best-practice prompt emphasizing requirements, edge cases, and structured reasoning. Before writing any code, the AI asked clarifying questions until the requirements were 100% clear. Based on my feedback about what should and shouldn't be accepted, it generated a comprehensive validation implementation.

The results speak for themselves: all 129 tests passed with zero TypeScript errors. The implementation includes proper length constraints (local part ≤ 64 chars, total ≤ 254 chars), configurable options for single-label domains like `user@localhost`, and thorough edge case handling. This is production-ready code that I'd feel comfortable deploying.

## Key Takeaways

Working through these three iterations taught me that prompt clarity directly correlates with code quality. In v1, the AI gave me the minimum viable solution because that's all I asked for. By v3, after iterating on the prompt and allowing the AI to ask clarifying questions, I got a solution that was genuinely production-ready.

The most valuable lesson was the importance of being explicit about requirements and edge cases. In v3, the AI asked specific questions about single-label domains, consecutive special characters, and length constraints before writing a single line of code. That upfront clarification paid off in a comprehensive implementation that didn't require manual fixes.

The progression tells a clear story: from a single-file prototype with test gaps, to a structured solution that needed manual intervention, to a polished module with comprehensive test coverage and zero errors. Each iteration improved because the prompt became more specific and the AI had more context to work with.

## Claude Conversation

You can view the actual conversations with Claude Web for all three versions here:
https://claude.ai/share/cda6843b-8e31-4614-a663-8280a8bc8bd5

This shared conversation shows the prompts I used, the AI's responses, and how the interaction evolved across iterations.

## Code Quality Comparison

Version 1 delivered a basic regex implementation in a single file with a simple test runner. It achieved 88.5% pass rate (23/26 tests) but had notable gaps: multiple plus signs weren't handled, consecutive dots slipped through, and domains could start with dots. It was functional as a prototype but wouldn't hold up in production.

Version 2 improved significantly with proper file separation and Jest integration. All 85 tests passed, and the structure was cleaner with dedicated test files. However, TypeScript type errors required manual fixes, and some edge cases still needed attention. It was a step in the right direction but not quite there.

Version 3 is the production-ready implementation. All 129 tests pass with zero TypeScript errors. The code includes configurable options for single-label domains, comprehensive length constraints, proper handling of special characters at label boundaries, and thorough edge case coverage. This is the version I'd trust in a real application.