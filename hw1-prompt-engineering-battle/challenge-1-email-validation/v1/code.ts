/**
 * Validates an email address using regex
 * Supports plus addressing (user+tag@domain.com) and subdomains (user@mail.domain.com)
 */
function isValidEmail(email: string): boolean {
  // Comprehensive email regex pattern
  const emailRegex = /^[a-zA-Z0-9._%-]+(\+[a-zA-Z0-9._%-]+)?@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  return emailRegex.test(email);
}

// Test cases
interface TestCase {
  email: string;
  expected: boolean;
  description: string;
}

const testCases: TestCase[] = [
  // Valid emails - basic
  { email: "user@example.com", expected: true, description: "Basic valid email" },
  { email: "john.doe@company.org", expected: true, description: "Email with dot in local part" },
  { email: "user_name@domain.net", expected: true, description: "Email with underscore" },
  { email: "user-name@domain.co.uk", expected: true, description: "Email with hyphen and multi-part TLD" },
  
  // Valid emails - plus addressing
  { email: "user+tag@example.com", expected: true, description: "Plus addressing" },
  { email: "john+newsletter@company.org", expected: true, description: "Plus addressing with meaningful tag" },
  { email: "user+multiple+tags@domain.com", expected: true, description: "Multiple plus signs in tag" },
  
  // Valid emails - subdomains
  { email: "user@mail.example.com", expected: true, description: "Single subdomain" },
  { email: "admin@mail.internal.company.com", expected: true, description: "Multiple subdomains" },
  { email: "support@us-east.service.cloud.com", expected: true, description: "Subdomain with hyphen" },
  
  // Valid emails - edge cases
  { email: "a@b.co", expected: true, description: "Minimal valid email" },
  { email: "test123@456domain.com", expected: true, description: "Numbers in both parts" },
  { email: "user%test@example.com", expected: true, description: "Percent sign in local part" },
  
  // Invalid emails - missing components
  { email: "invalid", expected: false, description: "No @ symbol" },
  { email: "@example.com", expected: false, description: "Missing local part" },
  { email: "user@", expected: false, description: "Missing domain" },
  { email: "user@domain", expected: false, description: "Missing TLD" },
  
  // Invalid emails - format issues
  { email: "user..name@example.com", expected: false, description: "Consecutive dots" },
  { email: "user @example.com", expected: false, description: "Space in email" },
  { email: "user@domain .com", expected: false, description: "Space in domain" },
  { email: "user@.example.com", expected: false, description: "Domain starting with dot" },
  
  // Invalid emails - special characters
  { email: "user#name@example.com", expected: false, description: "Hash in local part" },
  { email: "user@exam ple.com", expected: false, description: "Space in domain name" },
  { email: "user@@example.com", expected: false, description: "Double @ symbol" },
  
  // Invalid emails - TLD issues
  { email: "user@example.c", expected: false, description: "TLD too short" },
  { email: "user@example", expected: false, description: "No TLD" },
];

// Run tests
console.log("Email Validation Test Results\n" + "=".repeat(50));

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
  const result = isValidEmail(test.email);
  const status = result === test.expected ? "✓ PASS" : "✗ FAIL";
  
  if (result === test.expected) {
    passed++;
  } else {
    failed++;
  }
  
  console.log(`${index + 1}. ${status} | ${test.description}`);
  console.log(`   Email: "${test.email}"`);
  console.log(`   Expected: ${test.expected}, Got: ${result}\n`);
});

console.log("=".repeat(50));
console.log(`Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests`);

// Export for use in other modules
export { isValidEmail };