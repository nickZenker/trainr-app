/**
 * Server Action Guard Wrapper
 * Provides consistent error handling and logging for Server Actions
 */

import { logError } from './logger';

/**
 * Wrap Server Action with error handling
 * @param {Function} action - Server Action function
 * @param {string} actionName - Name of the action for logging
 * @returns {Function} Wrapped action function
 */
export function withActionGuard(action, actionName) {
  return async function guardedAction(...args) {
    try {
      const result = await action(...args);
      
      // Ensure result has consistent format
      if (typeof result === 'object' && result !== null) {
        return result;
      } else {
        return { ok: true, data: result };
      }
      
    } catch (error) {
      // Log error with action context
      logError(error, {
        actionName,
        args: args.length > 0 ? 'Args provided' : 'No args',
        timestamp: new Date().toISOString()
      });
      
      // Return consistent error format
      return {
        ok: false,
        error: error?.message || 'An unexpected error occurred',
        actionName
      };
    }
  };
}

/**
 * Create a guarded Server Action
 * @param {Function} action - Server Action function
 * @param {string} actionName - Name of the action for logging
 * @returns {Function} Guarded action function
 */
export function createGuardedAction(action, actionName) {
  return withActionGuard(action, actionName);
}

/**
 * Validate Server Action result format
 * @param {any} result - Action result
 * @param {string} actionName - Action name for logging
 * @returns {Object} Validated result
 */
export function validateActionResult(result, actionName) {
  if (typeof result !== 'object' || result === null) {
    logError(`Invalid result format from ${actionName}: ${typeof result}`, {
      actionName,
      resultType: typeof result
    });
    
    return {
      ok: false,
      error: 'Invalid action result format',
      actionName
    };
  }
  
  if (!('ok' in result)) {
    logError(`Missing 'ok' property in result from ${actionName}`, {
      actionName,
      result
    });
    
    return {
      ok: false,
      error: 'Missing result status',
      actionName
    };
  }
  
  return result;
}

