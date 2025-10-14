import { supabaseServer } from '../lib/supabaseServer';

/**
 * Service layer for Plans operations
 * Wraps existing Server Actions for reusability
 */

/**
 * List all plans for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of plans
 */
export async function listPlans(userId) {
  // TODO: Implement wrapper around existing Server Action logic
  // This should call supabaseServer() and query plans table
  throw new Error('Not implemented - use existing Server Actions in pages');
}

/**
 * Create a new plan
 * @param {Object} input - Plan data (name, goal, active)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Created plan
 */
export async function createPlan(input, userId) {
  // TODO: Implement wrapper around existing Server Action logic
  // This should call supabaseServer() and insert into plans table
  throw new Error('Not implemented - use existing Server Actions in pages');
}

/**
 * Update an existing plan
 * @param {string} id - Plan ID
 * @param {Object} input - Updated plan data
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated plan
 */
export async function updatePlan(id, input, userId) {
  // TODO: Implement wrapper around existing Server Action logic
  // This should call supabaseServer() and update plans table
  throw new Error('Not implemented - use existing Server Actions in pages');
}

/**
 * Delete a plan
 * @param {string} id - Plan ID
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
export async function deletePlan(id, userId) {
  // TODO: Implement wrapper around existing Server Action logic
  // This should call supabaseServer() and delete from plans table
  throw new Error('Not implemented - use existing Server Actions in pages');
}
