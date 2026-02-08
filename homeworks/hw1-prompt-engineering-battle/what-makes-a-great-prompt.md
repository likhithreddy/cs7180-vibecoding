# What Makes a Great Prompt?

This document presents key insights on effective prompt engineering, derived from analyzing nine prompts across three implementation challenges: email validation, data table construction, and cache layer development.

## Introduction

Prompt engineering is the practice of crafting effective inputs to elicit desired outputs from AI language models. This assignment explored how prompt structure, specificity, and clarity impact code quality, test coverage, and production-readiness. By implementing the same three challenges multiple times with iterative prompt improvements, clear patterns emerged regarding what makes prompts effective.

## Specificity and Detail

The most significant finding was the direct correlation between prompt specificity and output quality. Initial prompts were minimal and functional, but often insufficient for production use. For example, the first email validation prompt consisted of only 15 words: "Create a Typescript function to validate email addresses using a regex. Also include test cases handling plus addressing and subdomains." This produced a working solution with 88.5% test pass rate, leaving gaps in edge case handling.

The third iteration expanded to 230 words with explicit requirements, resulting in 100% of 129 tests passing with zero TypeScript errors. This pattern repeated across all challenges: detailed prompts produced comprehensive implementations that handled edge cases, followed best practices, and required minimal revision.

## Role Definition

Another critical element was establishing the AI's role before specifying the task. Effective prompts began with role-setting language such as "You are a senior TypeScript engineer" or "You are a Senior Frontend Engineer specializing in React + TypeScript data tables." This framing influenced the AI's approach, leading to more defensive programming, better architectural decisions, and adherence to professional coding standards.

Without explicit role definition, the AI tended to produce minimal viable solutions. With role definition, the output aligned more closely with professional expectations for maintainability, type safety, and error handling.

## Quantification

Vague language in prompts produced vague results. When prompts requested "include test cases," the AI provided a minimal set. When prompts specified "include at least 12 valid emails and 16 invalid emails," the output included exactly that and often more comprehensive coverage.

Quantification extended beyond test cases to implementation details. Specifying exact behavior for edge cases—such as "TTL=0 should expire immediately" or "file writes must be atomic using temp file + rename"—eliminated ambiguity and reduced iteration cycles.

## Structured Requirements

The most effective prompts followed a consistent structure:

1. **Role & Context**: Establishing expertise level and domain
2. **Task Definition**: Clear statement of what to build
3. **Functional Requirements**: Specific behaviors and features
4. **Technical Constraints**: Technology restrictions and performance requirements
5. **Edge Cases**: Explicit handling of boundary conditions and errors
6. **Testing Requirements**: Quantified test coverage specifications
7. **Output Format**: Exact file structure and delivery expectations
8. **Clarification Protocol**: Instructions to ask questions before implementation

This structure ensured all critical information was communicated before code generation began.

## The Clarification Protocol

Perhaps the most impactful practice was explicitly instructing the AI to ask clarifying questions before writing code. This prevented implementation based on incorrect assumptions and identified ambiguities in the requirements. For example, in the cache layer challenge, the AI asked about TTL=0 behavior, Infinity serialization, and atomic write guarantees—all edge cases that would have required revision if not addressed upfront.

The clarification protocol transformed the interaction from a series of corrections to a collaborative requirements-gathering process, resulting in more accurate initial implementations.

## Conclusion

Effective prompt engineering is not about clever phrasing or tricks. It is about clear communication of requirements, context, and constraints. The practices that produced the best results—specificity, quantification, role definition, structured requirements, and clarification protocols—are fundamentally communication principles applied to a new medium.

These insights suggest that treating AI interaction as a form of requirements specification, rather than casual conversation, leads to significantly better outcomes. As AI tools become more integrated into development workflows, the ability to craft effective prompts will be an essential skill for software engineers.
