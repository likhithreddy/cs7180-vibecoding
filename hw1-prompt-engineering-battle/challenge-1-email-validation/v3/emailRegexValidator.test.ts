// emailRegexValidator.test.ts

import { isValidEmail } from './emailRegexValidator';

describe('Email Regex Validator', () => {
  describe('Valid Emails', () => {
    test.each([
      'user@example.com',
      'john.doe@company.org',
      'alice_smith@domain.net',
      'bob123@website.io',
      'test.user@example.com',
      'user+tag@gmail.com',
      'john+newsletter@company.org',
      'contact@mail.example.com',
      'admin@mail.company.co.uk',
      'support@us-east.service.cloud.com',
      'a1@b2.co',
      'user%test@example.com',
      'first.last@sub.domain.example.com',
      'user+tag1+tag2@example.com',
    ])('should validate "%s" as valid', (email) => {
      expect(isValidEmail(email)).toBe(true);
    });
  });

  describe('Valid Emails - Plus Addressing', () => {
    test.each([
      'user+tag@example.com',
      'alice+shopping@store.com',
      'test+feature@service.io',
      'user+tag1+tag2@example.com',
      'john+123@domain.org',
      'a+b+c+d@example.com',
    ])('should accept plus addressing: "%s"', (email) => {
      expect(isValidEmail(email)).toBe(true);
    });
  });

  describe('Valid Emails - Subdomains', () => {
    test.each([
      'user@mail.example.com',
      'admin@mail.company.co.uk',
      'contact@a.b.c.example.com',
      'support@us-west-2.cloud.com',
      'test@sub1.sub2.sub3.example.org',
    ])('should accept subdomains: "%s"', (email) => {
      expect(isValidEmail(email)).toBe(true);
    });
  });

  describe('Invalid Emails - Structure Issues', () => {
    test.each([
      ['', 'empty string'],
      ['plaintext', 'no @ symbol'],
      ['user@@example.com', 'multiple @ symbols'],
      ['@example.com', 'missing local part'],
      ['user@', 'missing domain'],
      ['user@domain', 'missing TLD (no dot)'],
      ['user@domain@another.com', 'multiple @ symbols'],
      ['@', 'only @ symbol'],
    ])('should reject "%s" (%s)', (email) => {
      expect(isValidEmail(email)).toBe(false);
    });
  });

  describe('Invalid Emails - Whitespace Inside Email', () => {
    test.each([
      'user @example.com',
      'user@ example.com',
      'user@exam ple.com',
      'us er@example.com',
      'user\t@example.com',
      'user@example.\ncom',
      'user@exa\rmple.com',
      'user @domain.com',
      'user@domain .com',
    ])('should reject email with internal whitespace: "%s"', (email) => {
      expect(isValidEmail(email)).toBe(false);
    });
  });

  describe('Invalid Emails - Local Part Dots', () => {
    test.each([
      '.user@example.com',
      'user.@example.com',
      'user..name@example.com',
      '..user@example.com',
      'user...name@example.com',
      '.@example.com',
    ])('should reject dot edge case: "%s"', (email) => {
      expect(isValidEmail(email)).toBe(false);
    });
  });

  describe('Invalid Emails - Local Part Plus Signs', () => {
    test.each([
      '+user@example.com',
      'user+@example.com',
      'user++tag@example.com',
      '++user@example.com',
      'user+++tag@example.com',
      '+@example.com',
    ])('should reject plus sign edge case: "%s"', (email) => {
      expect(isValidEmail(email)).toBe(false);
    });
  });

  describe('Invalid Emails - Local Part Start/End Special Chars', () => {
    test.each([
      '-user@example.com',
      'user-@example.com',
      '_user@example.com',
      'user_@example.com',
      '%user@example.com',
      'user%@example.com',
      '-@example.com',
      '_@example.com',
      '%@example.com',
    ])('should reject special char at start/end: "%s"', (email) => {
      expect(isValidEmail(email)).toBe(false);
    });
  });

  describe('Invalid Emails - Domain Label Hyphens', () => {
    test.each([
      'user@-example.com',
      'user@example-.com',
      'user@-mail.example.com',
      'user@mail-.example.com',
      'user@mail.-example.com',
      'user@example.-com',
      'user@-.example.com',
      'user@--.example.com',
    ])('should reject hyphen at label start/end: "%s"', (email) => {
      expect(isValidEmail(email)).toBe(false);
    });
  });

  describe('Invalid Emails - Domain Dots', () => {
    test.each([
      'user@.example.com',
      'user@example.com.',
      'user@example..com',
      'user@..example.com',
      'user@example...com',
      'user@.com',
    ])('should reject domain dot edge case: "%s"', (email) => {
      expect(isValidEmail(email)).toBe(false);
    });
  });

  describe('Invalid Emails - TLD Rules', () => {
    test.each([
      'user@example.c',
      'user@example.123',
      'user@example.c0m',
      'user@example.co-m',
      'user@example.1',
      'user@example.1a',
      'user@example.a1',
      'user@domain.c-om',
      'user@domain.-com',
      'user@domain.com-',
    ])('should reject invalid TLD: "%s"', (email) => {
      expect(isValidEmail(email)).toBe(false);
    });
  });

  describe('Invalid Emails - Invalid Characters', () => {
    test.each([
      'user#test@example.com',
      'user@domain!test.com',
      'user$name@example.com',
      'user&name@example.com',
      'user*name@example.com',
      'user@domain$.com',
      'user(name)@example.com',
    ])('should reject invalid characters: "%s"', (email) => {
      expect(isValidEmail(email)).toBe(false);
    });
  });

  describe('Invalid Emails - Length Limits', () => {
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

    test('should accept email of exactly 254 characters', () => {
      // user@ (5) + domain (245) + .com (4) = 254
      const maxEmail = 'user@' + 'a'.repeat(245) + '.com';
      expect(isValidEmail(maxEmail)).toBe(true);
    });

    test('should reject empty local part', () => {
      expect(isValidEmail('@example.com')).toBe(false);
    });

    test('should reject empty domain', () => {
      expect(isValidEmail('user@')).toBe(false);
    });
  });

  describe('Invalid Emails - Unsupported Formats', () => {
    test.each([
      'user@[192.168.1.1]',
      'user@[IPv6:2001:db8::1]',
      'user@192.168.1.1',
    ])('should reject IP address format: "%s"', (email) => {
      expect(isValidEmail(email)).toBe(false);
    });
  });

  describe('Single Label Domain - allowSingleLabelDomain Option', () => {
    test.each([
      'user@localhost',
      'admin@intranet',
      'test@server',
      'root@mail',
    ])('should reject "%s" by default', (email) => {
      expect(isValidEmail(email)).toBe(false);
    });

    test.each([
      'user@localhost',
      'admin@intranet',
      'test@server',
      'root@mail',
    ])('should accept "%s" when allowSingleLabelDomain is true', (email) => {
      expect(isValidEmail(email, { allowSingleLabelDomain: true })).toBe(true);
    });

    test('should still validate single label domain correctly', () => {
      expect(isValidEmail('user@-localhost', { allowSingleLabelDomain: true })).toBe(false);
      expect(isValidEmail('user@localhost-', { allowSingleLabelDomain: true })).toBe(false);
      expect(isValidEmail('user@local host', { allowSingleLabelDomain: true })).toBe(false);
      expect(isValidEmail('user@l', { allowSingleLabelDomain: true })).toBe(false);
    });

    test('should reject single-char single label domain', () => {
      expect(isValidEmail('user@x', { allowSingleLabelDomain: true })).toBe(false);
    });
  });

  describe('Edge Cases - Trimming', () => {
    test('should trim leading whitespace', () => {
      expect(isValidEmail('  user@example.com')).toBe(true);
    });

    test('should trim trailing whitespace', () => {
      expect(isValidEmail('user@example.com  ')).toBe(true);
    });

    test('should trim both leading and trailing whitespace', () => {
      expect(isValidEmail('  user@example.com  ')).toBe(true);
    });

    test('should accept single leading space', () => {
      expect(isValidEmail(' user@example.com')).toBe(true);
    });

    test('should accept single trailing space', () => {
      expect(isValidEmail('user@example.com ')).toBe(true);
    });
  });

  describe('Edge Cases - Minimal Valid Emails', () => {
    test('should accept minimal valid email', () => {
      expect(isValidEmail('a@b.co')).toBe(true);
    });

    test('should accept single char local and domain', () => {
      expect(isValidEmail('x@y.io')).toBe(true);
    });
  });

  describe('Edge Cases - Mixed Case', () => {
    test.each([
      'User@Example.Com',
      'ADMIN@DOMAIN.ORG',
      'TeSt+TaG@ExAmPlE.cOm',
    ])('should accept mixed case: "%s"', (email) => {
      expect(isValidEmail(email)).toBe(true);
    });
  });

  describe('Edge Cases - Numbers in Domain', () => {
    test.each([
      'user@domain123.com',
      'user@123domain.com',
      'user@sub1.sub2.example.com',
      'admin@server2024.org',
    ])('should accept numbers in domain labels: "%s"', (email) => {
      expect(isValidEmail(email)).toBe(true);
    });
  });

  describe('Edge Cases - All Allowed Special Characters', () => {
    test('should accept all allowed chars in local part', () => {
      expect(isValidEmail('a.b_c%d+e-f@example.com')).toBe(true);
    });

    test('should accept hyphen in middle of domain label', () => {
      expect(isValidEmail('user@my-domain.com')).toBe(true);
    });
  });
});