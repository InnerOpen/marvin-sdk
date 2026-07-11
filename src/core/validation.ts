/**
 * Input validation utilities
 */

import { MarvinValidationError } from './errors';

/**
 * RFC 5322 compliant email validation regex
 * Covers most common email formats while being practical
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Validate email address format
 *
 * @param email - Email address to validate
 * @param fieldName - Optional field name for error messages
 * @returns The validated email address
 * @throws MarvinValidationError if email is invalid
 *
 * @example
 * ```typescript
 * const email = validateEmail('user@example.com');
 * // Returns: 'user@example.com'
 *
 * validateEmail('invalid-email');
 * // Throws: MarvinValidationError
 * ```
 */
export function validateEmail(email: string, fieldName: string = 'Email'): string {
  if (!email || typeof email !== 'string') {
    throw new MarvinValidationError(`${fieldName} is required and must be a string`);
  }

  // Trim whitespace
  const trimmed = email.trim();

  if (trimmed.length === 0) {
    throw new MarvinValidationError(`${fieldName} cannot be empty`);
  }

  // Check minimum length (a@b.c = 5 chars)
  if (trimmed.length < 5) {
    throw new MarvinValidationError(`${fieldName} is too short`);
  }

  // Check maximum length (RFC 5321 limit)
  if (trimmed.length > 254) {
    throw new MarvinValidationError(`${fieldName} exceeds maximum length of 254 characters`);
  }

  // Validate format
  if (!EMAIL_REGEX.test(trimmed)) {
    throw new MarvinValidationError(
      `${fieldName} format is invalid. Expected format: user@example.com`
    );
  }

  // Additional checks
  const [localPart, domain] = trimmed.split('@');

  // Local part (before @) max 64 chars
  if (localPart.length > 64) {
    throw new MarvinValidationError(`${fieldName} local part exceeds 64 characters`);
  }

  // Domain part (after @) checks
  if (domain.length > 253) {
    throw new MarvinValidationError(`${fieldName} domain exceeds 253 characters`);
  }

  // Check for consecutive dots
  if (trimmed.includes('..')) {
    throw new MarvinValidationError(`${fieldName} cannot contain consecutive dots`);
  }

  // Check for leading/trailing dots in local part
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    throw new MarvinValidationError(`${fieldName} local part cannot start or end with a dot`);
  }

  return trimmed;
}

/**
 * Validate URL format
 *
 * @param url - URL to validate
 * @param fieldName - Optional field name for error messages
 * @returns The validated URL string
 * @throws MarvinValidationError if URL is invalid
 */
export function validateUrl(url: string, fieldName: string = 'URL'): string {
  if (!url || typeof url !== 'string') {
    throw new MarvinValidationError(`${fieldName} is required and must be a string`);
  }

  const trimmed = url.trim();

  if (trimmed.length === 0) {
    throw new MarvinValidationError(`${fieldName} cannot be empty`);
  }

  try {
    const parsed = new URL(trimmed);

    // Ensure protocol is HTTP or HTTPS
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new MarvinValidationError(`${fieldName} must use HTTP or HTTPS protocol`);
    }

    return trimmed;
  } catch (error) {
    if (error instanceof MarvinValidationError) {
      throw error;
    }
    throw new MarvinValidationError(
      `${fieldName} format is invalid. Expected format: https://example.com`
    );
  }
}

/**
 * Validate that a value is not empty
 *
 * @param value - Value to validate
 * @param fieldName - Field name for error messages
 * @returns The validated value
 * @throws MarvinValidationError if value is empty
 */
export function validateRequired<T>(value: T | null | undefined, fieldName: string): T {
  if (value === null || value === undefined) {
    throw new MarvinValidationError(`${fieldName} is required`);
  }

  if (typeof value === 'string' && value.trim().length === 0) {
    throw new MarvinValidationError(`${fieldName} cannot be empty`);
  }

  return value;
}

/**
 * Validate string length
 *
 * @param value - String to validate
 * @param options - Validation options
 * @returns The validated string
 * @throws MarvinValidationError if length is invalid
 */
export function validateStringLength(
  value: string,
  options: {
    fieldName: string;
    min?: number;
    max?: number;
  }
): string {
  const { fieldName, min, max } = options;

  if (typeof value !== 'string') {
    throw new MarvinValidationError(`${fieldName} must be a string`);
  }

  if (min !== undefined && value.length < min) {
    throw new MarvinValidationError(`${fieldName} must be at least ${min} characters`);
  }

  if (max !== undefined && value.length > max) {
    throw new MarvinValidationError(`${fieldName} must be at most ${max} characters`);
  }

  return value;
}

/**
 * Validate number is within range
 *
 * @param value - Number to validate
 * @param options - Validation options
 * @returns The validated number
 * @throws MarvinValidationError if number is out of range
 */
export function validateNumberRange(
  value: number,
  options: {
    fieldName: string;
    min?: number;
    max?: number;
  }
): number {
  const { fieldName, min, max } = options;

  if (typeof value !== 'number' || isNaN(value)) {
    throw new MarvinValidationError(`${fieldName} must be a valid number`);
  }

  if (min !== undefined && value < min) {
    throw new MarvinValidationError(`${fieldName} must be at least ${min}`);
  }

  if (max !== undefined && value > max) {
    throw new MarvinValidationError(`${fieldName} must be at most ${max}`);
  }

  return value;
}
