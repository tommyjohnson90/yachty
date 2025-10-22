/**
 * Error handling utilities for the Yacht Management System
 * Provides consistent error handling across the application
 */

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 500, 'DATABASE_ERROR', details)
    this.name = 'DatabaseError'
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, details?: any) {
    super(`${service} error: ${message}`, 502, 'EXTERNAL_SERVICE_ERROR', details)
    this.name = 'ExternalServiceError'
  }
}

/**
 * Error response handler for API routes
 */
export function handleApiError(error: unknown): {
  message: string
  statusCode: number
  code?: string
  details?: any
} {
  // Log error for debugging
  console.error('API Error:', error)

  // Handle known AppError instances
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
      details: error.details,
    }
  }

  // Handle Supabase/PostgreSQL errors
  if (error && typeof error === 'object' && 'code' in error) {
    const dbError = error as any

    // Check for common database errors
    if (dbError.code === '23505') {
      return {
        message: 'A record with this value already exists',
        statusCode: 409,
        code: 'DUPLICATE_ERROR',
        details: dbError.detail,
      }
    }

    if (dbError.code === '23503') {
      return {
        message: 'Referenced record does not exist',
        statusCode: 400,
        code: 'FOREIGN_KEY_ERROR',
        details: dbError.detail,
      }
    }

    if (dbError.code === '23502') {
      return {
        message: 'Required field is missing',
        statusCode: 400,
        code: 'NOT_NULL_ERROR',
        details: dbError.detail,
      }
    }

    return {
      message: 'Database operation failed',
      statusCode: 500,
      code: 'DATABASE_ERROR',
      details: process.env.NODE_ENV === 'development' ? dbError : undefined,
    }
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    return {
      message: error.message || 'An unexpected error occurred',
      statusCode: 500,
      code: 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }
  }

  // Fallback for unknown error types
  return {
    message: 'An unexpected error occurred',
    statusCode: 500,
    code: 'UNKNOWN_ERROR',
  }
}

/**
 * Wrapper for async API route handlers to catch errors
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<Response>>(
  handler: T
): T {
  return (async (...args: any[]) => {
    try {
      return await handler(...args)
    } catch (error) {
      const errorResponse = handleApiError(error)
      return Response.json(
        {
          error: errorResponse.message,
          code: errorResponse.code,
          details: errorResponse.details,
        },
        { status: errorResponse.statusCode }
      )
    }
  }) as T
}

/**
 * Client-side error formatter
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as any).message)
  }

  return 'An unexpected error occurred. Please try again.'
}

/**
 * Retry utility for operations that may fail temporarily
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number
    delayMs?: number
    backoff?: boolean
    onRetry?: (attempt: number, error: Error) => void
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delayMs = 1000,
    backoff = true,
    onRetry,
  } = options

  let lastError: Error

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt < maxRetries - 1) {
        onRetry?.(attempt + 1, lastError)

        const delay = backoff ? delayMs * Math.pow(2, attempt) : delayMs
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError!
}

/**
 * Type guard for checking if a value is an error object
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error
}

/**
 * Type guard for checking if a value is an AppError
 */
export function isAppError(value: unknown): value is AppError {
  return value instanceof AppError
}
