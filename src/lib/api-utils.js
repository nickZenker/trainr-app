import { z } from "zod";

/**
 * Structured error logging for API routes
 * @param {string} operation - The API operation being performed
 * @param {Error} error - The error object
 * @param {string|null} userId - User ID for context
 * @param {object} additionalContext - Additional context data
 */
export function logApiError(operation, error, userId = null, additionalContext = {}) {
  const errorData = {
    operation,
    message: error.message,
    code: error.code || error.status || "UNKNOWN_ERROR",
    details: error.details || null,
    userId,
    timestamp: new Date().toISOString(),
    stack: error.stack,
    ...additionalContext
  };

  console.error(`API Error [${operation}]:`, errorData);
  
  // In production, you might want to send this to a logging service
  // e.g., Sentry, DataDog, etc.
}

/**
 * Create a standardized error response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @param {string} code - Error code
 * @param {object} details - Additional error details
 * @returns {Response} NextResponse error
 */
export function createErrorResponse(message, status = 500, code = "UNKNOWN_ERROR", details = null) {
  const errorResponse = {
    error: message,
    code,
    timestamp: new Date().toISOString()
  };

  if (details) {
    errorResponse.details = details;
  }

  return new Response(JSON.stringify(errorResponse), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Validate UUID format
 * @param {string} id - ID to validate
 * @returns {boolean} Is valid UUID
 */
export function isValidUUID(id) {
  return z.string().uuid().safeParse(id).success;
}

/**
 * Common validation schemas for API routes
 */
export const CommonSchemas = {
  uuid: z.string().uuid("Invalid UUID format"),
  
  pagination: z.object({
    page: z.string().regex(/^\d+$/, "Invalid page number").optional(),
    limit: z.string().regex(/^\d+$/, "Invalid limit").optional(),
    offset: z.string().regex(/^\d+$/, "Invalid offset").optional()
  }),

  dateRange: z.object({
    start_date: z.string().datetime("Invalid start date format").optional(),
    end_date: z.string().datetime("Invalid end date format").optional()
  }),

  sortOrder: z.object({
    sort_by: z.string().min(1, "Sort field is required").optional(),
    sort_order: z.enum(["asc", "desc"], "Invalid sort order").optional()
  })
};

/**
 * Handle validation errors consistently
 * @param {z.ZodError} error - Zod validation error
 * @returns {Response} Formatted validation error response
 */
export function handleValidationError(error) {
  const details = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code
  }));

  return createErrorResponse(
    "Validation failed",
    400,
    "VALIDATION_ERROR",
    details
  );
}

/**
 * Extract and validate query parameters
 * @param {URLSearchParams} searchParams - URL search parameters
 * @param {z.ZodSchema} schema - Validation schema
 * @returns {object} Parsed and validated query params
 */
export function parseQueryParams(searchParams, schema) {
  const params = Object.fromEntries(searchParams.entries());
  
  // Parse numeric strings to numbers where appropriate
  if (params.page) params.page = parseInt(params.page);
  if (params.limit) params.limit = parseInt(params.limit);
  if (params.offset) params.offset = parseInt(params.offset);
  
  const result = schema.safeParse(params);
  
  if (!result.success) {
    throw new Error(`Query validation failed: ${result.error.message}`);
  }
  
  return result.data;
}

/**
 * Standard API response wrapper
 * @param {any} data - Response data
 * @param {object} meta - Metadata (count, pagination, etc.)
 * @returns {object} Standardized response object
 */
export function createApiResponse(data, meta = {}) {
  return {
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  };
}

/**
 * Rate limiting helper (basic implementation)
 * @param {string} identifier - User ID or IP
 * @param {number} limit - Request limit per window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} Whether request is allowed
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function checkRateLimit(identifier, _limit = 100, _windowMs = 60000) {
  // This is a basic implementation
  // In production, use Redis or a proper rate limiting service
  // TODO: Implement actual rate limiting logic
  // const key = `rate_limit_${identifier}`;
  // const now = Date.now();
  
  // This would typically be stored in Redis
  // For now, we'll just return true
  return true;
}
