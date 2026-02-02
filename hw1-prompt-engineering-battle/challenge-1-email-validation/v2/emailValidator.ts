/**
 * Validates an email address using regex and additional structural checks
 * @param email - The email address to validate
 * @returns true if the email is valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  // Basic null/undefined check
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Trim whitespace
  email = email.trim();

  // Check length constraints (RFC 5321)
  if (email.length > 254) {
    return false;
  }

  // Must have exactly one @ symbol
  const atCount = (email.match(/@/g) || []).length;
  if (atCount !== 1) {
    return false;
  }

  // Split into local and domain parts
  const [localPart, domain] = email.split('@');

  // Validate local part (before @)
  if (!isValidLocalPart(localPart)) {
    return false;
  }

  // Validate domain part (after @)
  if (!isValidDomain(domain)) {
    return false;
  }

  return true;
}

/**
 * Validates the local part of an email (before the @)
 */
function isValidLocalPart(local: string): boolean {
  if (!local || local.length === 0 || local.length > 64) {
    return false;
  }

  // Check for leading or trailing dots
  if (local.startsWith('.') || local.endsWith('.')) {
    return false;
  }

  // Check for consecutive dots
  if (local.includes('..')) {
    return false;
  }

  // Basic regex pattern for local part (supports plus addressing)
  // Allows: letters, numbers, dots, underscores, hyphens, percent, plus
  // Plus can appear multiple times (e.g., user+tag1+tag2@example.com)
  const localRegex = /^[a-zA-Z0-9._+%-]+$/;
  
  return localRegex.test(local);
}

/**
 * Validates the domain part of an email (after the @)
 */
function isValidDomain(domain: string): boolean {
  if (!domain || domain.length === 0 || domain.length > 253) {
    return false;
  }

  // Check for leading or trailing dots/hyphens
  if (domain.startsWith('.') || domain.endsWith('.') || 
      domain.startsWith('-') || domain.endsWith('-')) {
    return false;
  }

  // Check for consecutive dots
  if (domain.includes('..')) {
    return false;
  }

  // Must have at least one dot (for TLD)
  if (!domain.includes('.')) {
    return false;
  }

  // Split domain into parts
  const parts = domain.split('.');

  // Each part must be valid
  for (const part of parts) {
    if (!isValidDomainPart(part)) {
      return false;
    }
  }

  // Last part is the TLD - must be at least 2 characters
  const tld = parts[parts.length - 1];
  if (tld.length < 2) {
    return false;
  }

  // TLD should only contain letters
  if (!/^[a-zA-Z]+$/.test(tld)) {
    return false;
  }

  return true;
}

/**
 * Validates a single part of a domain (subdomain or main domain)
 */
function isValidDomainPart(part: string): boolean {
  if (!part || part.length === 0 || part.length > 63) {
    return false;
  }

  // Can't start or end with hyphen
  if (part.startsWith('-') || part.endsWith('-')) {
    return false;
  }

  // Must contain only letters, numbers, and hyphens
  const partRegex = /^[a-zA-Z0-9-]+$/;
  
  return partRegex.test(part);
}

/**
 * Gets detailed validation errors for an email (useful for form feedback)
 * @param email - The email address to validate
 * @returns An array of error messages, empty if valid
 */
export function getEmailValidationErrors(email: string): string[] {
  const errors: string[] = [];

  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
    return errors;
  }

  email = email.trim();

  if (email.length > 254) {
    errors.push('Email is too long (max 254 characters)');
  }

  const atCount = (email.match(/@/g) || []).length;
  if (atCount === 0) {
    errors.push('Email must contain @ symbol');
  } else if (atCount > 1) {
    errors.push('Email must contain only one @ symbol');
  }

  // Continue validation even if @ count is wrong
  // Split at the first @ to check other validation rules
  const atIndex = email.indexOf('@');
  const localPart = atIndex >= 0 ? email.substring(0, atIndex) : email;
  const domain = atIndex >= 0 ? email.substring(atIndex + 1) : '';

  // Local part errors
  if (!localPart) {
    errors.push('Email must have a local part before @');
  } else {
    if (localPart.length > 64) {
      errors.push('Local part is too long (max 64 characters)');
    }
    if (localPart.startsWith('.') || localPart.endsWith('.')) {
      errors.push('Local part cannot start or end with a dot');
    }
    if (localPart.includes('..')) {
      errors.push('Local part cannot contain consecutive dots');
    }
  }

  // Domain errors
  if (!domain) {
    errors.push('Email must have a domain after @');
  } else {
    if (!domain.includes('.')) {
      errors.push('Domain must contain at least one dot');
    }
    if (domain.startsWith('.') || domain.endsWith('.')) {
      errors.push('Domain cannot start or end with a dot');
    }
    if (domain.includes('..')) {
      errors.push('Domain cannot contain consecutive dots');
    }

    const parts = domain.split('.');
    const tld = parts[parts.length - 1];
    if (tld && tld.length < 2) {
      errors.push('Top-level domain must be at least 2 characters');
    }
  }

  return errors;
}