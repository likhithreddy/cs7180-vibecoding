# Version 2 Prompt
Write a more reliable TypeScript email validation function. It should still use a regex, but add a few extra checks to make sure the address is shaped correctly.
The validator must accept normal emails like user@example.com, support plus addressing, such as user+tag@gmail.com, support subdomains like user@mail.company.co.uk, Reject common invalid formats (missing @, missing domain parts, consecutive dots).
Also write Jest test cases that include multiple valid emails (including plus addressing and subdomains), multiple invalid emails showing the edge cases
Keep the solution readable and practical, not overly strict. Return the TypeScript implementation and the tests in separate files.