import { generateSlug, validateEmail, formatDate, ApiError } from '../index';

describe('Shared Utils', () => {
  describe('generateSlug', () => {
    it('should generate a valid slug', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
      expect(generateSlug('Test 123!')).toBe('test-123');
    });

    it('should handle edge cases', () => {
      expect(generateSlug('')).toBe('');
      expect(generateSlug('   ')).toBe('');
      expect(generateSlug('  hello world  ')).toBe('hello-world');
      expect(generateSlug('---test---')).toBe('test');
    });
  });

  describe('validateEmail', () => {
    it('should validate email correctly', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('invalid-email')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('   test@example.com   ')).toBe(true);
      expect(validateEmail(' ')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date);
      expect(formatted).toContain('January');
      expect(formatted).toContain('2024');
    });
  });

  describe('ApiError', () => {
    it('should create API error correctly', () => {
      const error = new ApiError('Test error', 400, 'TEST_ERROR');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('TEST_ERROR');
    });
  });
});