import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { z } from "zod";

// Validation schemas
const LiveSessionUpdateSchema = z.object({
  status: z.enum(["active", "paused", "completed"], "Invalid status").optional(),
  finished_at: z.string().datetime("Invalid datetime format").optional(),
  duration_sec: z.number().int().min(0, "Duration cannot be negative").optional()
});

function logError(operation, error, userId = null) {
  console.error(`API Error [${operation}]:`, {
    message: error.message,
    code: error.code,
    details: error.details,
    userId,
    timestamp: new Date().toISOString()
  });
}

// GET /api/live-sessions/[id] - Get specific live session
export async function GET(request, { params }) {
  try {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Validate ID format
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json({ 
        error: "Invalid live session ID format" 
      }, { status: 400 });
    }

    const { data: liveSession, error } = await supabase
      .from("live_sessions")
      .select(`
        *,
        sessions (
          id,
          name,
          type,
          session_exercises (
            id,
            exercise_id,
            selected_variant,
            notes,
            order_index,
            exercises (
              id,
              name,
              muscle_primary,
              equipment
            ),
            set_schemas (
              id,
              variant,
              set_index,
              planned_reps,
              planned_weight,
              rir_or_rpe
            )
          )
        ),
        set_logs (
          id,
          session_exercise_id,
          variant,
          set_index,
          actual_reps,
          actual_weight,
          rpe,
          notes,
          auto_progression_applied,
          created_at
        ),
        cardio_logs (
          id,
          distance_m,
          duration_sec,
          avg_hr,
          avg_pace,
          calories,
          created_at
        )
      `)
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      logError("GET /api/live-sessions/[id]", error, user.id);
      return NextResponse.json({ 
        error: "Failed to fetch live session",
        details: error.message 
      }, { status: 500 });
    }

    if (!liveSession) {
      return NextResponse.json({ 
        error: "Live session not found or access denied" 
      }, { status: 404 });
    }

    return NextResponse.json({ liveSession });
  } catch (error) {
    logError("GET /api/live-sessions/[id]", error);
    return NextResponse.json({ 
      error: "Internal server error",
      code: "UNKNOWN_ERROR"
    }, { status: 500 });
  }
}

// PUT /api/live-sessions/[id] - Update live session (finish, pause, etc.)
export async function PUT(request, { params }) {
  try {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    
    // Validate ID format
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json({ 
        error: "Invalid live session ID format" 
      }, { status: 400 });
    }

    const body = await request.json();
    
    // Validate input
    const validation = LiveSessionUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: "Validation failed",
        details: validation.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }

    const { status, finished_at, duration_sec } = validation.data;

    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (finished_at !== undefined) updateData.finished_at = finished_at;
    if (duration_sec !== undefined) updateData.duration_sec = duration_sec;

    // Don't allow empty updates
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ 
        error: "No valid fields provided for update" 
      }, { status: 400 });
    }

    const { data: liveSession, error } = await supabase
      .from("live_sessions")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      logError("PUT /api/live-sessions/[id]", error, user.id);
      return NextResponse.json({ 
        error: "Failed to update live session",
        details: error.message 
      }, { status: 500 });
    }

    if (!liveSession) {
      return NextResponse.json({ 
        error: "Live session not found or access denied" 
      }, { status: 404 });
    }

    return NextResponse.json({ liveSession });
  } catch (error) {
    logError("PUT /api/live-sessions/[id]", error);
    return NextResponse.json({ 
      error: "Internal server error",
      code: "UNKNOWN_ERROR"
    }, { status: 500 });
  }
}