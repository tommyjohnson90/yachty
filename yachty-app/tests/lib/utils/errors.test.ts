import { describe, it, expect, vi } from 'vitest';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  DatabaseError,
  ExternalServiceError,
  handleApiError,
  withErrorHandling,
  formatErrorMessage,
  retryOperation,
  isError,
  isAppError,
} from '@/lib/utils/errors';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create error with message and status code', () => {
      const error = new AppError('Test error', 400);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('AppError');
    });

    it('should default to 500 status code', () => {
      const error = new AppError('Server error');
      expect(error.statusCode).toBe(500);
    });

    it('should include optional code and details', () => {
      const error = new AppError('Test', 400, 'TEST_CODE', { field: 'value' });
      expect(error.code).toBe('TEST_CODE');
      expect(error.details).toEqual({ field: 'value' });
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with 400 status', () => {
      const error = new ValidationError('Invalid input');
      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.name).toBe('ValidationError');
    });

    it('should include validation details', () => {
      const details = { field: 'email', issue: 'invalid format' };
      const error = new ValidationError('Invalid email', details);
      expect(error.details).toEqual(details);
    });
  });

  describe('AuthenticationError', () => {
    it('should create auth error with 401 status', () => {
      const error = new AuthenticationError();
      expect(error.message).toBe('Unauthorized');
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.name).toBe('AuthenticationError');
    });

    it('should accept custom message', () => {
      const error = new AuthenticationError('Invalid token');
      expect(error.message).toBe('Invalid token');
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with 404 status', () => {
      const error = new NotFoundError('User');
      expect(error.message).toBe('User not found');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.name).toBe('NotFoundError');
    });

    it('should use default resource name', () => {
      const error = new NotFoundError();
      expect(error.message).toBe('Resource not found');
    });
  });

  describe('DatabaseError', () => {
    it('should create database error with 500 status', () => {
      const error = new DatabaseError('Connection failed');
      expect(error.message).toBe('Connection failed');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.name).toBe('DatabaseError');
    });
  });

  describe('ExternalServiceError', () => {
    it('should create external service error with 502 status', () => {
      const error = new ExternalServiceError('Stripe', 'Payment failed');
      expect(error.message).toBe('Stripe error: Payment failed');
      expect(error.statusCode).toBe(502);
      expect(error.code).toBe('EXTERNAL_SERVICE_ERROR');
      expect(error.name).toBe('ExternalServiceError');
    });
  });
});

describe('handleApiError', () => {
  it('should handle AppError instances', () => {
    const error = new ValidationError('Invalid data', { field: 'name' });
    const result = handleApiError(error);

    expect(result.message).toBe('Invalid data');
    expect(result.statusCode).toBe(400);
    expect(result.code).toBe('VALIDATION_ERROR');
    expect(result.details).toEqual({ field: 'name' });
  });

  it('should handle duplicate error (23505)', () => {
    const dbError = { code: '23505', detail: 'Key already exists' };
    const result = handleApiError(dbError);

    expect(result.message).toBe('A record with this value already exists');
    expect(result.statusCode).toBe(409);
    expect(result.code).toBe('DUPLICATE_ERROR');
    expect(result.details).toBe('Key already exists');
  });

  it('should handle foreign key error (23503)', () => {
    const dbError = { code: '23503', detail: 'Foreign key violation' };
    const result = handleApiError(dbError);

    expect(result.message).toBe('Referenced record does not exist');
    expect(result.statusCode).toBe(400);
    expect(result.code).toBe('FOREIGN_KEY_ERROR');
  });

  it('should handle not null error (23502)', () => {
    const dbError = { code: '23502', detail: 'Column cannot be null' };
    const result = handleApiError(dbError);

    expect(result.message).toBe('Required field is missing');
    expect(result.statusCode).toBe(400);
    expect(result.code).toBe('NOT_NULL_ERROR');
  });

  it('should handle generic database error', () => {
    const dbError = { code: '42P01', detail: 'Table does not exist' };
    const result = handleApiError(dbError);

    expect(result.message).toBe('Database operation failed');
    expect(result.statusCode).toBe(500);
    expect(result.code).toBe('DATABASE_ERROR');
  });

  it('should handle standard Error instances', () => {
    const error = new Error('Something went wrong');
    const result = handleApiError(error);

    expect(result.message).toBe('Something went wrong');
    expect(result.statusCode).toBe(500);
    expect(result.code).toBe('INTERNAL_ERROR');
  });

  it('should handle unknown error types', () => {
    const result = handleApiError('string error');

    expect(result.message).toBe('An unexpected error occurred');
    expect(result.statusCode).toBe(500);
    expect(result.code).toBe('UNKNOWN_ERROR');
  });
});

describe('withErrorHandling', () => {
  it('should pass through successful responses', async () => {
    const handler = vi.fn(async () => Response.json({ success: true }));
    const wrapped = withErrorHandling(handler);

    const response = await wrapped();
    const data = await response.json();

    expect(data).toEqual({ success: true });
    expect(handler).toHaveBeenCalled();
  });

  it('should catch and format errors', async () => {
    const handler = vi.fn(async () => {
      throw new ValidationError('Invalid input');
    });
    const wrapped = withErrorHandling(handler);

    const response = await wrapped();
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid input');
    expect(data.code).toBe('VALIDATION_ERROR');
  });

  it('should handle unexpected errors', async () => {
    const handler = vi.fn(async () => {
      throw new Error('Unexpected error');
    });
    const wrapped = withErrorHandling(handler);

    const response = await wrapped();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Unexpected error');
  });
});

describe('formatErrorMessage', () => {
  it('should format AppError', () => {
    const error = new ValidationError('Invalid input');
    expect(formatErrorMessage(error)).toBe('Invalid input');
  });

  it('should format standard Error', () => {
    const error = new Error('Something failed');
    expect(formatErrorMessage(error)).toBe('Something failed');
  });

  it('should format string error', () => {
    expect(formatErrorMessage('Error string')).toBe('Error string');
  });

  it('should format object with message', () => {
    const error = { message: 'Object error' };
    expect(formatErrorMessage(error)).toBe('Object error');
  });

  it('should return default message for unknown types', () => {
    expect(formatErrorMessage(null)).toBe('An unexpected error occurred. Please try again.');
    expect(formatErrorMessage(undefined)).toBe('An unexpected error occurred. Please try again.');
    expect(formatErrorMessage(123)).toBe('An unexpected error occurred. Please try again.');
  });
});

describe('retryOperation', () => {
  it('should return result on first success', async () => {
    const operation = vi.fn(async () => 'success');
    const result = await retryOperation(operation);

    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and eventually succeed', async () => {
    let attempts = 0;
    const operation = vi.fn(async () => {
      attempts++;
      if (attempts < 3) throw new Error('Fail');
      return 'success';
    });

    const result = await retryOperation(operation, {
      maxRetries: 3,
      delayMs: 10,
    });

    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('should throw after max retries', async () => {
    const operation = vi.fn(async () => {
      throw new Error('Always fails');
    });

    await expect(
      retryOperation(operation, {
        maxRetries: 2,
        delayMs: 10,
      })
    ).rejects.toThrow('Always fails');

    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('should call onRetry callback', async () => {
    let attempts = 0;
    const operation = vi.fn(async () => {
      attempts++;
      if (attempts < 2) throw new Error('Fail');
      return 'success';
    });

    const onRetry = vi.fn();

    await retryOperation(operation, {
      maxRetries: 3,
      delayMs: 10,
      onRetry,
    });

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
  });

  it('should use exponential backoff', async () => {
    const delays: number[] = [];
    let attempts = 0;

    const operation = vi.fn(async () => {
      attempts++;
      if (attempts < 4) throw new Error('Fail');
      return 'success';
    });

    const onRetry = vi.fn((attempt: number) => {
      delays.push(attempt);
    });

    await retryOperation(operation, {
      maxRetries: 4,
      delayMs: 100,
      backoff: true,
      onRetry,
    });

    expect(delays).toEqual([1, 2, 3]);
  });

  it('should use constant delay when backoff is false', async () => {
    let attempts = 0;
    const operation = vi.fn(async () => {
      attempts++;
      if (attempts < 3) throw new Error('Fail');
      return 'success';
    });

    await retryOperation(operation, {
      maxRetries: 3,
      delayMs: 50,
      backoff: false,
    });

    expect(operation).toHaveBeenCalledTimes(3);
  });
});

describe('Type Guards', () => {
  describe('isError', () => {
    it('should return true for Error instances', () => {
      expect(isError(new Error('test'))).toBe(true);
      expect(isError(new TypeError('test'))).toBe(true);
      expect(isError(new AppError('test'))).toBe(true);
    });

    it('should return false for non-Error values', () => {
      expect(isError('error string')).toBe(false);
      expect(isError({ message: 'error' })).toBe(false);
      expect(isError(null)).toBe(false);
      expect(isError(undefined)).toBe(false);
    });
  });

  describe('isAppError', () => {
    it('should return true for AppError instances', () => {
      expect(isAppError(new AppError('test'))).toBe(true);
      expect(isAppError(new ValidationError('test'))).toBe(true);
      expect(isAppError(new NotFoundError())).toBe(true);
    });

    it('should return false for non-AppError values', () => {
      expect(isAppError(new Error('test'))).toBe(false);
      expect(isAppError('error')).toBe(false);
      expect(isAppError(null)).toBe(false);
    });
  });
});
