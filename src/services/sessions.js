/**
 * Thin wrapper around Server Actions for Sessions operations
 * Provides reusable service layer for session management
 */

import { supabaseServerWithCookies } from '../lib/supabaseServer';
import { normalizeDbError } from '../lib/safeSupabase';

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

/**
 * Get all sessions for the current user with optional filtering
 * @param {string} filter - 'all', 'strength', or 'cardio'
 * @returns {Promise<Array>} Array of sessions
 */
export async function listSessions(filter = 'all') {
  try {
    const supabase = await supabaseServerWithCookies();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    let query = supabase
      .from("sessions")
      .select(`
        *,
        plans!inner(
          id,
          name,
          user_id
        ),
        session_exercises (
          id,
          exercises (
            name
          )
        )
      `)
      .eq("plans.user_id", user.id);

    // Apply filter
    if (filter === "strength") {
      query = query.eq("type", "strength");
    } else if (filter === "cardio") {
      query = query.eq("type", "cardio");
    }

    const { data: sessions, error } = await query.order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch sessions: ${error.message}`);
    }

    return sessions || [];

  } catch (error) {
    console.error('listSessions error:', error);
    return [];
  }
}

/**
 * Create a new session
 * @param {Object} input - Session data (name, type, planId, weekday, time)
 * @returns {Promise<Object>} Result object
 */
export async function createSession(input) {
  try {
    const supabase = await supabaseServerWithCookies();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Basic validation
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('Session name is required');
    }

    if (!input.type || !['strength', 'cardio'].includes(input.type)) {
      throw new Error('Session type must be strength or cardio');
    }

    if (!input.planId) {
      throw new Error('Plan ID is required');
    }

    if (input.weekday === undefined || input.weekday < 0 || input.weekday > 6) {
      throw new Error('Weekday must be between 0 (Sunday) and 6 (Saturday)');
    }

    // Verify plan belongs to user
    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("id")
      .eq("id", input.planId)
      .eq("user_id", user.id)
      .single();

    if (planError || !plan) {
      throw new Error('Plan not found or access denied');
    }

    // Create session
    const { data: newSession, error } = await supabase
      .from("sessions")
      .insert({
        plan_id: input.planId,
        name: input.name.trim(),
        type: input.type,
        weekday: input.weekday,
        time: input.time || null,
        order_index: input.orderIndex || 0
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create session: ${error.message}`);
    }

    return {
      success: true,
      message: 'Session created successfully',
      session: newSession
    };

  } catch (error) {
    console.error('createSession error:', error);
    return {
      success: false,
      message: error.message || 'Failed to create session'
    };
  }
}

/**
 * Delete a session permanently
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} Result object
 */
export async function deleteSession(sessionId) {
  try {
    const supabase = await supabaseServerWithCookies();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Verify session belongs to user via plan
    const { data: session, error: fetchError } = await supabase
      .from("sessions")
      .select(`
        id,
        name,
        plans!inner(
          user_id
        )
      `)
      .eq("id", sessionId)
      .eq("plans.user_id", user.id)
      .single();

    if (fetchError || !session) {
      throw new Error('Session not found or access denied');
    }

    // Delete session (cascade will handle related session_exercises)
    const { error: deleteError } = await supabase
      .from("sessions")
      .delete()
      .eq("id", sessionId);

    if (deleteError) {
      throw new Error(`Failed to delete session: ${deleteError.message}`);
    }

    return {
      success: true,
      message: `Session "${session.name}" deleted successfully`
    };

  } catch (error) {
    console.error('deleteSession error:', error);
    return {
      success: false,
      message: error.message || 'Failed to delete session'
    };
  }
}

/**
 * Schedule a session for a specific date and time
 * @param {string} sessionId - Session ID
 * @param {Object} schedulingData - { scheduledAtIso, durationMin }
 * @returns {Promise<Object>} Result object with session data
 */
export async function scheduleSession(sessionId, { scheduledAtIso, durationMin }) {
  try {
    const supabase = await supabaseServerWithCookies();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Validation
    if (!scheduledAtIso || typeof scheduledAtIso !== 'string') {
      throw new Error('Scheduled date is required and must be a valid ISO string');
    }

    if (durationMin !== null && durationMin !== undefined) {
      if (typeof durationMin !== 'number' || durationMin < 0) {
        throw new Error('Duration must be a non-negative number');
      }
    }

    // Verify session belongs to user via plan
    const { data: session, error: fetchError } = await supabase
      .from("sessions")
      .select(`
        id,
        name,
        plans!inner(
          user_id
        )
      `)
      .eq("id", sessionId)
      .eq("plans.user_id", user.id)
      .single();

    if (fetchError || !session) {
      throw new Error('Session not found or access denied');
    }

    // Update session with scheduling data
    const { data: updatedSession, error: updateError } = await supabase
      .from("sessions")
      .update({
        scheduled_at: scheduledAtIso,
        duration_min: durationMin
      })
      .eq("id", sessionId)
      .select('id, scheduled_at, duration_min')
      .single();

    if (updateError) {
      throw new Error(`Failed to schedule session: ${updateError.message}`);
    }

    return {
      success: true,
      message: 'Session scheduled successfully',
      session: updatedSession
    };

  } catch (error) {
    console.error('scheduleSession error:', error);
    return {
      success: false,
      message: error.message || 'Failed to schedule session'
    };
  }
}

/**
 * Get scheduled sessions within a date range
 * @param {string} rangeStartIso - Start date in ISO format
 * @param {string} rangeEndIso - End date in ISO format
 * @returns {Promise<Array>} Array of scheduled sessions
 */
export async function listScheduledSessions(rangeStartIso, rangeEndIso) {
  try {
    const supabase = await supabaseServerWithCookies();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    if (!rangeStartIso || !rangeEndIso) {
      throw new Error('Date range is required');
    }

    const { data: sessions, error } = await supabase
      .from("sessions")
      .select(`
        id,
        name,
        scheduled_at,
        duration_min,
        plan_id,
        type,
        plans!inner(
          name,
          type,
          user_id
        )
      `)
      .eq("plans.user_id", user.id)
      .gte("scheduled_at", rangeStartIso)
      .lt("scheduled_at", rangeEndIso)
      .not("scheduled_at", "is", null)
      .order("scheduled_at", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch scheduled sessions: ${error.message}`);
    }

    // Enhance sessions with plan type information
    const enhancedSessions = (sessions || []).map(session => ({
      ...session,
      plan_type: session.plans?.type || 'unknown'
    }));

    return enhancedSessions;

  } catch (error) {
    console.error('listScheduledSessions error:', error);
    return [];
  }
}

/**
 * Parse time string in HH:mm format
 * @param {string} timeStr - Time string in HH:mm format
 * @returns {Object} Object with hour and minute properties
 */
function parseTime(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') {
    throw new Error('Time string is required');
  }
  
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    throw new Error('Time must be in HH:mm format');
  }
  
  const hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  
  if (hour < 0 || hour > 23) {
    throw new Error('Hour must be between 0 and 23');
  }
  
  if (minute < 0 || minute > 59) {
    throw new Error('Minute must be between 0 and 59');
  }
  
  return { hour, minute };
}

/**
 * Create recurring sessions from a weekly pattern
 * @param {Object} params - Parameters object
 * @param {string} params.planId - Plan ID
 * @param {string} params.startDate - Start date in YYYY-MM-DD format
 * @param {string} params.timezone - Timezone string (e.g., 'Europe/Berlin')
 * @param {number} params.weeks - Number of weeks to generate
 * @param {Array} params.pattern - Array of pattern items { weekday: 0-6, time: "HH:mm", title?: string, notes?: string }
 * @returns {Promise<Object>} Result object with created sessions
 */
export async function createRecurringSessions({ planId, startDate, timezone, weeks, pattern }) {
  try {
    const supabase = await supabaseServerWithCookies();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Validation
    if (!planId) {
      throw new Error('Plan ID is required');
    }

    if (!startDate || typeof startDate !== 'string') {
      throw new Error('Start date is required and must be a string');
    }

    if (!timezone || typeof timezone !== 'string') {
      throw new Error('Timezone is required');
    }

    if (!weeks || typeof weeks !== 'number' || weeks < 1 || weeks > 52) {
      throw new Error('Weeks must be a number between 1 and 52');
    }

    if (!Array.isArray(pattern) || pattern.length === 0) {
      throw new Error('Pattern must be a non-empty array');
    }

    // Verify plan belongs to user
    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("id, name, type")
      .eq("id", planId)
      .eq("user_id", user.id)
      .single();

    if (planError || !plan) {
      throw new Error('Plan not found or access denied');
    }

    // Validate pattern items
    for (const item of pattern) {
      if (typeof item.weekday !== 'number' || item.weekday < 0 || item.weekday > 6) {
        throw new Error('Weekday must be between 0 (Sunday) and 6 (Saturday)');
      }
      
      if (!item.time || typeof item.time !== 'string') {
        throw new Error('Time is required for each pattern item');
      }
      
      // Validate time format
      parseTime(item.time);
    }

    const createdSessions = [];
    const errors = [];

    // Generate sessions for each week
    for (let week = 0; week < weeks; week++) {
      for (const patternItem of pattern) {
        try {
          // Calculate the date for this week and weekday
          const startDateObj = new Date(startDate + 'T00:00:00');
          const targetDate = new Date(startDateObj);
          
          // Add weeks
          targetDate.setDate(targetDate.getDate() + (week * 7));
          
          // Find the next occurrence of the target weekday
          const currentWeekday = targetDate.getDay();
          const daysToAdd = (patternItem.weekday - currentWeekday + 7) % 7;
          targetDate.setDate(targetDate.getDate() + daysToAdd);
          
          // Parse time
          const { hour, minute } = parseTime(patternItem.time);
          
          // Create session datetime in the specified timezone
          const sessionDate = new Date(targetDate);
          sessionDate.setHours(hour, minute, 0, 0);
          
          // Convert to ISO string (this will be in local time, but we store it as-is)
          const scheduledAtIso = sessionDate.toISOString();
          
          // Generate session name
          const sessionName = patternItem.title || 
            (plan.type === 'strength' ? 'Strength Training' : 'Endurance Training');
          
          // Create session
          try {
            const { data: newSession, error: sessionError } = await supabase
              .from("sessions")
              .insert({
                plan_id: planId,
                name: sessionName,
                type: plan.type,
                scheduled_at: scheduledAtIso,
                duration_min: 60, // Default 60 minutes
                timezone: timezone,
                meta: {
                  source: 'plan-autogen',
                  week: week + 1,
                  weekday: patternItem.weekday,
                  time: patternItem.time,
                  notes: patternItem.notes || null
                }
              })
              .select('id, name, scheduled_at, type')
              .single();

            if (sessionError) {
              const normalizedError = normalizeDbError(sessionError);
              errors.push(`Week ${week + 1}, ${patternItem.time}: ${normalizedError.message}`);
            } else {
              createdSessions.push(newSession);
            }
          } catch (insertError) {
            const normalizedError = normalizeDbError(insertError);
            console.warn('Session insert error:', normalizedError.message);
            errors.push(`Week ${week + 1}, ${patternItem.time}: ${normalizedError.message}`);
          }
          
        } catch (itemError) {
          errors.push(`Week ${week + 1}, ${patternItem.time}: ${itemError.message}`);
        }
      }
    }

    // If we have any hard errors (no sessions created), throw
    if (createdSessions.length === 0 && errors.length > 0) {
      throw new Error(`Failed to create any sessions: ${errors.join('; ')}`);
    }

    return {
      success: true,
      message: `Created ${createdSessions.length} sessions successfully`,
      sessions: createdSessions,
      errors: errors.length > 0 ? errors : null
    };

  } catch (error) {
    console.error('createRecurringSessions error:', error);
    return {
      success: false,
      message: error.message || 'Failed to create recurring sessions'
    };
  }
}
