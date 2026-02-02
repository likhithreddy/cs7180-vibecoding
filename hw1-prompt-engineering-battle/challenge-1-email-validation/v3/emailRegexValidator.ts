// emailRegexValidator.ts

/**
 * Options for email validation
 */
export interface EmailValidationOptions {
  allowSingleLabelDomain?: boolean;
}

/**
 * Validates an email address using regex and deterministic checks
 * @param email - The email address to validate
 * @param opts - Optional configuration for validation behavior
 * @returns true if the email is valid, false otherwise
 */
export function isValidEmail(
  email: string,
  opts?: EmailValidationOptions
): boolean {
  // Trim whitespace
  const trimmed = email.trim();

  // Reject empty strings
  if (trimmed.length === 0) {
    return false;
  }

  // Reject any whitespace inside the email (including all Unicode whitespace)
  if (/\s/.test(trimmed)) {
    return false;
  }

  // Check total length constraint
  if (trimmed.length > 254) {
    return false;
  }

  // Must have exactly one @ symbol
  const atCount = (trimmed.match(/@/g) || []).length;
  if (atCount !== 1) {
    return false;
  }

  // Split into local and domain parts
  const atIndex = trimmed.indexOf('@');
  const localPart = trimmed.substring(0, atIndex);
  const domain = trimmed.substring(atIndex + 1);

  // Validate local part
  if (!isValidLocalPart(localPart)) {
    return false;
  }

  // Validate domain part
  if (!isValidDomain(domain, opts?.allowSingleLabelDomain || false)) {
    return false;
  }

  return true;
}

/**
 * Validates the local part of an email address (before @)
 * @param local - The local part to validate
 * @returns true if valid, false otherwise
 */
function isValidLocalPart(local: string): boolean {
  // Check length
  if (local.length === 0 || local.length > 64) {
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

  // Check for consecutive plus signs
  if (local.includes('++')) {
    return false;
  }

  // Check for plus at start or end
  if (local.startsWith('+') || local.endsWith('+')) {
    return false;
  }

  // Check for hyphen/underscore/percent at start or end
  if (
    local.startsWith('-') ||
    local.endsWith('-') ||
    local.startsWith('_') ||
    local.endsWith('_') ||
    local.startsWith('%') ||
    local.endsWith('%')
  ) {
    return false;
  }

  // Validate allowed characters: A-Z a-z 0-9 . _ % + -
  const localRegex = /^[a-zA-Z0-9._+%-]+$/;
  if (!localRegex.test(local)) {
    return false;
  }

  return true;
}

/**
 * Validates the domain part of an email address (after @)
 * @param domain - The domain to validate
 * @param allowSingleLabel - Whether to allow single-label domains like "localhost"
 * @returns true if valid, false otherwise
 */
function isValidDomain(domain: string, allowSingleLabel: boolean): boolean {
  // Check for empty domain
  if (domain.length === 0) {
    return false;
  }

  // Check for leading or trailing dots
  if (domain.startsWith('.') || domain.endsWith('.')) {
    return false;
  }

  // Check for consecutive dots
  if (domain.includes('..')) {
    return false;
  }

  // Check if domain contains at least one dot (unless single-label allowed)
  const hasDot = domain.includes('.');
  if (!hasDot && !allowSingleLabel) {
    return false;
  }

  // Split into labels
  const labels = domain.split('.');

  // Validate each label
  for (let i = 0; i < labels.length; i++) {
    const label = labels[i];
    const isTLD = i === labels.length - 1;

    if (!isValidDomainLabel(label, isTLD)) {
      return false;
    }
  }

  return true;
}

/**
 * Validates a single domain label (subdomain, domain, or TLD)
 * @param label - The label to validate
 * @param isTLD - Whether this label is the top-level domain
 * @returns true if valid, false otherwise
 */
function isValidDomainLabel(label: string, isTLD: boolean): boolean {
  // Check for empty label
  if (label.length === 0) {
    return false;
  }

  // Check for leading or trailing hyphens
  if (label.startsWith('-') || label.endsWith('-')) {
    return false;
  }

  if (isTLD) {
    // TLD must be at least 2 characters
    if (label.length < 2) {
      return false;
    }

    // TLD must contain only letters (no numbers or hyphens)
    const tldRegex = /^[a-zA-Z]+$/;
    if (!tldRegex.test(label)) {
      return false;
    }
  } else {
    // Non-TLD labels: alphanumerics and hyphens only
    const labelRegex = /^[a-zA-Z0-9-]+$/;
    if (!labelRegex.test(label)) {
      return false;
    }
  }

  return true;
}