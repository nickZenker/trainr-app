"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServerWithCookies } from "@/lib/supabaseServer";
import { z } from "zod";
import { logApiError, handleValidationError } from "@/lib/api-utils";

// Validation schemas
const SessionIdSchema = z.string().uuid("Invalid Session ID format");

const DeleteSessionSchema = z.object({
  sessionId: SessionIdSchema
});

/**
 * Delete a session permanently
 * @param {FormData} formData - Form data containing sessionId
 */
export async function deleteSession(formData) {
  try {
    const supabase = await supabaseServerWithCookies();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      redirect("/auth/login");
    }

    const rawData = {
      sessionId: formData.get("sessionId")
    };

    // Validate input
    const validation = DeleteSessionSchema.safeParse(rawData);
    if (!validation.success) {
      const error = handleValidationError(validation.error);
      throw new Error(error.message);
    }

    const { sessionId } = validation.data;

    // Verify session belongs to user through plan relationship
    const { data: existingSession, error: fetchError } = await supabase
      .from("sessions")
      .select(`
        id, 
        name,
        plans!inner(user_id)
      `)
      .eq("id", sessionId)
      .eq("plans.user_id", user.id)
      .single();

    if (fetchError || !existingSession) {
      logApiError("deleteSession.fetch", fetchError, { userId: user.id, sessionId });
      throw new Error("Session not found or access denied");
    }

    // Delete session (cascade will handle related session_exercises, set_schemas, etc.)
    const { error: deleteError } = await supabase
      .from("sessions")
      .delete()
      .eq("id", sessionId);

    if (deleteError) {
      logApiError("deleteSession.delete", deleteError, { userId: user.id, sessionId });
      throw new Error("Failed to delete session");
    }

    // Revalidate the sessions page
    revalidatePath("/app/sessions");
    
    return { 
      success: true, 
      message: `Session "${existingSession.name}" deleted successfully` 
    };

  } catch (error) {
    logApiError("deleteSession", error);
    return { 
      success: false, 
      message: error.message || "An error occurred while deleting the session" 
    };
  }
}

/**
 * Get sessions statistics for the current user
 * @returns {object} Statistics object
 */
export async function getSessionsStats() {
  try {
    const supabase = await supabaseServerWithCookies();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      redirect("/auth/login");
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
      logApiError("getSessionsStats", error, { userId: user.id });
      throw new Error("Failed to fetch sessions statistics");
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
      logApiError("getSessionsStats.exercises", exerciseError, { userId: user.id });
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
    logApiError("getSessionsStats", error);
    return {
      totalSessions: 0,
      strengthSessions: 0,
      cardioSessions: 0,
      totalExercises: 0
    };
  }
}
