# Personal Prompt Template

This template presents the patterns that consistently produced production-ready code across the email validation, data table, and cache layer challenges.

## Template Structure

```
You are a [ROLE] specializing in [DOMAIN]. You produce [QUALITY STANDARDS]. All output must compile cleanly with zero errors.

Prepare to implement [TASK/BRIEF DESCRIPTION].
Do not output any code yet.

---

## REQUIREMENTS

Below are all the requirements that must be satisfied. I repeat: "ALL REQUIREMENTS SHOULD BE SATISFIED."

### Functional Requirements
- [List exactly what the feature must do]
- [Be specific about behavior, not just functionality]
- [Include any configuration options or parameters]

### Technical Constraints
- [Technology stack restrictions]
- [Performance requirements]
- [Architecture patterns to follow]

### Edge Cases & Error Handling
- [Explicitly list edge cases the AI might miss]
- [Define error handling behavior]
- [Specify what should happen with invalid inputs]

---

## TESTING & VALIDATION

Write a [TEST FRAMEWORK] test suite covering:
- [Quantified test requirements - exact numbers, not "some"]
- [Specific edge cases to test]
- [Integration scenarios]

---

## OUTPUT FORMAT

When I say "begin coding", return exactly:
1. [FILENAME] — [description]
2. [FILENAME] — [description]

No explanation or extra commentary outside code blocks.

---

## CLARIFICATION PROTOCOL

Before writing any code, you must ask all clarifying questions if ANY requirement is ambiguous.
Ask until you are absolutely certain.
Do NOT produce any code until I explicitly respond "begin coding".
```

---

## Rationale for Each Section

### Role & Context Setting

Establishing the AI's role sets expectations about code quality, architectural decisions, and professional standards. The prompt examples that began with "You are a senior TypeScript engineer" produced more defensive programming, better error handling, and adherence to industry best practices compared to prompts without role definition.

### Task Definition

Before diving into detailed requirements, establishing what is being built provides necessary context. This high-level description helps the AI understand the scope and purpose before processing detailed specifications.

### Technical Constraints

Explicitly stating technology restrictions, performance requirements, and architecture patterns prevents incorrect assumptions. For example, specifying "no external libraries" led to zero-dependency implementations. Specifying "WAI-ARIA compliance" resulted in full accessibility support.

### Functional Requirements

This section enumerates exactly what the feature must accomplish. Bullet-point format provides clarity. Being exhaustive here is critical—omitted requirements often result in missing functionality.

### Edge Cases & Error Handling

AI models typically handle happy paths well but require explicit instruction for edge cases. This section should specify behavior for: corrupted data, invalid inputs, boundary conditions, race conditions, concurrent access, serialization edge cases, and any other exceptional scenarios.

### Testing & Validation

Quantification produces precision. Instead of "include test cases," specify "at least 12 valid emails and 16 invalid emails." Specify the test framework and define what scenarios require coverage. This results in comprehensive test suites that validate critical functionality.

### Output Format

Specifying exact filenames and structure prevents misinterpretation. Also indicate whether explanations are desired or if only code is required. In the studied examples, requesting "no explanation or extra commentary" produced focused, clean output.

### Clarification Protocol

Explicitly instructing the AI to ask questions before implementation prevents multiple rounds of corrections. This allows the AI to identify ambiguities and clarify edge cases before any code is written, significantly reducing iteration cycles.

---

## Application Results

This template structure produced the following outcomes:

| Challenge | Tests Passing | TypeScript Errors | Production Features |
|-----------|---------------|-------------------|---------------------|
| Email Validation | 129/129 (100%) | 0 | Length constraints, configurable options |
| Data Table | Full coverage | 0 | WAI-ARIA compliance, keyboard navigation |
| Cache Layer | 43/43 (100%) | 0 | Atomic writes, crash recovery, Infinity handling |

Each challenge's third iteration followed this template structure and delivered production-ready code on the first attempt.

## Key Principles

1. **Quantify everything**: Numbers produce precision where adjectives create ambiguity
2. **List edge cases explicitly**: Do not assume the model will infer them
3. **Define the role first**: Sets tone and quality expectations
4. **Use the clarification protocol**: Essential for complex tasks
5. **Specify output format**: Exact filenames and delivery expectations
