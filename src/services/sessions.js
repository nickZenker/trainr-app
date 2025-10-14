/**
 * Thin wrapper around Server Actions for Sessions operations
 * Provides reusable service layer for session management
 */

import { supabaseServerWithCookies } from '../lib/supabaseServer';

/**
 * Get sessions statistics for the current user
 * @returns {Promise<Object>} Statistics object
 */
export async function getSessionsStats() {
  try {
    const supabase = await supabaseServerWithCookies();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get all sessions with plan information
    const { data: sessions, error } = await supabase
      .from("sessions")
      .select(`
        id,
        type,
        plans!inner(user_id)
      `)
      .eq("plans.user_id", user.id);

    if (error) {
      throw new Error(`Failed to fetch sessions statistics: ${error.message}`);
    }

    const totalSessions = sessions?.length || 0;
    const strengthSessions = sessions?.filter(s => s.type === 'strength').length || 0;
    const cardioSessions = sessions?.filter(s => s.type === 'cardio').length || 0;

    // Get total exercise count across all sessions
    const { data: exerciseCounts, error: exerciseError } = await supabase
      .from("session_exercises")
      .select(`
        id,
        sessions!inner(
          plans!inner(user_id)
        )
      `)
      .eq("sessions.plans.user_id", user.id);

    if (exerciseError) {
      console.warn('Failed to fetch exercise counts:', exerciseError);
      // Don't fail the entire request, just use 0 for exercises
    }

    const totalExercises = exerciseCounts?.length || 0;

    return {
      totalSessions,
      strengthSessions,
      cardioSessions,
      totalExercises
    };

  } catch (error) {
    console.error('getSessionsStats error:', error);
    return {
      totalSessions: 0,
      strengthSessions: 0,
      cardioSessions: 0,
      totalExercises: 0
    };
  }
}
