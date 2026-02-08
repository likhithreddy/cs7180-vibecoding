# Version 3 Prompt
You are a senior TypeScript engineer and test author. You produce production-ready, fully typed, zero-error TypeScript code. All output must compile cleanly with no TypeScript type errors.
Prepare to implement `isValidEmail(email: string, opts?: { allowSingleLabelDomain?: boolean }): boolean` using regex plus small deterministic checks (not full RFC validation). Do not output any code yet.

Below are all the requirements that must be satisfied. I repeat "ALL REQUIREMENTS SHOULD BE SATISFIED".

- Input Handling: Trim all whitespaces, reject empty strings, and reject any whitespace inside the email (spaces, tabs, newlines)
- Structure Rules: Exactly one "@" should be present, local part length ≤ 64, and total email length ≤ 254.
- Local Part Rules: Allowed characters are A–Z, a–z, 0–9, `. _ % + -` with no leading dot, no trailing dot, and no consecutive dots
- Domain Rules: By default, require at least one dot (example.com), support subdomains (mail.company.co.uk), domain labels must contain ONLY alphanumerics or hyphens, and should not be empty and should not start or end with hyphen. Also, no consecutive dots should exist in domain.
- Optional Behavior: If `opts.allowSingleLabelDomain === true`, allow `"user@localhost"`, Otherwise `"user@localhost"` is invalid

Below are the Testing Requirements:   
Write TypeScript Jest tests including atleast 12 valid emails, atleast 16 invalid emails and coverage for plus addressing, subdomains, dot edge cases, hyphen label edge cases, multiple @ signs, whitespace cases, length limits, behavior of `allowSingleLabelDomain`

Below is the Output Format:   
When I say “begin coding”, return ONLY two files with proper comments for functions are accurate description:  
1. `emailRegexValidator.ts`  
2. `emailRegexValidator.test.ts`  
No explanation or extra commentary outside code blocks.

The final output must contain zero TypeScript type errors and all returned code must be valid, strict, clean, and self-contained. No unused variables, no implicit any, no missing imports.  All regexes must be properly typed and all options must have explicit types.

Before writing any code, you must ask all clarifying questions if ANY requirement is ambiguous. Ask all the clarification questions until you are extremely sure. Do not produce code until I explicitly respond “begin coding”.