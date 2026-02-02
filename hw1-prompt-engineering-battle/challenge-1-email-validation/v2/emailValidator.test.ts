import { isValidEmail, getEmailValidationErrors } from './emailValidator';

describe('Email Validator', () => {
  describe('Valid Emails', () => {
    describe('Basic valid emails', () => {
      test.each([
        'user@example.com',
        'john.doe@company.org',
        'alice_smith@domain.net',
        'bob-jones@website.io',
        'admin@site.co',
        'contact123@business.com',
        'test.user.name@example.com',
      ])('should validate "%s" as valid', (email) => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    describe('Plus addressing', () => {
      test.each([
        'user+tag@gmail.com',
        'john+newsletter@company.org',
        'alice+shopping@amazon.com',
        'test+feature-123@service.io',
        'user+multiple+tags@example.com',
        'admin+2024@domain.com',
      ])('should validate "%s" with plus addressing', (email) => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    describe('Subdomains', () => {
      test.each([
        'user@mail.example.com',
        'admin@mail.company.co.uk',
        'support@us-east.service.cloud.com',
        'contact@subdomain.domain.org',
        'info@mail.internal.corporate.net',
        'hello@a.b.c.d.example.com',
      ])('should validate "%s" with subdomains', (email) => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    describe('Edge cases - valid', () => {
      test.each([
        'a@b.co',
        'x@example.com',
        '123@456.com',
        'user%test@example.com',
        'first.last@sub.domain.example.com',
      ])('should validate "%s" as valid edge case', (email) => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    describe('Whitespace handling', () => {
      test('should trim leading whitespace', () => {
        expect(isValidEmail('  user@example.com')).toBe(true);
      });

      test('should trim trailing whitespace', () => {
        expect(isValidEmail('user@example.com  ')).toBe(true);
      });

      test('should trim both leading and trailing whitespace', () => {
        expect(isValidEmail('  user@example.com  ')).toBe(true);
      });
    });
  });

  describe('Invalid Emails', () => {
    describe('Missing components', () => {
      test.each([
        ['plaintext', 'no @ symbol'],
        ['@example.com', 'missing local part'],
        ['user@', 'missing domain'],
        ['user@domain', 'missing TLD'],
        ['user', 'incomplete email'],
        ['', 'empty string'],
      ])('should reject "%s" (%s)', (email) => {
        expect(isValidEmail(email)).toBe(false);
      });
    });

    describe('Multiple @ symbols', () => {
      test.each([
        'user@@example.com',
        'user@domain@example.com',
        'multiple@@@example.com',
      ])('should reject "%s" with multiple @ symbols', (email) => {
        expect(isValidEmail(email)).toBe(false);
      });
    });

    describe('Consecutive dots', () => {
      test.each([
        'user..name@example.com',
        'john..doe@company.org',
        'user@example..com',
        'user@mail..example.com',
      ])('should reject "%s" with consecutive dots', (email) => {
        expect(isValidEmail(email)).toBe(false);
      });
    });

    describe('Leading/trailing dots', () => {
      test.each([
        '.user@example.com',
        'user.@example.com',
        'user@.example.com',
        'user@example.com.',
      ])('should reject "%s" with leading/trailing dots', (email) => {
        expect(isValidEmail(email)).toBe(false);
      });
    });

    describe('Invalid characters and spaces', () => {
      test.each([
        'user @example.com',
        'user@ example.com',
        'user@exam ple.com',
        'us er@example.com',
        'user#name@example.com',
        'user@domain#test.com',
        'user!name@example.com',
      ])('should reject "%s" with invalid characters', (email) => {
        expect(isValidEmail(email)).toBe(false);
      });
    });

    describe('Invalid domain format', () => {
      test.each([
        'user@.com',
        'user@domain.',
        'user@-domain.com',
        'user@domain-.com',
        'user@domain.c',
        'user@domain.123',
      ])('should reject "%s" with invalid domain', (email) => {
        expect(isValidEmail(email)).toBe(false);
      });
    });

    describe('Length constraints', () => {
      test('should reject local part longer than 64 characters', () => {
        const longLocal = 'a'.repeat(65) + '@example.com';
        expect(isValidEmail(longLocal)).toBe(false);
      });

      test('should accept local part of exactly 64 characters', () => {
        const maxLocal = 'a'.repeat(64) + '@example.com';
        expect(isValidEmail(maxLocal)).toBe(true);
      });

      test('should reject email longer than 254 characters', () => {
        const longEmail = 'user@' + 'a'.repeat(250) + '.com';
        expect(isValidEmail(longEmail)).toBe(false);
      });
    });

    describe('Invalid input types', () => {
      test('should reject null', () => {
        expect(isValidEmail(null as unknown as string)).toBe(false);
      });

      test('should reject undefined', () => {
        expect(isValidEmail(undefined as unknown as string)).toBe(false);
      });

      test('should reject number', () => {
        expect(isValidEmail(123 as unknown as string)).toBe(false);
      });

      test('should reject object', () => {
        expect(isValidEmail({} as unknown as string)).toBe(false);
      });
    });
  });

  describe('getEmailValidationErrors', () => {
    test('should return empty array for valid email', () => {
      const errors = getEmailValidationErrors('user@example.com');
      expect(errors).toEqual([]);
    });

    test('should return error for missing email', () => {
      const errors = getEmailValidationErrors('');
      expect(errors).toContain('Email is required');
    });

    test('should return error for missing @ symbol', () => {
      const errors = getEmailValidationErrors('userexample.com');
      expect(errors).toContain('Email must contain @ symbol');
    });

    test('should return error for multiple @ symbols', () => {
      const errors = getEmailValidationErrors('user@@example.com');
      expect(errors).toContain('Email must contain only one @ symbol');
    });

    test('should return error for consecutive dots in local part', () => {
      const errors = getEmailValidationErrors('user..name@example.com');
      expect(errors).toContain('Local part cannot contain consecutive dots');
    });

    test('should return error for missing domain', () => {
      const errors = getEmailValidationErrors('user@');
      expect(errors).toContain('Email must have a domain after @');
    });

    test('should return error for missing TLD', () => {
      const errors = getEmailValidationErrors('user@domain');
      expect(errors).toContain('Domain must contain at least one dot');
    });

    test('should return multiple errors for severely malformed email', () => {
      const errors = getEmailValidationErrors('..user@@..domain');
      expect(errors.length).toBeGreaterThan(1);
    });

    test('should return error for short TLD', () => {
      const errors = getEmailValidationErrors('user@example.c');
      expect(errors).toContain('Top-level domain must be at least 2 characters');
    });
  });

  describe('Real-world email examples', () => {
    describe('Common email providers', () => {
      test.each([
        'user@gmail.com',
        'john.doe+spam@gmail.com',
        'contact@yahoo.com',
        'business@outlook.com',
        'info@protonmail.com',
        'support@company.co.uk',
      ])('should validate "%s" from common providers', (email) => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    describe('Common mistakes', () => {
      test.each([
        'user@gmailcom',
        'user@gmail',
        'user.gmail.com',
        '@gmail.com',
        'user@',
        'user @gmail.com',
      ])('should reject common mistake: "%s"', (email) => {
        expect(isValidEmail(email)).toBe(false);
      });
    });
  });
});