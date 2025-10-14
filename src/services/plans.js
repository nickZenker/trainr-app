/**
 * Thin wrapper around Server Actions for Plans operations
 * Provides reusable service layer for plan management
 */

import { 
  togglePlanArchive, 
  deletePlan as deletePlanAction, 
  createPlan as createPlanAction, 
  getPlansStats 
} from '../app/app/plans/actions.js';

/**
 * Archive or restore a plan
 * @param {string} planId - Plan ID
 * @param {boolean} archive - Archive status
 * @returns {Promise<Object>} Result object
 */
export async function archivePlan(planId, archive) {
  const formData = new FormData();
  formData.append('planId', planId);
  formData.append('archive', archive.toString());
  
  return await togglePlanArchive(formData);
}

/**
 * Delete a plan permanently
 * @param {string} planId - Plan ID
 * @returns {Promise<Object>} Result object
 */
export async function deletePlan(planId) {
  const formData = new FormData();
  formData.append('planId', planId);
  
  return await deletePlanAction(formData);
}

/**
 * Create a new plan
 * @param {Object} input - Plan data (name, goal)
 * @returns {Promise<Object>} Result object
 */
export async function createPlan(input) {
  const formData = new FormData();
  formData.append('name', input.name);
  if (input.goal) {
    formData.append('goal', input.goal);
  }
  
  return await createPlanAction(formData);
}

/**
 * Get plans statistics for the current user
 * @returns {Promise<Object>} Statistics object
 */
export async function getPlansStats() {
  return await getPlansStats();
}
