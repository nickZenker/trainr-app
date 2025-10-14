/**
 * Thin wrapper around Server Actions for Sessions operations
 * Provides reusable service layer for session management
 */

import { 
  deleteSession as deleteSessionAction, 
  getSessionsStats 
} from '../app/app/sessions/actions.js';

/**
 * Delete a session permanently
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} Result object
 */
export async function deleteSession(sessionId) {
  const formData = new FormData();
  formData.append('sessionId', sessionId);
  
  return await deleteSessionAction(formData);
}

/**
 * Get sessions statistics for the current user
 * @returns {Promise<Object>} Statistics object
 */
export async function getSessionsStats() {
  return await getSessionsStats();
}
